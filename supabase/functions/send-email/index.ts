// Supabase Edge Function: sends a customer email for one step of the order flow.
//
// Called from the app with supabase.functions.invoke('send-email', { body }).
// body: { event, enquiryId?, rfqId?, quoteId? }
//
// The email content is never taken from the browser. The function loads the
// request, quote, sample, dispatch or invoice from the database itself, so a
// caller can only trigger a real update, not write their own email.
//
// Secrets (supabase secrets set ...). Option A, your own mailbox over SMTP (e.g. Hostinger Email):
//   SMTP_HOST        e.g. smtp.hostinger.com   (when set, SMTP is used instead of Resend)
//   SMTP_PORT        465 (default; Supabase blocks 25 and 587)
//   SMTP_USER        the full mailbox address, e.g. orders@ksmgtextiles.com
//   SMTP_PASS        that mailbox's password
// Option B, Resend:
//   RESEND_API_KEY   API key from resend.com (if missing, emails are logged as "skipped")
// Both:
//   EMAIL_FROM       e.g.  KSMG Global <orders@ksmgtextiles.com>  (for SMTP it must be the SMTP_USER address)
//   EMAIL_REPLY_TO   optional, e.g. sales@ksmgtextiles.com
//   EMAIL_BCC        optional, a sales inbox that gets a copy of every customer email
//   SITE_URL         e.g. https://www.ksmgtextiles.com  (used for the "My requests" button)
// SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.

import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import nodemailer from 'npm:nodemailer@6.9.16';
import { buildEmail, EVENTS, STATUS_MESSAGES } from '../_shared/emailTemplates.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const STAFF_ROLES = ['sales', 'super_admin'];
const STAFF_EVENTS = ['quote_sent', 'sample_sent', 'invoice_uploaded', 'dispatched', 'status_changed'];

const reply = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const env = (k: string) => Deno.env.get(k) ?? '';

// Projects on the new API keys get SUPABASE_SECRET_KEYS / SUPABASE_PUBLISHABLE_KEYS
// (JSON maps of name -> key); older projects get the legacy JWT keys.
function pickKey(jsonVar: string, legacyVar: string) {
  try {
    const keys = JSON.parse(env(jsonVar) || '{}');
    const key = keys.default ?? Object.values(keys)[0];
    if (typeof key === 'string' && key) return key;
  } catch { /* fall back to the legacy key */ }
  return env(legacyVar);
}

type Mail = { to: string; subject: string; html: string; text: string };

// Sends through your own mailbox (e.g. Hostinger Email) over SMTP.
// Supabase blocks outgoing ports 25 and 587, so use port 465 (SSL).
async function sendViaSmtp(mail: Mail) {
  const from = env('EMAIL_FROM') || env('SMTP_USER');
  try {
    const transport = nodemailer.createTransport({
      host: env('SMTP_HOST'),
      port: Number(env('SMTP_PORT') || 465),
      secure: true,
      auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
    });
    const info = await transport.sendMail({
      from, to: mail.to, subject: mail.subject, html: mail.html, text: mail.text,
      replyTo: env('EMAIL_REPLY_TO') || undefined,
      bcc: env('EMAIL_BCC') || undefined,
    });
    return { status: 'sent', providerId: info?.messageId ?? null };
  } catch (err) {
    return { status: 'failed', error: `SMTP error: ${(err as Error).message}` };
  }
}

// SMTP is used when SMTP_HOST is set, otherwise Resend.
function sendMail(mail: Mail) {
  if (env('SMTP_HOST')) {
    if (!env('SMTP_USER') || !env('SMTP_PASS')) {
      return Promise.resolve({ status: 'skipped', error: 'Email is not set up yet (SMTP_USER or SMTP_PASS missing).' });
    }
    return sendViaSmtp(mail);
  }
  return sendViaResend(mail);
}

async function sendViaResend(mail: Mail) {
  const key = env('RESEND_API_KEY');
  const from = env('EMAIL_FROM');
  if (!key || !from) return { status: 'skipped', error: 'Email is not set up yet (set SMTP_HOST/SMTP_USER/SMTP_PASS, or RESEND_API_KEY and EMAIL_FROM).' };

  const payload: Record<string, unknown> = { from, to: [mail.to], subject: mail.subject, html: mail.html, text: mail.text };
  if (env('EMAIL_REPLY_TO')) payload.reply_to = env('EMAIL_REPLY_TO');
  if (env('EMAIL_BCC')) payload.bcc = [env('EMAIL_BCC')];

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) return { status: 'failed', error: `Resend ${res.status}: ${out?.message ?? 'unknown error'}` };
    return { status: 'sent', providerId: out?.id ?? null };
  } catch (err) {
    return { status: 'failed', error: `Could not reach Resend: ${(err as Error).message}` };
  }
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return reply(405, { error: 'Method not allowed' });

  const url = env('SUPABASE_URL');
  const userClient = createClient(url, pickKey('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY'), {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    auth: { persistSession: false },
  });
  const { data: auth } = await userClient.auth.getUser();
  const user = auth?.user;
  if (!user) return reply(401, { error: 'Please log in.' });

  const db = createClient(url, pickKey('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });

  let body: { event?: string; enquiryId?: string; rfqId?: string; quoteId?: string };
  try { body = await req.json(); } catch { return reply(400, { error: 'Invalid request.' }); }
  const event = body.event ?? '';
  if (!EVENTS.includes(event)) return reply(400, { error: 'Unknown event.' });

  // Load the request
  let enquiryQuery;
  if (body.enquiryId) enquiryQuery = db.from('enquiries').select('*').eq('id', body.enquiryId);
  else if (body.rfqId) enquiryQuery = db.from('enquiries').select('*').eq('rfq_id', body.rfqId);
  else return reply(400, { error: 'enquiryId or rfqId is required.' });
  let { data: enquiry, error: enqErr } = await enquiryQuery.maybeSingle();
  // submit_enquiry returns the reference shown to the customer; if that turns out
  // to be the row id rather than the RFQ number, look it up by id instead.
  if (!enquiry && !enqErr && body.rfqId && /^[0-9a-f-]{36}$/i.test(body.rfqId)) {
    ({ data: enquiry, error: enqErr } = await db.from('enquiries').select('*').eq('id', body.rfqId).maybeSingle());
  }
  if (enqErr) {
    console.error('enquiry load failed', enqErr);
    return reply(500, { error: `Could not load the request: ${enqErr.message}` });
  }
  if (!enquiry) return reply(404, { error: 'Request not found.' });

  // Who may trigger what
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  const isStaff = STAFF_ROLES.includes(profile?.role);
  if (STAFF_EVENTS.includes(event) && !isStaff) return reply(403, { error: 'Not allowed.' });
  if (event === 'request_received' && !isStaff && enquiry.user_id !== user.id) return reply(403, { error: 'Not allowed.' });

  const log = async (row: Record<string, unknown>) => {
    const { error } = await db.from('email_log').insert({
      enquiry_id: String(enquiry.id), rfq_id: enquiry.rfq_id, event, sent_by: user.id, ...row,
    });
    if (error) console.error('email_log insert failed', error.message);
  };
  const skip = async (reason: string) => {
    await log({ recipient: enquiry.email ?? '', subject: '', status: 'skipped', error: reason });
    return reply(200, { status: 'skipped', reason });
  };

  if (!enquiry.email) return skip('The request has no customer email address.');

  // Load what this email talks about
  const ctx: Record<string, unknown> = { enquiry, siteUrl: env('SITE_URL') };

  if (event === 'request_received') {
    const { count } = await db.from('email_log').select('id', { count: 'exact', head: true })
      .eq('enquiry_id', String(enquiry.id)).eq('event', 'request_received').eq('status', 'sent');
    if (count) return reply(200, { status: 'skipped', reason: 'Already sent.' });
  }

  if (event === 'quote_sent') {
    if (!body.quoteId) return reply(400, { error: 'quoteId is required.' });
    const { data: quote } = await db.from('quote_versions').select('*')
      .eq('id', body.quoteId).eq('enquiry_id', enquiry.id).maybeSingle();
    if (!quote) return reply(404, { error: 'Quote not found.' });
    if (!quote.sent_at) return reply(409, { error: 'This quote has not been sent to the customer.' });
    ctx.quote = quote;
  }

  if (event === 'sample_sent') {
    const { data } = await db.from('samples').select('*').eq('enquiry_id', enquiry.id)
      .order('sent_at', { ascending: false }).limit(1);
    if (!data?.length) return reply(404, { error: 'No sample found.' });
    ctx.sample = data[0];
  }

  if (event === 'dispatched') {
    const { data } = await db.from('dispatches').select('*').eq('enquiry_id', enquiry.id)
      .order('sent_at', { ascending: false }).limit(1);
    if (!data?.length) return reply(404, { error: 'No dispatch found.' });
    ctx.dispatch = data[0];
  }

  if (event === 'invoice_uploaded') {
    const { data } = await db.from('invoices').select('*').eq('enquiry_id', enquiry.id)
      .order('created_at', { ascending: false }).limit(1);
    if (!data?.length) return reply(404, { error: 'No invoice found.' });
    ctx.invoice = data[0];
  }

  if (event === 'status_changed' && !STATUS_MESSAGES[enquiry.status]) {
    return skip(`No customer email for status "${enquiry.status}".`);
  }

  let mail;
  try { mail = buildEmail(event, ctx); }
  catch (err) { return reply(500, { error: (err as Error).message }); }

  const result: { status: string; providerId?: string | null; error?: string } = await sendMail({ to: enquiry.email, ...mail });
  await log({
    recipient: enquiry.email, subject: mail.subject, status: result.status,
    provider_id: (result as { providerId?: string }).providerId ?? null, error: result.error ?? null,
  });

  if (result.status === 'sent') return reply(200, { status: 'sent', to: enquiry.email });
  if (result.status === 'skipped') return reply(200, { status: 'skipped', reason: result.error });
  return reply(502, { status: 'failed', error: result.error });
});

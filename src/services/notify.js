import { supabase } from './supabase.js';

// Asks the send-email Edge Function to email the customer about a step.
// Never throws: the action itself is already saved, so a mail problem must not
// look like the action failed. Returns { ok, message } for the screen.
export async function notifyCustomer(event, payload) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', { body: { event, ...payload } });
    if (error) {
      let detail = '';
      try { detail = (await error.context?.json())?.error || ''; } catch { /* no JSON body */ }
      return { ok: false, message: `Saved, but the customer email was not sent${detail ? `: ${detail}` : '.'}` };
    }
    if (data?.status === 'sent') return { ok: true, message: `Email sent to ${data.to}.` };
    if (data?.status === 'skipped') return { ok: true, message: `No email sent: ${data.reason}` };
    return { ok: false, message: 'Saved, but the customer email was not sent.' };
  } catch {
    return { ok: false, message: 'Saved, but the customer email was not sent.' };
  }
}

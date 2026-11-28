// Customer email templates. Plain JavaScript with no Deno or browser APIs, so the
// Edge Function and the unit tests (tests/emailTemplates.test.js) can both import it.
//
// buildEmail(event, ctx) -> { subject, html, text }
// ctx: { enquiry, quote, sample, dispatch, invoice, siteUrl, company }
// Row objects are raw database rows (snake_case), as the Edge Function loads them.

export const COMPANY = {
  name: 'KSMG Global Private Limited',
  short: 'KSMG Global',
  tagline: 'Uniforms and workwear',
  address: 'Uppal and Kondapur, Hyderabad, Telangana',
  phone: '+91 98-9628 9628',
  email: 'info@ksmgtextiles.com',
};

export const EVENTS = ['request_received', 'quote_sent', 'sample_sent', 'invoice_uploaded', 'dispatched', 'status_changed'];

// What the customer is told when sales moves the request to each status by hand.
// 'New' is the starting status, so it never sends an email.
export const STATUS_MESSAGES = {
  'In review': {
    lead: 'Our sales team is now reviewing your request.',
    body: 'We are checking the fabric, sizes and quantity you asked for and will send you a detailed quotation shortly.',
  },
  Quoted: {
    lead: 'A quotation for your request is ready.',
    body: 'Please log in to review it. You can accept it or ask us for changes.',
  },
  Accepted: {
    lead: 'Thank you for accepting our quotation.',
    body: 'Our team will contact you about the next step: a sample for your approval, or your purchase order.',
  },
  'Sample sent': {
    lead: 'Your sample is on its way.',
    body: 'Once it reaches you, please log in to approve it or tell us what you would like changed.',
  },
  'Sample changes': {
    lead: 'We have noted the changes you asked for on the sample.',
    body: 'Our team is preparing a revised sample and will update you when it is sent.',
  },
  'Sample approved': {
    lead: 'Thank you for approving the sample.',
    body: 'Please upload your purchase order on the website so that we can begin production.',
  },
  'PO received': {
    lead: 'We have received your purchase order.',
    body: 'Thank you for your order. Production planning has started and we will keep you updated at every step.',
  },
  'In production': {
    lead: 'Your order is now in production.',
    body: 'Our factory team has started making your garments. We will let you know when they move to quality check.',
  },
  'Quality check': {
    lead: 'Your order is in quality check.',
    body: 'Production is complete and every piece is being checked before packing and dispatch.',
  },
  Dispatched: {
    lead: 'Your order has been dispatched.',
    body: 'Please log in to see the courier and tracking details.',
  },
  Delivered: {
    lead: 'Your order has been delivered.',
    body: 'We hope everything meets your expectations. Please log in to confirm receipt and rate your order; your feedback helps us serve you better.',
  },
  Closed: {
    lead: 'Your request is now closed.',
    body: 'Thank you for choosing us. Your quotation, invoices and order history remain available when you log in.',
  },
};

export function escapeHtml(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const money = n => `Rs ${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const day = v => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
};

const quoteTotals = q => {
  const sub = Number(q.unit_price) * Number(q.quantity);
  const tax = sub * Number(q.gst_percent) / 100;
  return { sub, tax, total: sub + tax };
};

// ------------------------------------------------------------------ content per event
// Each returns { subject, preheader, lead, paragraphs[], rows[[label, value]], cta }

function content(event, ctx) {
  const e = ctx.enquiry;
  const rfq = e.rfq_id;
  const product = e.product_name || 'Uniform garments';
  const base = [['Request number', rfq], ['Product', product]];

  switch (event) {
    case 'request_received':
      return {
        subject: `We have received your request ${rfq}`,
        preheader: `Thank you for contacting ${COMPANY.short}. Your request number is ${rfq}.`,
        lead: 'Thank you for your enquiry. We have received your request.',
        paragraphs: [
          'Our sales team will review the details and send you a quotation, usually within one working day.',
          'You can follow the progress of your request at any time by logging in to our website.',
        ],
        rows: [
          ...base,
          ...(e.quantity ? [['Quantity', String(e.quantity)]] : []),
          ...(e.needed_by ? [['Needed by', day(e.needed_by)]] : []),
        ],
        cta: 'Track your request',
      };

    case 'quote_sent': {
      const q = ctx.quote;
      const t = quoteTotals(q);
      return {
        subject: `Quotation for ${rfq} (version ${q.version}) from ${COMPANY.short}`,
        preheader: `Your quotation total is ${money(t.total)} including GST.`,
        lead: 'Thank you for your interest. Please find our quotation for your request below.',
        paragraphs: [
          'You can review the full quotation, download it as a PDF, and accept it or ask for changes by logging in to our website.',
          ...(q.notes ? [`Note from our sales team: ${q.notes}`] : []),
        ],
        rows: [
          ['Request number', `${rfq} / version ${q.version}`],
          ['Product', product],
          ['Price per piece', money(q.unit_price)],
          ['Quantity', String(q.quantity)],
          ['Subtotal', money(t.sub)],
          [`GST (${Number(q.gst_percent)}%)`, money(t.tax)],
          ['Total', money(t.total)],
          ...(q.valid_until ? [['Valid until', day(q.valid_until)]] : []),
        ],
        strongRow: 'Total',
        cta: 'Review and accept the quotation',
      };
    }

    case 'sample_sent':
      return {
        subject: `Your sample for ${rfq} has been sent`,
        preheader: 'Your sample is on its way. Please approve it or ask for changes once it arrives.',
        lead: 'We are pleased to let you know that your sample has been sent.',
        paragraphs: [
          'Once it reaches you, please check the fabric, colour, fit and finish.',
          'Then log in to approve the sample or tell us what you would like changed.',
          ...(ctx.sample?.note ? [`Note from our team: ${ctx.sample.note}`] : []),
        ],
        rows: [...base, ['Sent on', day(ctx.sample?.sent_at)]],
        cta: 'Approve or request changes',
      };

    case 'invoice_uploaded': {
      const inv = ctx.invoice;
      return {
        subject: `Invoice ${inv.invoice_number} for your order ${rfq}`,
        preheader: `Invoice ${inv.invoice_number} is ready to download.`,
        lead: 'The invoice for your order is now available.',
        paragraphs: [
          'For your security, invoices are not attached to emails. Please log in to our website to view and download it.',
          'If you have any questions about the invoice, simply reply to this email.',
        ],
        rows: [...base, ['Invoice number', inv.invoice_number], ['Invoice date', day(inv.created_at)]],
        cta: 'Download your invoice',
      };
    }

    case 'dispatched': {
      const d = ctx.dispatch;
      return {
        subject: `Your order ${rfq} has been dispatched`,
        preheader: `Shipped with ${d.courier}${d.tracking_no ? `, tracking number ${d.tracking_no}` : ''}.`,
        lead: 'Good news: your order has been dispatched.',
        paragraphs: [
          'You can use the tracking number below on the courier website to follow your shipment.',
          ...(d.note ? [`Note from our team: ${d.note}`] : []),
          'When your order arrives, please log in and confirm that you received it.',
        ],
        rows: [
          ...base,
          ['Courier', d.courier],
          ...(d.tracking_no ? [['Tracking number', d.tracking_no]] : []),
          ['Dispatched on', day(d.sent_at)],
        ],
        cta: 'View order status',
      };
    }

    case 'status_changed': {
      const status = e.status;
      const m = STATUS_MESSAGES[status];
      return {
        subject: `Update on your request ${rfq}: ${status}`,
        preheader: m.lead,
        lead: m.lead,
        paragraphs: [m.body],
        rows: [...base, ['Current status', status]],
        cta: 'View your request',
      };
    }

    default:
      throw new Error(`Unknown email event: ${event}`);
  }
}

// ------------------------------------------------------------------ layout

const NAVY = '#0a1330';
const GOLD = '#c9a24b';

function renderHtml(c, ctx) {
  const name = escapeHtml(ctx.enquiry.name || 'Customer');
  const link = ctx.siteUrl ? `${ctx.siteUrl.replace(/\/+$/, '')}/my-requests` : '';
  const rows = c.rows.map(([k, v]) => {
    const strong = k === c.strongRow;
    return `<tr>
<td style="padding:9px 14px;border-bottom:1px solid #ece8df;color:#5b6170;font-size:14px;width:45%;">${escapeHtml(k)}</td>
<td style="padding:9px 14px;border-bottom:1px solid #ece8df;color:${NAVY};font-size:${strong ? 16 : 14}px;font-weight:${strong ? 700 : 600};text-align:right;">${escapeHtml(v)}</td>
</tr>`;
  }).join('');
  const paras = c.paragraphs.map(p =>
    `<p style="margin:0 0 14px;color:#33384a;font-size:15px;line-height:1.6;">${escapeHtml(p)}</p>`).join('');
  const button = link ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 22px;"><tr>
<td style="background:${NAVY};border-radius:6px;">
<a href="${escapeHtml(link)}" style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(c.cta)}</a>
</td></tr></table>` : '';

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(c.subject)}</title></head>
<body style="margin:0;padding:0;background:#f4f1ea;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(c.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
<tr><td style="background:${NAVY};padding:22px 28px;">
<div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:.3px;">${escapeHtml(COMPANY.short)}</div>
<div style="color:${GOLD};font-size:12px;margin-top:3px;">${escapeHtml(COMPANY.tagline)}</div>
</td></tr>
<tr><td style="padding:28px 28px 8px;">
<p style="margin:0 0 14px;color:#33384a;font-size:15px;">Dear ${name},</p>
<p style="margin:0 0 14px;color:${NAVY};font-size:17px;font-weight:700;line-height:1.45;">${escapeHtml(c.lead)}</p>
${paras}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ece8df;border-radius:8px;border-collapse:separate;margin:6px 0 22px;">${rows}</table>
${button}
<p style="margin:0 0 4px;color:#33384a;font-size:15px;">Warm regards,</p>
<p style="margin:0 0 24px;color:#33384a;font-size:15px;"><strong>Sales Team</strong><br>${escapeHtml(COMPANY.name)}</p>
</td></tr>
<tr><td style="background:#faf8f3;border-top:1px solid #ece8df;padding:16px 28px;color:#7a7f8c;font-size:12px;line-height:1.6;">
${escapeHtml(COMPANY.name)} | ${escapeHtml(COMPANY.address)}<br>
Phone: ${escapeHtml(COMPANY.phone)} | Email: <a href="mailto:${COMPANY.email}" style="color:#7a7f8c;">${COMPANY.email}</a><br>
You are receiving this email about your request ${escapeHtml(ctx.enquiry.rfq_id)}.
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function renderText(c, ctx) {
  const link = ctx.siteUrl ? `${ctx.siteUrl.replace(/\/+$/, '')}/my-requests` : '';
  const width = Math.max(...c.rows.map(([k]) => k.length));
  return [
    `Dear ${ctx.enquiry.name || 'Customer'},`,
    '',
    c.lead,
    '',
    ...c.paragraphs.flatMap(p => [p, '']),
    ...c.rows.map(([k, v]) => `${k.padEnd(width)} : ${v}`),
    '',
    ...(link ? [`${c.cta}: ${link}`, ''] : []),
    'Warm regards,',
    'Sales Team',
    COMPANY.name,
    `${COMPANY.phone} | ${COMPANY.email}`,
  ].join('\n');
}

export function buildEmail(event, ctx) {
  if (!ctx?.enquiry?.rfq_id) throw new Error('Email needs an enquiry with rfq_id.');
  if (event === 'quote_sent' && !ctx.quote) throw new Error('quote_sent needs a quote.');
  if (event === 'dispatched' && !ctx.dispatch) throw new Error('dispatched needs a dispatch.');
  if (event === 'invoice_uploaded' && !ctx.invoice) throw new Error('invoice_uploaded needs an invoice.');
  if (event === 'status_changed' && !STATUS_MESSAGES[ctx.enquiry.status]) {
    throw new Error(`No customer email for status "${ctx.enquiry.status}".`);
  }
  const c = content(event, ctx);
  return { subject: c.subject, html: renderHtml(c, ctx), text: renderText(c, ctx) };
}

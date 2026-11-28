import { describe, it, expect } from 'vitest';
import { buildEmail, EVENTS, STATUS_MESSAGES, escapeHtml } from '../../supabase/functions/_shared/emailTemplates.js';

const enquiry = {
  id: 'e1', rfq_id: 'RFQ-2026-0015', name: 'Avula Aswini', email: 'aswini@example.com',
  product_name: 'Test shirt (sample)', quantity: 20, needed_by: '2026-12-20', status: 'In production',
};
const ctx = {
  enquiry,
  siteUrl: 'https://ksmg.example/',
  quote: { version: 1, unit_price: 450, quantity: 20, gst_percent: 5, valid_until: '2026-12-31', notes: 'Delivery 15 days after PO' },
  sample: { note: 'Sent by DTDC', sent_at: '2026-11-27T10:00:00Z' },
  dispatch: { courier: 'DTDC', tracking_no: 'D12345678', note: '2 boxes', sent_at: '2026-12-10T10:00:00Z' },
  invoice: { invoice_number: 'KSMG/26-27/0045', created_at: '2026-12-10T09:00:00Z' },
};

describe('buildEmail', () => {
  it.each(EVENTS)('%s has subject, html and text with the RFQ number and link', event => {
    const m = buildEmail(event, ctx);
    expect(m.subject).toContain('RFQ-2026-0015');
    expect(m.html).toContain('Dear Avula Aswini,');
    expect(m.html).toContain('href="https://ksmg.example/my-requests"');
    expect(m.text).toContain('https://ksmg.example/my-requests');
    expect(m.text).toContain('Warm regards,');
  });

  it('quote email shows correct totals', () => {
    const m = buildEmail('quote_sent', ctx);
    expect(m.text).toContain('Rs 9,000.00');
    expect(m.text).toContain('Rs 450.00');
    expect(m.text).toContain('Rs 9,450.00');
    expect(m.subject).toBe('Quotation for RFQ-2026-0015 (version 1) from KSMG Global');
  });

  it('dispatch email shows courier and tracking number', () => {
    const m = buildEmail('dispatched', ctx);
    expect(m.html).toContain('DTDC');
    expect(m.html).toContain('D12345678');
  });

  it('invoice email does not attach the file and gives the invoice number', () => {
    const m = buildEmail('invoice_uploaded', ctx);
    expect(m.subject).toBe('Invoice KSMG/26-27/0045 for your order RFQ-2026-0015');
    expect(m.text).toContain('not attached');
  });

  it('every status except New has a message', () => {
    for (const s of ['In review', 'Quoted', 'Accepted', 'Sample sent', 'Sample changes', 'Sample approved',
      'PO received', 'In production', 'Quality check', 'Dispatched', 'Delivered', 'Closed']) {
      const m = buildEmail('status_changed', { ...ctx, enquiry: { ...enquiry, status: s } });
      expect(m.subject).toBe(`Update on your request RFQ-2026-0015: ${s}`);
      expect(m.html).toContain(escapeHtml(STATUS_MESSAGES[s].lead));
    }
    expect(() => buildEmail('status_changed', { ...ctx, enquiry: { ...enquiry, status: 'New' } })).toThrow();
  });

  it('escapes customer text so it cannot inject HTML', () => {
    const m = buildEmail('request_received', { ...ctx, enquiry: { ...enquiry, name: '<script>x</script>', product_name: '"><img src=x>' } });
    expect(m.html).not.toContain('<script>');
    expect(m.html).not.toContain('<img src=x>');
    expect(m.html).toContain('&lt;script&gt;');
  });

  it('works without a site URL (no button)', () => {
    const m = buildEmail('sample_sent', { ...ctx, siteUrl: '' });
    expect(m.html).not.toContain('/my-requests');
  });

  it('refuses events with missing data', () => {
    expect(() => buildEmail('quote_sent', { enquiry })).toThrow();
    expect(() => buildEmail('nope', ctx)).toThrow();
  });
});

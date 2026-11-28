import { jsPDF } from 'jspdf';

const money = n => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const day = t => new Date(t).toLocaleDateString('en-GB');

export function makeQuotePdf(enquiry, q) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const L = 15, R = 195;
  let y = 20;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.text('KSMG Global Private Limited', L, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  y += 6; doc.text('Uniforms and workwear | Uppal and Kondapur, Hyderabad', L, y);
  y += 5; doc.text('Phone: +91 98-9628 9628 | Email: info@ksmgtextiles.com', L, y);
  y += 4; doc.setDrawColor(10, 19, 48); doc.setLineWidth(0.6); doc.line(L, y, R, y);

  y += 10; doc.setFont('helvetica', 'bold'); doc.setFontSize(15);
  doc.text('QUOTATION', L, y);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(`Ref: ${enquiry.rfqId} / v${q.version}`, R, y - 5, { align: 'right' });
  doc.text(`Date: ${day(q.sentAt || q.createdAt)}`, R, y, { align: 'right' });
//   if (q.validUntil) doc.text(`Valid until: ${q.validUntil}`, R, y + 5, { align: 'right' });
  if (q.validUntil) doc.text(`Valid until: ${day(q.validUntil)}`, R, y + 5, { align: 'right' });

  y += 12; doc.setFont('helvetica', 'bold'); doc.text('Prepared for', L, y);
  doc.setFont('helvetica', 'normal');
  y += 5; doc.text(enquiry.name + (enquiry.organisation ? `, ${enquiry.organisation}` : ''), L, y);
  if (enquiry.email) { y += 5; doc.text(enquiry.email + (enquiry.phone ? ` | ${enquiry.phone}` : ''), L, y); }
  if (enquiry.location) { y += 5; doc.text(`Delivery: ${enquiry.location}`, L, y); }

  y += 12;
  doc.setFillColor(10, 19, 48); doc.rect(L, y, R - L, 8, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
  doc.text('Description', L + 2, y + 5.5);
  doc.text('Qty', 120, y + 5.5, { align: 'right' });
  doc.text('Unit price (Rs)', 155, y + 5.5, { align: 'right' });
  doc.text('Amount (Rs)', R - 2, y + 5.5, { align: 'right' });
  doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal');

  const sub = q.unitPrice * q.quantity;
  const tax = sub * q.gst / 100;
  y += 15;
  const desc = doc.splitTextToSize(enquiry.productName || 'Uniform garments', 85);
  doc.text(desc, L + 2, y);
  doc.text(String(q.quantity), 120, y, { align: 'right' });
  doc.text(money(q.unitPrice), 155, y, { align: 'right' });
  doc.text(money(sub), R - 2, y, { align: 'right' });
  y += Math.max(desc.length * 5, 5) + 3;
  doc.setDrawColor(200); doc.setLineWidth(0.2); doc.line(L, y, R, y);

  y += 8;
  doc.text('Subtotal', 155, y, { align: 'right' }); doc.text(money(sub), R - 2, y, { align: 'right' });
  y += 6;
  doc.text(`GST ${q.gst}%`, 155, y, { align: 'right' }); doc.text(money(tax), R - 2, y, { align: 'right' });
  y += 7; doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text('Total', 155, y, { align: 'right' }); doc.text(money(sub + tax), R - 2, y, { align: 'right' });

  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  if (q.notes) {
    y += 12; doc.setFont('helvetica', 'bold'); doc.text('Notes', L, y);
    doc.setFont('helvetica', 'normal');
    const n = doc.splitTextToSize(q.notes, R - L);
    y += 5; doc.text(n, L, y); y += n.length * 4.5;
  }

  y += 10; doc.setFont('helvetica', 'bold'); doc.text('Terms', L, y);
  doc.setFont('helvetica', 'normal');
  const terms = [
    'Prices are in Indian Rupees (INR). GST is shown separately.',
    'Fabric, delivery time and payment terms are confirmed by our sales team before the order.',
    'Designs from the Design Studio are conceptual previews and are reviewed before production.',
  ];
  terms.forEach(t => { y += 5; doc.text(`- ${t}`, L, y); });

  doc.save(`Quotation-${enquiry.rfqId}-v${q.version}.pdf`);
}

// "Label: ________" with an optional pre-filled value written on the line.
function blankLine(doc, label, x, yy, w, value = '') {
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text(label, x, yy);
  const lx = x + (label ? doc.getTextWidth(label) + 2 : 0);
  doc.setDrawColor(150); doc.setLineWidth(0.2); doc.line(lx, yy + 1, x + w, yy + 1);
  if (value) {
    const fit = doc.splitTextToSize(value, x + w - lx - 1)[0];
    doc.text(fit, lx + 1, yy);
  }
}

// Indian numbering: 9450.5 -> "Rupees Nine Thousand Four Hundred Fifty and Fifty Paise Only"
function amountInWords(n) {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
    'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = x => (x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? ` ${a[x % 10]}` : ''));
  const three = x => (x >= 100 ? `${a[Math.floor(x / 100)]} Hundred${x % 100 ? ` ${two(x % 100)}` : ''}` : two(x));
  const say = x => {
    if (x === 0) return 'Zero';
    const parts = [];
    const crore = Math.floor(x / 1e7); x %= 1e7;
    const lakh = Math.floor(x / 1e5); x %= 1e5;
    const thousand = Math.floor(x / 1e3); x %= 1e3;
    if (crore) parts.push(`${say(crore)} Crore`);
    if (lakh) parts.push(`${two(lakh)} Lakh`);
    if (thousand) parts.push(`${two(thousand)} Thousand`);
    if (x) parts.push(three(x));
    return parts.join(' ');
  };
  const total = Math.round(n * 100);
  const rupees = Math.floor(total / 100), paise = total % 100;
  return `Rupees ${say(rupees)}${paise ? ` and ${two(paise)} Paise` : ''} Only`;
}

// Tax invoice for the sales team, pre-filled from the enquiry, the accepted quote,
// the customer's PO and the dispatch. Blank lines are for details the app does not
// store (invoice number, GSTINs, HSN, place of supply); one tax option is ticked by hand.
export function makeInvoiceTemplatePdf(enquiry, q, po = null, dispatch = null) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const L = 15, R = 195, M = 105;
  const blank = (...a) => blankLine(doc, ...a);
  const B = () => doc.setFont('helvetica', 'bold');
  const N = () => doc.setFont('helvetica', 'normal');
  let y = 18;

  B(); doc.setFontSize(18); doc.text('KSMG Global Private Limited', L, y);
  N(); doc.setFontSize(9);
  y += 6; doc.text('Uniforms and workwear | Uppal and Kondapur, Hyderabad, Telangana', L, y);
  y += 5; doc.text('Phone: +91 98-9628 9628 | Email: info@ksmgtextiles.com', L, y);
  y += 6; blank('GSTIN:', L, y, 85); doc.text('State: Telangana (Code 36)', R, y, { align: 'right' });
  y += 4; doc.setDrawColor(10, 19, 48); doc.setLineWidth(0.6); doc.line(L, y, R, y);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(110);
  y += 5; doc.text('Template: fill in the blank lines, tick one tax option, sign, save as PDF and upload it on the website.', L, y);
  doc.setTextColor(0);

  y += 9; B(); doc.setFontSize(15); doc.text('TAX INVOICE', M, y, { align: 'center' });
  N(); doc.setFontSize(8); doc.text('Original for recipient', R, y, { align: 'right' });

  // Invoice facts (left) and references (right)
  y += 9; const top = y;
  blank('Invoice number:', L, y, M - L - 5);
  y += 7; blank('Invoice date:', L, y, M - L - 5);
  y += 7; blank('Place of supply (state, code):', L, y, M - L - 5);
  y += 7; blank('Reverse charge:', L, y, M - L - 5, 'No');
  let s = top;
  const poText = po ? `${po.poNumber || '(no number)'} dt ${day(po.createdAt)}` : '';
  blank('Customer PO:', M + 5, s, R - M - 5, poText);
  s += 7; blank('Our reference:', M + 5, s, R - M - 5, `${enquiry.rfqId} / Quote v${q.version}`);
  s += 7; blank('Dispatch:', M + 5, s, R - M - 5,
    dispatch ? [dispatch.courier, dispatch.trackingNo].filter(Boolean).join(', ') : '');
  s += 7; blank('Payment terms:', M + 5, s, R - M - 5);

  // Bill to / ship to
  y += 11; const t2 = y;
  B(); doc.setFontSize(10); doc.text('Bill to', L, y);
  y += 7; blank('Name:', L, y, M - L - 5, [enquiry.organisation, enquiry.name].filter(Boolean).join(', '));
  y += 7; blank('Address:', L, y, M - L - 5);
  y += 7; blank('', L, y, M - L - 5);
  y += 7; blank('GSTIN:', L, y, M - L - 5);
  y += 7; blank('Phone:', L, y, M - L - 5, enquiry.phone || '');
  y += 7; blank('Email:', L, y, M - L - 5, enquiry.email || '');
  s = t2; B(); doc.setFontSize(10); doc.text('Ship to', M + 5, s);
  s += 7; blank('Name:', M + 5, s, R - M - 5, enquiry.organisation || enquiry.name || '');
  s += 7; blank('Address:', M + 5, s, R - M - 5, enquiry.location || '');
  s += 7; blank('', M + 5, s, R - M - 5);
  s += 7; blank('Contact:', M + 5, s, R - M - 5, [enquiry.name, enquiry.phone].filter(Boolean).join(', '));

  // Items
  y += 11;
  doc.setFillColor(10, 19, 48); doc.rect(L, y, R - L, 8, 'F');
  doc.setTextColor(255, 255, 255); B(); doc.setFontSize(9);
  doc.text('No', L + 2, y + 5.5);
  doc.text('Description', L + 10, y + 5.5);
  doc.text('HSN', 103, y + 5.5);
  doc.text('Qty', 132, y + 5.5, { align: 'right' });
  doc.text('Rate (Rs)', 158, y + 5.5, { align: 'right' });
  doc.text('Taxable value (Rs)', R - 2, y + 5.5, { align: 'right' });
  doc.setTextColor(0, 0, 0); N();

  const sub = q.unitPrice * q.quantity;
  const tax = sub * q.gst / 100;
  y += 14;
  const desc = doc.splitTextToSize(enquiry.productName || 'Uniform garments', 75);
  doc.text('1', L + 2, y);
  doc.text(desc, L + 10, y);
  doc.setDrawColor(150); doc.setLineWidth(0.2); doc.line(103, y + 1, 118, y + 1);
  doc.text(`${q.quantity} Pcs`, 132, y, { align: 'right' });
  doc.text(money(q.unitPrice), 158, y, { align: 'right' });
  doc.text(money(sub), R - 2, y, { align: 'right' });
  y += Math.max(desc.length * 5, 5) + 2;
  doc.setDrawColor(200); doc.line(L, y, R, y);

  // Totals, with both tax options so the right one can be ticked
  const half = q.gst / 2;
  const row = (label, val) => { y += 6; doc.text(label, 158, y, { align: 'right' }); doc.text(val, R - 2, y, { align: 'right' }); };
  row('Taxable value', money(sub));
  y += 4;
  const box = (yy) => { doc.setDrawColor(80); doc.rect(L, yy - 3.2, 3.6, 3.6); };
  y += 6; box(y); doc.text('Same state (customer in Telangana):', L + 6, y);
  doc.text(`CGST ${half}% + SGST ${half}%`, 158, y, { align: 'right' });
  doc.text(`${money(tax / 2)} + ${money(tax / 2)}`, R - 2, y, { align: 'right' });
  y += 6; box(y); doc.text('Other state:', L + 6, y);
  doc.text(`IGST ${q.gst}%`, 158, y, { align: 'right' });
  doc.text(money(tax), R - 2, y, { align: 'right' });
  y += 8; B(); doc.setFontSize(11);
  doc.text('Invoice total', 158, y, { align: 'right' }); doc.text(money(sub + tax), R - 2, y, { align: 'right' });
  N(); doc.setFontSize(9);
  y += 8; B(); doc.text('Amount in words:', L, y); N();
  doc.text(amountInWords(sub + tax), L + 30, y);

  // Bank, terms, signature
  y += 10; B(); doc.text('Bank details', L, y);
  y += 7; blank('Bank / branch:', L, y, M - L - 5); blank('A/c no:', M + 5, y, R - M - 5);
  y += 7; blank('IFSC:', L, y, M - L - 5);
  y += 10; B(); doc.text('Terms', L, y); N();
  ['Goods once sold are taken back only for manufacturing defects reported within 7 days.',
    'Subject to Hyderabad jurisdiction.'].forEach(t => { y += 5; doc.text(`- ${t}`, L, y); });

  y += 14; B(); doc.text('For KSMG Global Private Limited', R, y, { align: 'right' });
  N(); doc.setDrawColor(150); doc.line(R - 60, y + 14, R, y + 14);
  doc.text('Authorised signatory', R, y + 19, { align: 'right' });

  doc.save(`Invoice-${enquiry.rfqId}.pdf`);
}

// Blank purchase order pre-filled from the accepted quote. The customer fills
// the empty lines, signs, stamps and uploads it back.
export function makePoTemplatePdf(enquiry, q) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const L = 15, R = 195, M = 105;
  let y = 18;
  const blank = (...a) => blankLine(doc, ...a);

  doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.text('PURCHASE ORDER', L, y);
  blank('PO number:', 130, 13, R - 130);
  blank('PO date:', 130, 20, R - 130);
  y += 6; doc.setDrawColor(10, 19, 48); doc.setLineWidth(0.6); doc.line(L, y, R, y);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(110);
  y += 5; doc.text('Template: fill in the blank lines, sign, add your company stamp and upload it on the website.', L, y);
  doc.setTextColor(0);

  // Buyer (left) and supplier (right)
  y += 8;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
  doc.text('Buyer (your company)', L, y);
  doc.text('Supplier', M + 5, y);
  const top = y;
  y += 7; blank('Company name:', L, y, M - L - 5);
  y += 7; blank('Address:', L, y, M - L - 5);
  y += 7; blank('', L, y, M - L - 5);
  y += 7; blank('GSTIN:', L, y, M - L - 5);
  y += 7; blank('Contact person:', L, y, M - L - 5);
  y += 7; blank('Phone:', L, y, M - L - 5);
  y += 7; blank('Email:', L, y, M - L - 5, enquiry.email || '');

  let s = top;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  ['KSMG Global Private Limited', 'Uppal and Kondapur, Hyderabad', 'Phone: +91 98-9628 9628', 'Email: info@ksmgtextiles.com']
    .forEach(t => { s += 7; doc.text(t, M + 5, s); });
  s += 10; doc.setFont('helvetica', 'bold'); doc.text('Against our quotation', M + 5, s);
  doc.setFont('helvetica', 'normal');
  s += 6; doc.text(`Ref: ${enquiry.rfqId} / v${q.version}`, M + 5, s);
  s += 5; doc.text(`Quotation date: ${day(q.sentAt || q.createdAt)}`, M + 5, s);

  // Items
  y += 12;
  doc.setFillColor(10, 19, 48); doc.rect(L, y, R - L, 8, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
  doc.text('Description', L + 2, y + 5.5);
  doc.text('Qty', 120, y + 5.5, { align: 'right' });
  doc.text('Unit price (Rs)', 155, y + 5.5, { align: 'right' });
  doc.text('Amount (Rs)', R - 2, y + 5.5, { align: 'right' });
  doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal');

  const sub = q.unitPrice * q.quantity;
  const tax = sub * q.gst / 100;
  y += 15;
  const desc = doc.splitTextToSize(enquiry.productName || 'Uniform garments', 85);
  doc.text(desc, L + 2, y);
  doc.text(String(q.quantity), 120, y, { align: 'right' });
  doc.text(money(q.unitPrice), 155, y, { align: 'right' });
  doc.text(money(sub), R - 2, y, { align: 'right' });
  y += Math.max(desc.length * 5, 5) + 3;
  doc.setDrawColor(200); doc.setLineWidth(0.2); doc.line(L, y, R, y);
  y += 8;
  doc.text('Subtotal', 155, y, { align: 'right' }); doc.text(money(sub), R - 2, y, { align: 'right' });
  y += 6;
  doc.text(`GST ${q.gst}%`, 155, y, { align: 'right' }); doc.text(money(tax), R - 2, y, { align: 'right' });
  y += 7; doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text('Total', 155, y, { align: 'right' }); doc.text(money(sub + tax), R - 2, y, { align: 'right' });

  // Delivery and terms
  y += 12; doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
  doc.text('Delivery and payment', L, y);
  y += 7; blank('Delivery address:', L, y, R - L, enquiry.location || '');
  y += 7; blank('', L, y, R - L);
  y += 7; blank('Deliver by (date):', L, y, M - L - 5, enquiry.neededBy ? day(enquiry.neededBy) : '');
  y += 7; blank('Payment terms:', L, y, R - L);
  y += 7; blank('Other instructions:', L, y, R - L);

  // Signature
  y += 18;
  doc.setDrawColor(150); doc.setLineWidth(0.2);
  doc.rect(M + 5, y - 6, R - M - 5, 30);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(110);
  doc.text('Company stamp', M + 5 + (R - M - 5) / 2, y + 10, { align: 'center' });
  doc.setTextColor(0); doc.setFontSize(9);
  blank('Authorised signatory:', L, y, M - L - 5);
  y += 8; blank('Name:', L, y, M - L - 5);
  y += 8; blank('Designation:', L, y, M - L - 5);
  y += 8; blank('Date:', L, y, M - L - 5);

  doc.save(`Purchase-Order-${enquiry.rfqId}.pdf`);
}
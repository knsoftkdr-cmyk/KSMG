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
  y += 6; doc.text('Uniforms and workwear | Boduppal and Kondapur, Hyderabad', L, y);
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
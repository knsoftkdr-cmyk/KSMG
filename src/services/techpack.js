import { jsPDF } from 'jspdf';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

// '/images/textures/oxford-001.jpg' -> 'Oxford 001'
const texName = u => {
  const f = (u || '').split('/').pop().replace(/\.[a-z]+$/i, '');
  return f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

// Load a swatch image as data URL (returns '' if it fails, PDF still works)
async function loadImg(url) {
  try {
    const r = await fetch(url.replace('/textures/', '/textures/thumbs/'));
    if (!r.ok) return '';
    const b = await r.blob();
    return await new Promise(res => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = () => res('');
      fr.readAsDataURL(b);
    });
  } catch { return ''; }
}

export async function downloadTechPack(d, industryName = '') {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const e = d.extra || {};
  const W = 210, L = 15;
  let y = 18;

  const line = () => { doc.setDrawColor(200); doc.line(L, y, W - L, y); y += 6; };
  const row = (label, value) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(label, L, y);
    doc.setFont('helvetica', 'normal'); doc.text(String(value || '-'), L + 45, y);
    y += 7;
  };
  const chip = async (label, colour, tex) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(label, L, y);
    const x = L + 45;
    let drawn = false;
    if (tex) {
      const img = await loadImg(tex);
      if (img) { try { doc.addImage(img, 'JPEG', x, y - 5, 8, 8); drawn = true; } catch { /* ignore */ } }
    }
    if (!drawn) {
      try { doc.setFillColor(colour || '#cccccc'); } catch { doc.setFillColor(200, 200, 200); }
      doc.rect(x, y - 5, 8, 8, 'F');
    }
    doc.setDrawColor(120); doc.rect(x, y - 5, 8, 8);
    doc.setFont('helvetica', 'normal');
    doc.text(tex ? `${texName(tex)} (fabric swatch)` : (colour || '-'), x + 12, y);
    y += 11;
  };

  // Header
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.text('KSMG Global - Tech Pack', L, y); y += 7;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(110);
  doc.text('Prasanna Reddy Garments | Conceptual design for technical review. Not a final production pattern.', L, y);
  doc.setTextColor(0); y += 6;
  line();

  // Design details
  row('Design name', d.name);
  row('Date', new Date().toLocaleDateString('en-IN'));
  row('Industry', industryName || d.industry);
  row('Garment', d.garment);
  row('Fabric', d.fabric);
  row('Pattern', d.pattern || 'Plain');
  row('Decoration', d.decoration);
  row('Logo artwork', 'Customer to share the logo file separately');
  y += 2; line();

  // Colours
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('Colours and fabric', L, y); y += 8;
  if (d.garment === 'Pair') {
    await chip('Shirt', e.shirtColour, e.shirtTex);
    await chip('Pant / skirt', e.pantColour, e.pantTex);
  } else {
    await chip('Main colour', d.colour, '');
  }
  line();

  // Sizes
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('Sizes and quantities', L, y); y += 8;
  const sizes = d.sizes || {};
  const colW = (W - 2 * L) / (SIZES.length + 1);
  doc.setFontSize(10);
  SIZES.forEach((s, i) => { doc.setFont('helvetica', 'bold'); doc.text(s, L + i * colW, y); });
  doc.text('Total', L + SIZES.length * colW, y); y += 7;
  let total = 0;
  doc.setFont('helvetica', 'normal');
  SIZES.forEach((s, i) => { const n = Number(sizes[s]) || 0; total += n; doc.text(String(n), L + i * colW, y); });
  doc.setFont('helvetica', 'bold'); doc.text(String(total), L + SIZES.length * colW, y); y += 10;
  line();

  // Notes box
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('Production notes (to be filled by KSMG team)', L, y); y += 6;
  doc.setDrawColor(150); doc.rect(L, y, W - 2 * L, 45);
  y += 52;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(110);
  doc.text('Fabric GSM, composition, stitching details, labels and packing to be confirmed after technical review.', L, y);

  const safe = (d.name || 'design').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'design';
  doc.save(`techpack-${safe}.pdf`);
}
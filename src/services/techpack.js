import { jsPDF } from 'jspdf';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

// '/images/textures/oxford-001.jpg' -> 'Oxford 001'
const texName = u => {
  const f = (u || '').split('/').pop().replace(/\.[a-z]+$/i, '');
  return f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

// Load any image URL (blob: or same-site) as a data URL; '' if it fails.
async function loadRaw(url) {
  try {
    const b = await (await fetch(url)).blob();
    return await new Promise(res => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = () => res('');
      fr.readAsDataURL(b);
    });
  } catch { return ''; }
}

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

// opts: { spec, fabricSpec, logoUrl, previews } - all optional.
//   spec: values typed in the studio (GSM, composition, measurements, notes)
//   fabricSpec: fabric details from src/data/fabrics.js (typical or KSMG's own)
//   previews: PNG data URLs of the 3D preview
export async function downloadTechPack(d, industryName = '', opts = {}) {
  const spec = opts.spec || {};
  const fs = opts.fabricSpec || null;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const e = d.extra || {};
  const W = 210, L = 15;
  let y = 18;

  // Start a new page when the next block would not fit.
  const need = h => { if (y + h > 282) { doc.addPage(); y = 18; } };
  const line = () => { need(6); doc.setDrawColor(200); doc.line(L, y, W - L, y); y += 6; };
  const heading = t => { need(14); doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text(t, L, y); y += 8; };
  const row = (label, value) => {
    need(7);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(label, L, y);
    doc.setFont('helvetica', 'normal'); doc.text(String(value || '-'), L + 45, y);
    y += 7;
  };
  const chip = async (label, colour, tex) => {
    need(11);
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
  row('Garment', d.garment === 'Pair' ? 'School set: shirt with trousers (boys) / skirt (girls)' : d.garment);
  row('Fabric', d.fabric);
  row('Pattern', d.pattern || 'Plain');
  row('Decoration', d.decoration);
  row('Logo artwork', opts.logoUrl ? 'Uploaded in the studio (see below); send the original file' : 'Customer to share the logo file separately');
  y += 2; line();

  // Shirt style (school set)
  const st = e.style || {};
  const pn = e.panels || {};
  if (d.garment === 'Pair') {
    heading('Shirt style');
    row('Collar', st.collar || 'Classic (convertible)');
    row('Sleeves', st.sleeve || 'Half');
    const any = ['collar', 'sleeves', 'cuffs'].some(k => pn[k]);
    if (!any) row('Contrast panels', 'None');
    if (pn.collar) await chip('Collar panel', pn.collar, '');
    if (pn.sleeves) await chip('Sleeve panel', pn.sleeves, '');
    if (pn.cuffs) await chip('Cuff / hem panel', pn.cuffs, '');
    line();
  }

  // Colours
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('Colours and fabric', L, y); y += 8;
  if (d.garment === 'Pair') {
    await chip('Shirt', e.shirtColour, e.shirtTex);
    await chip('Pant / skirt', e.pantColour, e.pantTex);
  } else {
    await chip('Main colour', d.colour, '');
  }
  line();

  // Fabric specification: what the customer typed wins over typical values.
  const fabricRows = [
    ['Composition', spec.composition || (fs && fs.composition)],
    ['Weight (GSM)', spec.gsm || (fs && fs.gsm)],
    ['Weave', fs && fs.weave],
    ['Width', spec.width || (fs && fs.width)],
    ['Finish', spec.finish || (fs && fs.finish)],
    ['Shrinkage', fs && fs.shrinkage],
    ['Care', fs && fs.care],
  ].filter(r => r[1]);
  if (fabricRows.length) {
    heading('Fabric specification' + (fs && !fs.confirmed ? ' (typical values, to be confirmed)' : ''));
    fabricRows.forEach(([k, v]) => row(k, String(v).slice(0, 80)));
    line();
  }
  const meas = [['Chest (inches)', spec.chest], ['Length (inches)', spec.length], ['Sleeve (inches)', spec.sleeve]].filter(r => r[1]);
  if (meas.length || spec.notes) {
    heading('Measurements and notes from the customer');
    meas.forEach(([k, v]) => row(k, v));
    if (spec.notes) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      doc.splitTextToSize(spec.notes, W - 2 * L).forEach(t => { need(6); doc.text(t, L, y); y += 5; });
      y += 2;
    }
    line();
  }

  // 3D preview images and logo
  const pics = (opts.previews || []).filter(Boolean);
  if (pics.length || opts.logoUrl) {
    heading('Preview');
    need(62);
    let x = L;
    // Fit each image inside a box without stretching it.
    const fit = (w, h, bw, bh) => { const k = Math.min(bw / w, bh / h); return [w * k, h * k]; };
    pics.forEach(p => {
      const img = typeof p === 'string' ? { src: p, w: 1, h: 1 } : p;
      const [w, h] = fit(img.w, img.h, 56, 60);
      try { doc.addImage(img.src, img.src.startsWith('data:image/png') ? 'PNG' : 'JPEG', x + (56 - w) / 2, y, w, h); x += 60; } catch { /* skip */ }
    });
    if (opts.logoUrl) {
      const logo = await loadRaw(opts.logoUrl);
      if (logo) {
        try {
          const p = doc.getImageProperties(logo);
          const [w, h] = fit(p.width, p.height, 40, 40);
          doc.addImage(logo, x + 4, y + (40 - h) / 2, w, h);
          doc.setFontSize(8); doc.setTextColor(110); doc.text('Logo', x + 4, y + 46); doc.setTextColor(0);
        } catch { /* skip */ }
      }
    }
    y += 66;
    line();
  }

  // Sizes
  heading('Sizes and quantities');
  // School set: separate counts for each piece, which production needs.
  const pq = e.pairQty;
  if (d.garment === 'Pair' && pq) {
    const parts = [['Boys shirt', pq.mShirt], ['Boys trousers', pq.mPant], ['Girls shirt', pq.fShirt], ['Girls skirt', pq.fSkirt]];
    const colW2 = (W - 2 * L - 30) / (SIZES.length + 1);
    need(8 + parts.length * 7);
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    SIZES.forEach((s, i) => doc.text(s, L + 30 + i * colW2, y));
    doc.text('Total', L + 30 + SIZES.length * colW2, y); y += 7;
    parts.forEach(([name, q]) => {
      const qq = q || {};
      let t = 0;
      doc.setFont('helvetica', 'bold'); doc.text(name, L, y);
      doc.setFont('helvetica', 'normal');
      SIZES.forEach((s, i) => { const n = Number(qq[s]) || 0; t += n; doc.text(String(n), L + 30 + i * colW2, y); });
      doc.setFont('helvetica', 'bold'); doc.text(String(t), L + 30 + SIZES.length * colW2, y);
      y += 7;
    });
    // Grand total row, in the same columns as the rows above.
    doc.setDrawColor(200); doc.line(L, y - 4.5, W - L, y - 4.5);
    let all = 0;
    doc.setFont('helvetica', 'bold'); doc.text('All pieces', L, y);
    SIZES.forEach((s, i) => {
      const n = parts.reduce((a, [, q]) => a + (Number((q || {})[s]) || 0), 0);
      all += n; doc.text(String(n), L + 30 + i * colW2, y);
    });
    doc.text(String(all), L + 30 + SIZES.length * colW2, y);
    y += 10;
  } else {
    const sizes = d.sizes || {};
    const colW = (W - 2 * L) / (SIZES.length + 1);
    need(18);
    doc.setFontSize(10);
    SIZES.forEach((s, i) => { doc.setFont('helvetica', 'bold'); doc.text(s, L + i * colW, y); });
    doc.text('Total', L + SIZES.length * colW, y); y += 7;
    let total = 0;
    doc.setFont('helvetica', 'normal');
    SIZES.forEach((s, i) => { const n = Number(sizes[s]) || 0; total += n; doc.text(String(n), L + i * colW, y); });
    doc.setFont('helvetica', 'bold'); doc.text(String(total), L + SIZES.length * colW, y); y += 10;
  }
  line();

  // Notes box
  need(70);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('Production notes (to be filled by KSMG team)', L, y); y += 6;
  doc.setDrawColor(150); doc.rect(L, y, W - 2 * L, 45);
  y += 52;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(110);
  doc.text('Fabric GSM, composition, stitching details, labels and packing to be confirmed after technical review.', L, y);

  const safe = (d.name || 'design').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'design';
  doc.save(`techpack-${safe}.pdf`);
}
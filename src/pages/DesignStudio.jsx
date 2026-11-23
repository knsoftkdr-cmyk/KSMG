// import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { useState, useMemo, useEffect, lazy, Suspense, Component } from 'react';
import { Link } from 'react-router-dom';
import { INDUSTRIES } from '../data/industries.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { useAuth } from '../services/auth.jsx';
import { listDesigns, saveDesign, deleteDesign, updateDesign, listVersions } from '../services/designs.js';
import { estimate, setRates } from '../data/pricing.js';
import { getSetting } from '../services/settings.js';
import { useFeatures } from '../services/features.js';
import GarmentArt from '../components/GarmentArt.jsx';
import SizeAdvisor from '../components/SizeAdvisor.jsx';
import { downloadTechPack } from '../services/techpack.js';
const Garment3D = lazy(() => import('../components/Garment3D.jsx'));
const GARMENTS = ['Pair', 'Apron', 'Skirt', 'Pinafore', 'Blazer', 'Scrub top', 'Lab coat', 'Chef coat', 'Salon wear', 'Coverall', 'Hi-vis jacket', 'Gown'];
const FABRICS = ['Cotton', 'Poly-cotton blend', 'Polyester', 'To be advised by sales team'];
const COLOURS = [
  ['Navy', '#0a1330'], ['White', '#ffffff'], ['Sky blue', '#7fb2e5'], ['Grey', '#8b8f98'],
  ['Maroon', '#7a1f2b'], ['Green', '#1f6b4a'], ['Black', '#1a1a1a'], ['Khaki', '#b8a77a'],
];

const DECORATION = ['None', 'Embroidery', 'Screen print', 'Heat transfer'];
const SHIRT_TEX = [
  ['Oxford 001', '/images/textures/oxford-001.jpg'],
  ['Oxford 002', '/images/textures/oxford-002.jpg'],
  ['Oxford 003', '/images/textures/oxford-003.jpg'],
  ['Oxford 004', '/images/textures/oxford-004.jpg'],
  ['Oxford 005', '/images/textures/oxford-005.jpg'],
  ['Modesto 001', '/images/textures/modesto-001.jpg'],
  ['Modesto 002', '/images/textures/modesto-002.jpg'],
  ['Modesto 003', '/images/textures/modesto-003.jpg'],
  ['Blue Check', '/images/textures/blue-check.jpg'],
  ['Volume 901', '/images/textures/volume-901.jpg'],
  ['Blue Green Plaid', '/images/textures/blue-green-plaid.jpg'],
  ['Navy Plaid', '/images/textures/navy-plaid.jpg'],
  ['Red Plaid', '/images/textures/red-plaid.jpg'],
  ['Teal Check', '/images/textures/teal-check.jpg'],
  ['Volume 9006', '/images/textures/volume-9006.jpg'],
  ['Volume 9007', '/images/textures/volume-9007.jpg'],
  ['Volume 9008', '/images/textures/volume-9008.jpg'],
  ['Volume 9009', '/images/textures/volume-9009.jpg'],
  ['Tartan Red Green', '/images/textures/tartan-red-green.jpg'],
  ['Cashmoney 544', '/images/textures/cashmoney-544.jpg'],
  ['Blue Stripe', '/images/textures/blue-stripe.jpg'],
  ['Lilac Stripe', '/images/textures/lilac-stripe.jpg'],
  ['Cromax 25001', '/images/textures/cromax-25001.jpg'],
  ['Chicago 19208', '/images/textures/chicago-19208.jpg'],
  ['Chicago 19204', '/images/textures/chicago-19204.jpg'],
  ['Chicago 19207', '/images/textures/chicago-19207.jpg'],
    ['Red Gingham', '/images/textures/red-gingham.jpg'],
  ['Atlanta 12005', '/images/textures/atlanta-12005.jpg'],
  ['I-Boston 13009', '/images/textures/i-boston-13009.jpg'],
  ['Hawaii 15002', '/images/textures/hawaii-15002.jpg'],
];
const PANT_TEX = [
  ['Square Box 201', '/images/textures/square-box-201.jpg'],
  ['Swiss Denim 104', '/images/textures/swiss-denim-104.jpg'],
  ['Majestica 002', '/images/textures/majestica-002.jpg'],
  ['Swiss Denim 106', '/images/textures/swiss-denim-106.jpg'],
  ['Belinda Raymond Blue', '/images/textures/belinda-raymond-blue.jpg'],
  ['Scottish 005', '/images/textures/scottish-005.jpg'],
  ['Marcus 003', '/images/textures/marcus-003.jpg'],
  ['Brown Twill', '/images/textures/brown-twill.jpg'],
  ['Black Dot', '/images/textures/black-dot.jpg'],
  ['Navy Plain', '/images/textures/navy-plain.jpg'],
  ['Scottish 013', '/images/textures/scottish-013.jpg'],
  ['Hacker 008', '/images/textures/hacker-008.jpg'],
  ['Kings Crown 907', '/images/textures/kings-crown-907.jpg'],
  ['Black Twill', '/images/textures/black-twill.jpg'],
  ['Kings Crown 908', '/images/textures/kings-crown-908.jpg'],
  ['Cody 005', '/images/textures/cody-005.jpg'],
  ['Day of Joy', '/images/textures/day-of-joy.jpg'],
  ['Dark Teal', '/images/textures/dark-teal.jpg'],
  ['Scottish 002', '/images/textures/scottish-002.jpg'],
  ['Navy Plain 2', '/images/textures/navy-plain-2.jpg'],
  ['Black Pinstripe', '/images/textures/black-pinstripe.jpg'],
  ['Dark Herringbone', '/images/textures/dark-herringbone.jpg'],
  ['Hacker 003', '/images/textures/hacker-003.jpg'],
  ['Scottish 016', '/images/textures/scottish-016.jpg'],
  ['Square Box 203', '/images/textures/square-box-203.jpg'],
  ['Belinda R Blue', '/images/textures/belinda-r-blue.jpg'],
];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const EMPTY_QTY = { XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0 };
const EMPTY_PQ = { mShirt: EMPTY_QTY, mPant: EMPTY_QTY, fShirt: EMPTY_QTY, fSkirt: EMPTY_QTY };

const LOGO_POS = {
  Shirt: [118, 50], Pair: [118, 50], Trousers: [108, 28], Apron: [85, 80], Skirt: [105, 40], Pinafore: [84, 75],
  Blazer: [120, 60], 'Scrub top': [116, 52], 'Lab coat': [118, 60], 'Chef coat': [118, 52],
  'Salon wear': [114, 48], Coverall: [116, 48], 'Hi-vis jacket': [118, 56], Gown: [116, 50],
};

function Chip({ colour, tex }) {
  const st = { display: 'inline-block', width: 24, height: 24, borderRadius: '50%', border: '1px solid #999', verticalAlign: 'middle' };
  return tex
    ? <img src={tex.replace('/textures/', '/textures/thumbs/')} alt="" width="24" height="24" style={{ ...st, objectFit: 'cover' }} />
    : <span style={{ ...st, background: colour }} />;
}

class Boundary extends Component {
  state = { bad: false };
  static getDerivedStateFromError() { return { bad: true }; }
  componentDidCatch(e) { console.error('3D failed', e); if (this.props.onFail) this.props.onFail(); }
  render() { return this.state.bad ? null : this.props.children; }
}
export default function DesignStudio() {
  usePageMeta('Custom Design Studio', 'Create a conceptual uniform design with your colours and logo, then request a technical review and quotation.');
  const [industry, setIndustry] = useState(INDUSTRIES[0].slug);
  const [garment, setGarment] = useState('Pair');
  const [fabric, setFabric] = useState(FABRICS[0]);
  const [colour, setColour] = useState(COLOURS[0][1]);
  const [decoration, setDecoration] = useState('None');
  const [pattern, setPattern] = useState('Plain');
  const [shirtColour, setShirtColour] = useState('#7fb2e5');
    const [shirtPattern, setShirtPattern] = useState('Plain');
  const [pantColour, setPantColour] = useState('#0a1330');
  const [shirtTex, setShirtTex] = useState('');
  const [pantTex, setPantTex] = useState('');
  const [tab, setTab] = useState('style');
  const [part, setPart] = useState('shirt');
  useEffect(() => {
    if (garment === 'Shirt') { setShirtColour(colour); setShirtPattern(pattern); }
    else if (garment === 'Trousers') { setPantColour(colour); }
  }, [garment, colour, pattern]);
  const changeGarment = g => {
    if (g === 'Shirt') { setColour(shirtColour); setPattern(shirtPattern); }
    else if (g === 'Trousers') { setColour(pantColour); setPattern('Plain'); }
    else { setPattern('Plain'); }
    if (g === 'Pair') setMode('3d');
    setGarment(g);
  };
  const [mode, setMode] = useState('2d');
  const features = useFeatures();
  const threeOn = features.on.threeD;
  useEffect(() => { if (!threeOn) setMode('2d'); }, [threeOn]);
  const [logoPos, setLogoPos] = useState({ dx: 0, dy: 0, size: 32 });
  const [logoUrl, setLogoUrl] = useState('');
  const [logoOk, setLogoOk] = useState(false);
  const [qtyOther, setQty] = useState(EMPTY_QTY);
  const [pq, setPq] = useState(EMPTY_PQ);
  const [gender, setGender] = useState('male');
  const qty = useMemo(() => garment === 'Pair' ? SIZES.reduce((o, s) => ({ ...o, [s]: Object.values(pq).reduce((a, g) => a + (Number(g[s]) || 0), 0) }), {}) : qtyOther, [garment, pq, qtyOther]);
  const { user } = useAuth();
  const [designs, setDesigns] = useState([]);
  const [dname, setDname] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [cmp, setCmp] = useState([]);
  const [cmp3d, setCmp3d] = useState(false);
  const [spec, setSpec] = useState({ gsm: '', composition: '', width: '', finish: '', chest: '', length: '', sleeve: '', notes: '' });
  const makeTechPack = () => {
    const previews = threeOn && mode === '3d'
      ? [...document.querySelectorAll('.g3d canvas')].slice(0, 2).map(c => { try { return c.toDataURL('image/png'); } catch { return ''; } }).filter(Boolean)
      : [];
    const d = { name: dname.trim() || 'Current design', industry, garment, fabric, colour, decoration, pattern, sizes: qty, extra: { shirtColour, shirtTex, pantColour, pantTex } };
    downloadTechPack(d, (INDUSTRIES.find(i => i.slug === industry) || {}).name, { spec, logoUrl: logoOk !== 'bad' ? logoUrl : '', previews }).catch(() => setMsg('Could not create the tech pack.'));
  };
  const uid = user?.id;

  // Pricing rates from Supabase
  const [, setRatesTick] = useState(0);
  useEffect(() => {
    getSetting('pricing').then(r => { if (r) { setRates(r); setRatesTick(t => t + 1); } }).catch(() => {});
  }, []);

  // Version history
  const [editId, setEditId] = useState(null);
  const [versions, setVersions] = useState([]);
  const loadVersions = id => listVersions(id).then(setVersions).catch(() => setVersions([]));
  const newDesign = () => { setEditId(null); setDname(''); setVersions([]); setMsg(''); };
  const restoreVersion = v => {
    const s = v.snapshot;
    setIndustry(s.industry); setGarment(GARMENTS.includes(s.garment) ? s.garment : 'Pair');
    setFabric(s.fabric); setColour(s.colour); setDecoration(s.decoration); setPattern(s.pattern || 'Plain');
    setQty({ ...EMPTY_QTY, ...s.sizes });
    const e = s.extra || {};
    setPq(e.pairQty || { ...EMPTY_PQ, mShirt: { ...EMPTY_QTY, ...s.sizes } });
    if (e.shirtColour) setShirtColour(e.shirtColour);
    setShirtTex(e.shirtTex || '');
    if (e.pantColour) setPantColour(e.pantColour);
    setPantTex(e.pantTex || '');
    setMsg(`Loaded version ${v.version}. Click Update design to keep it.`);
  };

  // Undo / redo
  const [hist, setHist] = useState({ list: [], i: -1 });
  const snap = useMemo(() => ({ industry, garment, fabric, colour, decoration, pattern, qty, shirtColour, shirtTex, pantColour, pantTex }), [industry, garment, fabric, colour, decoration, pattern, qty, shirtColour, shirtTex, pantColour, pantTex]);
  useEffect(() => {
    const t = setTimeout(() => setHist(h => {
      if (h.i >= 0 && JSON.stringify(h.list[h.i]) === JSON.stringify(snap)) return h;
      const list = [...h.list.slice(0, h.i + 1), snap].slice(-50);
      return { list, i: list.length - 1 };
    }), 400);
    return () => clearTimeout(t);
  }, [snap]);
  const applySnap = s => {
    setIndustry(s.industry); setGarment(s.garment); setFabric(s.fabric); setColour(s.colour);
    setDecoration(s.decoration); setPattern(s.pattern); setQty(s.qty);
    if (s.shirtColour) setShirtColour(s.shirtColour);
    setShirtTex(s.shirtTex || '');
    if (s.pantColour) setPantColour(s.pantColour);
    setPantTex(s.pantTex || '');
  };
  const undo = () => { if (hist.i > 0) { applySnap(hist.list[hist.i - 1]); setHist(h => ({ ...h, i: h.i - 1 })); } };
  const redo = () => { if (hist.i < hist.list.length - 1) { applySnap(hist.list[hist.i + 1]); setHist(h => ({ ...h, i: h.i + 1 })); } };

  const loadDesigns = () => listDesigns().then(setDesigns).catch(() => setMsg('Could not load your saved designs.'));
  useEffect(() => { if (uid) loadDesigns(); else setDesigns([]); }, [uid]);

  const save = async () => {
    const name = dname.trim();
    if (!name) return setMsg('Give your design a name first.');
    if (name.length > 80) return setMsg('Name can have at most 80 characters.');
    setSaving(true);
    try {
            const payload = { name, industry, garment, fabric, colour, decoration, pattern, sizes: qty, extra: { shirtColour, shirtTex, pantColour, pantTex, pairQty: pq } };
      if (editId) {
        await updateDesign(editId, payload);
        setMsg('Design updated. The old version is kept in history.');
        await loadVersions(editId);
      } else {
        await saveDesign(payload);
        setDname(''); setMsg('Design saved.');
      }
      await loadDesigns();
    } catch (e) {
      setMsg(/row-level|policy/i.test(e?.message || '') ? 'You can save at most 20 designs. Delete one first.' : 'Could not save the design.');
    }
    setSaving(false);
  };

const openDesign = d => {
  setIndustry(d.industry);
  setGarment(GARMENTS.includes(d.garment) ? d.garment : 'Pair');
  setFabric(d.fabric);
  setColour(d.colour);
  setDecoration(d.decoration);
  setPattern(d.pattern || 'Plain');
  setQty({ ...EMPTY_QTY, ...d.sizes });
  const e = d.extra || {};
  setPq(e.pairQty || { ...EMPTY_PQ, mShirt: { ...EMPTY_QTY, ...d.sizes } });
  if (e.shirtColour) setShirtColour(e.shirtColour);
  setShirtTex(e.shirtTex || '');
  if (e.pantColour) setPantColour(e.pantColour);
  setPantTex(e.pantTex || '');
  setEditId(d.id);
  setDname(d.name);
  loadVersions(d.id);
  setMsg(`Opened "${d.name}".`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
  const removeDesign = async d => {
    if (!window.confirm(`Delete "${d.name}"?`)) return;
    try {
      await deleteDesign(d.id);
      if (editId === d.id) newDesign();
      setMsg('Design deleted.');
      await loadDesigns();
    } catch { setMsg('Could not delete the design.'); }
  };

  const total = useMemo(() => Object.values(qty).reduce((a, b) => a + (Number(b) || 0), 0), [qty]);
  const colourName = (COLOURS.find(c => c[1] === colour) || ['Custom ' + colour])[0];
  const price = estimate({ garment: garment === 'Pair' ? 'Shirt' : garment, fabric, decoration, pattern, total });
  const [order, setOrder] = useState([]);
const addToOrder = () => {
  if (total < 1) return setMsg('Enter sizes and quantities first.');
  setOrder(o => [...o, { id: Date.now(), garment, colour, colourName, pattern, fabric, decoration, sizes: { ...qty }, total, hasLogo: !!logoUrl }]);
  setQty(EMPTY_QTY); setPq(EMPTY_PQ);
  setMsg(`${garment} added to your order.`);
};
const removeFromOrder = id => setOrder(o => o.filter(x => x.id !== id));
const orderTotal = order.reduce((a, l) => a + l.total, 0);
const orderLines = order.map(l => {
  const p = estimate({ garment: l.garment, fabric: l.fabric, decoration: l.decoration, pattern: l.pattern, total: orderTotal });
  return { ...l, unitNet: p ? p.unitNet : 0, discount: p ? p.discount : 0, lineTotal: p ? p.unitNet * l.total : 0 };
});
const orderSum = orderLines.reduce((a, l) => a + l.lineTotal, 0);
  const strokeColour = colour === '#ffffff' ? '#999' : 'rgba(0,0,0,0.35)';
  const [lx, ly] = LOGO_POS[garment];

  const rememberDesign = () => {
    const ind = INDUSTRIES.find(i => i.slug === industry);
    const sizeText = SIZES.filter(s => qty[s] > 0).map(s => `${s}: ${qty[s]}`).join(', ') || 'not entered yet';
    const text = [
      'Design from Design Studio (conceptual preview, for technical review):',
      `Industry: ${ind ? ind.name : industry}`,
      `Garment: ${garment}`,
      `Colour: ${colourName}`,
      `Pattern: ${pattern}`,
      `Fabric: ${fabric}`,
      `Decoration: ${decoration}`,
      `Logo: ${logoUrl ? 'yes (will share the file separately)' : 'none'}`,
      `Sizes: ${sizeText}`,
      `Total quantity: ${total}`,
      price ? `Estimated price (indicative): Rs ${price.unitNet} per piece, about Rs ${price.total} in total` : 'Estimated price: not calculated',
    ].join('\n');
    const orderText = orderLines.map((l, i) => `${i + 1}. ${l.garment} | ${l.colourName} | ${l.pattern} | ${l.fabric} | ${l.decoration} | Logo: ${l.hasLogo ? 'yes' : 'none'} | Sizes: ${SIZES.filter(s => l.sizes[s] > 0).map(s => `${s}: ${l.sizes[s]}`).join(', ')} | Qty: ${l.total}${l.unitNet ? ` | about Rs ${l.unitNet} per piece` : ''}`).join('\n');
    const fullText = order.length > 0
      ? `Order from Design Studio (conceptual preview, for technical review):\nIndustry: ${ind ? ind.name : industry}\n${orderText}\nTotal quantity: ${orderTotal}\nEstimated total (indicative): Rs ${orderSum}`
      : text;
    try { sessionStorage.setItem('ksmg-design', JSON.stringify({ text: fullText, total: order.length > 0 ? orderTotal : total, industry: ind ? ind.name : '' })); } catch { /* ignore */ }
  };

 function onLogo(e) {
    const input = e.target;
    const f = input.files && input.files[0];
    if (!f) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(f.type)) {
      setMsg('Please choose a PNG, JPG or WEBP image.');
      input.value = '';
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setMsg('Logo is too big. Please use an image under 2 MB.');
      input.value = '';
      return;
    }
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoOk(true);
    setLogoUrl(URL.createObjectURL(f));
    setMsg('');
}
  if (features.ready && !features.on.classic) {
    return (
      <section className="wrap narrow">
        <h1>Custom Design Studio</h1>
        <p>The Design Studio is not available right now. You can still <Link to="/catalogue">browse the catalogue</Link> or <Link to="/quote">request a quote</Link>.</p>
      </section>
    );
  }
  return (
    <section className="ds">
      <div className="ds-head">
        <h1>Custom Design Studio</h1>
        <p className="ds-note"><strong>Conceptual preview only.</strong> This is not a manufacturing-ready pattern. Our team reviews every design before quoting. Fabric options are to be confirmed by the company.</p>
      </div>

      <div className="ds-grid">
       <div className="ds-form">
          <div className="ds-mode" role="tablist" aria-label="Design steps">
            {[['style', 'Style'], ['colour', 'Colour'], ['logo', 'Logo'], ['sizes', 'Sizes']].map(([k, n]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'btn gold' : 'btn ghost'} onClick={() => setTab(k)}>{n}</button>
            ))}
            <Link to="/catalogue" className="btn ghost">Catalogue</Link>
            <Link to="/brochure" className="btn ghost">Brochure</Link>
          </div>

          {tab === 'style' && (
            <>
              <label>Industry
                <select value={industry} onChange={e => setIndustry(e.target.value)}>
                  {INDUSTRIES.map(i => <option key={i.slug} value={i.slug}>{i.name}</option>)}
                </select>
              </label>
              <label>Garment
                <select value={garment} onChange={e => changeGarment(e.target.value)}>
                  {GARMENTS.map(g => <option key={g}>{g}</option>)}
                </select>
              </label>
              <label>Fabric
                <select value={fabric} onChange={e => setFabric(e.target.value)}>
                  {FABRICS.map(f => <option key={f}>{f}</option>)}
                </select>
              </label>
            </>
          )}

          {tab === 'colour' && (
            <>
              {garment !== 'Pair' && (
                <div className="ds-field">
                  <span>Colour: {colourName}</span>
                  <div className="ds-swatches">
                    {COLOURS.map(([n, c]) => (
                      <button key={n} type="button" title={n} aria-label={n}
                        className={colour === c ? 'sw on' : 'sw'} aria-pressed={colour === c} style={{ background: c }}
                        onClick={() => setColour(c)} />
                    ))}
                    <label className="sw-pick" title="Pick any colour">
                      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M20.71 5.63l-2.34-2.34a1 1 0 0 0-1.41 0l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.92-1.92 3.12-3.12c.4-.4.4-1.03.01-1.42zM6.92 19L5 17.08l8.06-8.06 1.92 1.92L6.92 19z" /></svg>
                      <input type="color" value={colour} aria-label="Pick any colour" onChange={e => setColour(e.target.value)} />
                    </label>
                  </div>
                </div>
              )}
              {garment !== 'Pair' && (
                <label>Pattern
                  <select value={pattern} disabled={garment === 'Trousers'} onChange={e => setPattern(e.target.value)}>
                    {['Plain', 'Checks', 'Stripes'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </label>
              )}
              {garment === 'Pair' && (
                <>
                  <div className="ds-mode">
                    <button type="button" className={part === 'shirt' ? 'btn gold' : 'btn ghost'} onClick={() => setPart('shirt')}>Shirt</button>
                    <button type="button" className={part === 'pant' ? 'btn gold' : 'btn ghost'} onClick={() => setPart('pant')}>Pant and skirt</button>
                  </div>
                  {part === 'shirt' ? (
                    <>
                      <div className="ds-field">
                        <span>Shirt colour</span>
                        <div className="ds-swatches">
                          {COLOURS.map(([n, c]) => (
                            <button key={n} type="button" title={n} aria-label={'Shirt ' + n}
                              className={shirtColour === c && !shirtTex ? 'sw on' : 'sw'} style={{ background: c }}
                              onClick={() => { setShirtColour(c); setShirtTex(''); }} />
                          ))}
                          <label className="sw-pick" title="Pick any colour">
                            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M20.71 5.63l-2.34-2.34a1 1 0 0 0-1.41 0l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.92-1.92 3.12-3.12c.4-.4.4-1.03.01-1.42zM6.92 19L5 17.08l8.06-8.06 1.92 1.92L6.92 19z" /></svg>
                            <input type="color" value={shirtColour} aria-label="Pick any shirt colour" onChange={e => { setShirtColour(e.target.value); setShirtTex(''); }} />
                          </label>
                        </div>
                      </div>
                      <div className="ds-field">
                        <span>Shirt textures{shirtTex ? ': ' + (SHIRT_TEX.find(t => t[1] === shirtTex) || ['', ''])[0] : ''}</span>
                        <div className="ds-swatches" style={{ flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 8 }}>
                          {SHIRT_TEX.map(([n, u]) => (
                            <button key={n} type="button" title={n} aria-label={'Shirt texture ' + n}
                              className={shirtTex === u ? 'sw on' : 'sw'} style={{ flexShrink: 0, padding: 0, overflow: 'hidden' }}
                              onClick={() => setShirtTex(u)}>
                              <img src={u.replace('/textures/', '/textures/thumbs/')} alt="" loading="lazy" decoding="async" width="36" height="36" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="ds-field">
                        <span>Pant and skirt colour</span>
                        <div className="ds-swatches">
                          {COLOURS.map(([n, c]) => (
                            <button key={n} type="button" title={n} aria-label={'Pant ' + n}
                              className={pantColour === c && !pantTex ? 'sw on' : 'sw'} style={{ background: c }}
                              onClick={() => { setPantColour(c); setPantTex(''); }} />
                          ))}
                          <label className="sw-pick" title="Pick any colour">
                            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M20.71 5.63l-2.34-2.34a1 1 0 0 0-1.41 0l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.92-1.92 3.12-3.12c.4-.4.4-1.03.01-1.42zM6.92 19L5 17.08l8.06-8.06 1.92 1.92L6.92 19z" /></svg>
                            <input type="color" value={pantColour} aria-label="Pick any pant colour" onChange={e => { setPantColour(e.target.value); setPantTex(''); }} />
                          </label>
                        </div>
                      </div>
                      <div className="ds-field">
                        <span>Pant and skirt textures{pantTex ? ': ' + (PANT_TEX.find(t => t[1] === pantTex) || ['', ''])[0] : ''}</span>
                        <div className="ds-swatches" style={{ flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 8 }}>
                          {PANT_TEX.map(([n, u]) => (
                            <button key={n} type="button" title={n} aria-label={'Pant texture ' + n}
                            className={pantTex === u ? 'sw on' : 'sw'} style={{ flexShrink: 0, padding: 0, overflow: 'hidden' }}
                            onClick={() => setPantTex(u)}>
                            <img src={u.replace('/textures/', '/textures/thumbs/')} alt="" loading="lazy" decoding="async" width="36" height="36" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} />
                          </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {tab === 'logo' && (
            <>
              <label>Logo (only a logo you are authorised to use)
                <input type="file" accept="image/*" onChange={onLogo} />
              </label>
              {logoUrl && (
                <div className="ds-field">
                  <span>Logo position and size</span>
                  <div className="ds-mode">
                    <button type="button" className="btn ghost" title="Left" aria-label="Move left" onClick={() => setLogoPos(p => ({ ...p, dx: Math.max(-60, p.dx - 4) }))}>←</button>
                    <button type="button" className="btn ghost" title="Right" aria-label="Move right" onClick={() => setLogoPos(p => ({ ...p, dx: Math.min(60, p.dx + 4) }))}>→</button>
                    <button type="button" className="btn ghost" title="Up" aria-label="Move up" onClick={() => setLogoPos(p => ({ ...p, dy: Math.max(-60, p.dy - 4) }))}>↑</button>
                    <button type="button" className="btn ghost" title="Down" aria-label="Move down" onClick={() => setLogoPos(p => ({ ...p, dy: Math.min(100, p.dy + 4) }))}>↓</button>
                    <button type="button" className="btn ghost" title="Smaller" aria-label="Smaller logo" onClick={() => setLogoPos(p => ({ ...p, size: Math.max(12, p.size - 4) }))}>−</button>
                    <button type="button" className="btn ghost" title="Bigger" aria-label="Bigger logo" onClick={() => setLogoPos(p => ({ ...p, size: Math.min(80, p.size + 4) }))}>+</button>
                    <button type="button" className="btn ghost" title="Reset" aria-label="Reset logo" onClick={() => setLogoPos({ dx: 0, dy: 0, size: 32 })}>↺</button>
                  </div>
                </div>
              )}
              <label>Decoration
                <select value={decoration} onChange={e => setDecoration(e.target.value)}>
                  {DECORATION.map(d => <option key={d}>{d}</option>)}
                </select>
              </label>
            </>
          )}

          {tab === 'sizes' && garment === 'Pair' && (
            <>
              <div className="ds-mode">
                <button type="button" className={gender === 'male' ? 'btn gold' : 'btn ghost'} onClick={() => setGender('male')}>Male</button>
                <button type="button" className={gender === 'female' ? 'btn gold' : 'btn ghost'} onClick={() => setGender('female')}>Female</button>
              </div>
              {[[gender === 'male' ? 'mShirt' : 'fShirt', 'Shirt'], [gender === 'male' ? 'mPant' : 'fSkirt', gender === 'male' ? 'Pant' : 'Skirt']].map(([key, label]) => (
                <div className="ds-field" key={key}>
                  <span>{gender === 'male' ? 'Male' : 'Female'} {label} sizes (pieces: {Object.values(pq[key]).reduce((a, b) => a + (Number(b) || 0), 0)})</span>
                  <div className="ds-sizes">
                    {SIZES.map(s => (
                      <label key={s}>{s}
                        <input type="number" min="0" value={pq[key][s]}
                          onChange={e => setPq({ ...pq, [key]: { ...pq[key], [s]: Math.max(0, Number(e.target.value) || 0) } })} />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <p className="ds-note small"><strong>Total pieces: {total}</strong> (all four lists together)</p>
              <SizeAdvisor />
            </>
          )}
          {tab === 'sizes' && garment !== 'Pair' && (
            <>
              <div className="ds-field">
                <span>Sizes and quantities (total: {total})</span>
                <div className="ds-sizes">
                  {SIZES.map(s => (
                    <label key={s}>{s}
                      <input type="number" min="0" value={qty[s]}
                        onChange={e => setQty({ ...qty, [s]: Math.max(0, Number(e.target.value) || 0) })} />
                    </label>
                  ))}
                </div>
              </div>
              <SizeAdvisor />
            </>
          )}
        </div>

        <div className="ds-preview">
          <div className="ds-mode">
            <button type="button" className="btn ghost" title="Undo" aria-label="Undo" disabled={hist.i <= 0} onClick={undo}>↶</button>
            <button type="button" className="btn ghost" title="Redo" aria-label="Redo" disabled={hist.i >= hist.list.length - 1} onClick={redo}>↷</button>
          </div>
          <div className="ds-mode">
            <button type="button" aria-pressed={mode === '2d'} className={mode === '2d' ? 'btn gold' : 'btn ghost'} onClick={() => setMode('2d')}>2D</button>
            {threeOn && <button type="button" className={mode === '3d' ? 'btn gold' : 'btn ghost'} onClick={() => setMode('3d')}>3D</button>}
          </div>
          {threeOn && mode === '3d' ? (
          <Boundary onFail={() => setMode('2d')}><Suspense fallback={<p className="ds-note small">Loading 3D...</p>}>
              <Garment3D garment={garment} colour={colour} pattern={pattern} logoUrl={logoOk !== 'bad' ? logoUrl : ''}logoPos={logoPos} shirtColour={shirtColour} shirtPattern={shirtPattern} pantColour={pantColour} shirtTex={shirtTex} pantTex={pantTex} />
                        </Suspense></Boundary>
          ) : (
            <svg viewBox="0 0 200 220" role="img" aria-label={`Conceptual preview of a ${colourName} ${garment}`}>
              <GarmentArt garment={garment === 'Pair' ? 'Shirt' : garment} colour={colour} stroke={strokeColour} pattern={pattern} />
              {logoUrl && logoOk !== 'bad' && (
                <image href={logoUrl} x={lx + logoPos.dx} y={ly + logoPos.dy} width={logoPos.size} height={logoPos.size} preserveAspectRatio="xMidYMid meet" onError={() => setLogoOk('bad')} />
              )}
            </svg>
          )}
          <p className="ds-badge">CONCEPTUAL PREVIEW</p>

          <div className="ds-mode">
            <button type="button" className="btn ghost" onClick={addToOrder}>Add this garment to order</button>
            <Link to="/quote?design=1" onClick={rememberDesign} className="btn gold">Request review and quotation</Link>
          </div>
          {msg && !user && <p className="ds-note small" role="status">{msg}</p>}

          <p className="ds-note small">
            <strong>Total quantity: {total}</strong>
            {price && (
              <> | Estimated: ₹{price.unitNet.toLocaleString('en-IN')} per piece
              {price.discount > 0 ? ` (${Math.round(price.discount * 100)}% bulk discount)` : ''}
              , total about ₹{price.total.toLocaleString('en-IN')}. Indicative only.</>
            )}
          </p>

          <details>
            <summary>Design summary</summary>
            <ul className="ds-summary">
              <li>Garment: {garment} ({colourName})</li>
              <li>Fabric: {fabric}</li>
              <li>Pattern: {pattern}</li>
              <li>Decoration: {decoration}</li>
              <li>Logo: {logoUrl ? 'added' : 'none'}</li>
            </ul>
          </details>

          <details>
            <summary>Tech pack (PDF)</summary>
            <div className="ds-save">
              {[['gsm', 'Fabric GSM'], ['composition', 'Composition'], ['width', 'Fabric width'], ['finish', 'Finish'], ['chest', 'Chest (inches)'], ['length', 'Length (inches)'], ['sleeve', 'Sleeve (inches)']].map(([k, n]) => (
                <label key={k}>{n}
                  <input type="text" maxLength={60} value={spec[k]} onChange={e => setSpec({ ...spec, [k]: e.target.value })} />
                </label>
              ))}
              <label>Construction notes
                <textarea rows="3" maxLength={500} value={spec.notes} onChange={e => setSpec({ ...spec, notes: e.target.value })} />
              </label>
              <button type="button" className="btn ghost" onClick={makeTechPack}>Download tech pack (this design)</button>
              <p className="ds-note small">Switch to 3D first to include the 3D preview. Logo is included if you uploaded one. Empty fields are left out.</p>
            </div>
          </details>

          {order.length > 0 && (
            <details open>
              <summary>My order ({orderTotal} pieces)</summary>
              <ul className="ds-list">
                {orderLines.map(l => (
                  <li key={l.id}>
                    <span>
                      <strong>{l.garment}</strong> ({l.colourName}, {l.pattern}) x {l.total}
                      <br /><small>{SIZES.filter(s => l.sizes[s] > 0).map(s => `${s}: ${l.sizes[s]}`).join(', ')}</small>
                      {l.unitNet > 0 && <><br /><small>₹{l.unitNet.toLocaleString('en-IN')} per piece{l.discount > 0 ? ` (${Math.round(l.discount * 100)}% bulk discount)` : ''}</small></>}
                    </span>
                    <button type="button" className="btn ghost" onClick={() => removeFromOrder(l.id)}>Remove</button>
                  </li>
                ))}
              </ul>
              <p className="ds-note small">Order total about ₹{orderSum.toLocaleString('en-IN')}. Indicative only.</p>
            </details>
          )}

          <details>
            <summary>Save design{designs.length > 0 ? ` (${designs.length} saved)` : ''}</summary>
            {user ? (
              <div className="ds-save">
                <label>Design name
                  <input type="text" value={dname} maxLength={80} onChange={e => setDname(e.target.value)} placeholder="e.g. School shirt, blue" />
                </label>
                <button type="button" className="btn ghost" disabled={saving} onClick={save}>{saving ? 'Saving...' : editId ? 'Update design' : 'Save design'}</button>
                {editId && <button type="button" className="btn ghost" onClick={newDesign}>Start a new design</button>}
                {msg && <p className="ds-note small" role="status">{msg}</p>}
                {editId && versions.length > 0 && (
                  <>
                    <h3>Version history ({versions.length})</h3>
                    <ul className="ds-list">
                      {versions.map(v => (
                        <li key={v.id}>
                          <span><strong>Version {v.version}</strong><br /><small>{v.snapshot.garment} | {new Date(v.createdAt).toLocaleString()}</small></span>
                          <button type="button" className="btn ghost" onClick={() => restoreVersion(v)}>Restore</button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {designs.length > 0 && (
                  <>
                    <button type="button" className="btn ghost" onClick={() => setCmp(c => [...c.filter(x => x.id !== 'current'), { id: 'current', name: 'Current (on screen)', industry, garment, fabric, colour, decoration, pattern, sizes: qty, extra: { shirtColour, shirtTex, pantColour, pantTex } }].slice(-2))}>Add current design to compare</button>
                    {cmp.length === 2 && (
                      <>
                        <h3>Compare designs</h3>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                            <tbody>
                              {[
                                ['Name', d => d.name],
                                ['Garment', d => d.garment],
                                ['Fabric', d => d.fabric],
                                ['Pattern', d => d.pattern],
                                ['Decoration', d => d.decoration],
                                ['Total qty', d => Object.values(d.sizes || {}).reduce((a, b) => a + (Number(b) || 0), 0)],
                                ['Colour', d => d.garment === 'Pair' ? '-' : <Chip colour={d.colour} />],
                                ['Shirt', d => d.garment === 'Pair' ? <Chip colour={(d.extra || {}).shirtColour} tex={(d.extra || {}).shirtTex} /> : '-'],
                                ['Pant / skirt', d => d.garment === 'Pair' ? <Chip colour={(d.extra || {}).pantColour} tex={(d.extra || {}).pantTex} /> : '-'],
                              ].map(([label, fn]) => (
                                <tr key={label}>
                                  <th style={{ textAlign: 'left', padding: 4 }}>{label}</th>
                                  {cmp.map(d => <td key={d.id} style={{ padding: 4 }}>{fn(d)}</td>)}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <button type="button" className="btn ghost" onClick={() => setCmp3d(v => !v)}>{cmp3d ? 'Hide 3D previews' : 'Show 3D previews'}</button>
                        {cmp3d && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                            {cmp.map(d => {
                              const e = d.extra || {};
                              return (
                                <div key={d.id}>
                                  <strong>{d.name}</strong>
                                  <Boundary><Suspense fallback={<p className="ds-note small">Loading 3D...</p>}>
                                    <Garment3D garment={d.garment} colour={d.colour} pattern={d.pattern || 'Plain'} shirtColour={e.shirtColour || '#7fb2e5'} pantColour={e.pantColour || '#0a1330'} shirtTex={e.shirtTex || ''} pantTex={e.pantTex || ''} />
                                  </Suspense></Boundary>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <button type="button" className="btn ghost" onClick={() => setCmp([])}>Clear comparison</button>
                      </>
                    )}
                    <h3>My saved designs ({designs.length})</h3>
                    <ul className="ds-list">
                      {designs.map(d => (
                        <li key={d.id}>
                          <span><strong>{d.name}</strong><br /><small>{d.garment} | {d.industry}</small></span>
                          <span className="rfq-actions">
                            <button type="button" className="btn ghost" onClick={() => openDesign(d)}>Open</button>
                            <button type="button" className="btn ghost" onClick={() => setCmp(c => c.find(x => x.id === d.id) ? c.filter(x => x.id !== d.id) : [...c, d].slice(-2))}>{cmp.find(x => x.id === d.id) ? 'Selected' : 'Compare'}</button>
                            <button type="button" className="btn ghost" onClick={() => downloadTechPack(d, (INDUSTRIES.find(i => i.slug === d.industry) || {}).name).catch(() => setMsg('Could not create the tech pack.'))}>Tech pack</button>
                            <button type="button" className="btn ghost" onClick={() => removeDesign(d)}>Delete</button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ) : (
              <p className="ds-note small"><Link to="/login">Log in</Link> to save your designs and open them later.</p>
            )}
          </details>

          {mode === '3d' && (
            <details>
              <summary>3D model credits</summary>
              <p className="ds-note small">
                3D models: "Shirt" by <a href="https://sketchfab.com/eigenscene" target="_blank" rel="noopener noreferrer">eigenscene</a>, "Pants 1" by <a href="https://sketchfab.com/neutralize" target="_blank" rel="noopener noreferrer">neutralize</a>, "Labcoat" by <a href="https://sketchfab.com/Mhanimations" target="_blank" rel="noopener noreferrer">Mhanimations</a>, "Scrubs Clothing" (top only, adapted) by <a href="https://sketchfab.com/whitewashstudio" target="_blank" rel="noopener noreferrer">Marc Sawyer</a>, "Apron" by <a href="https://sketchfab.com/kurmanin" target="_blank" rel="noopener noreferrer">Alexander Kurmanin</a>, "Pink Gingham Circle Skirt" (adapted) by <a href="https://sketchfab.com/digitaldressmaker" target="_blank" rel="noopener noreferrer">Digital Dressmaker</a>, "Pinafore dress for kids" (adapted) by <a href="https://sketchfab.com/mariia89" target="_blank" rel="noopener noreferrer">Mariia Moskvina</a>, "Double-Breasted Formal Blazer" (adapted) by <a href="https://sketchfab.com/sathwik.sai24" target="_blank" rel="noopener noreferrer">SathwikBannu</a> "The White Coat Chef" (coat only, adapted) by <a href="https://sketchfab.com/restore50" target="_blank" rel="noopener noreferrer">restore50</a> and "high_visibilty_vest_1" (adapted) by <a href="https://sketchfab.com/ap-school" target="_blank" rel="noopener noreferrer">ap-school</a>, licensed under <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>.
              </p>
            </details>
          )}
        </div>
      </div>
    </section>
  );
}
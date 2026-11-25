// import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { useState, useMemo, useEffect, lazy, Suspense, Component } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { fabricSpec, FABRIC_FIELDS, COLLAR_STYLES, SLEEVE_STYLES } from '../data/fabrics.js';
import { shareUrl, readShareCode } from '../services/share.js';
import { submitEnquiry } from '../services/enquiries.js';
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

const LOGO_START = { dx: 0, dy: 0, size: 32, rot: 0 };
const NO_PANELS = { collar: '', sleeves: '', cuffs: '' };
const PANEL_PARTS = [['collar', 'Collar'], ['sleeves', 'Sleeves'], ['cuffs', 'Cuffs / sleeve hem']];

// One row of colour choices for a contrast panel ('' = same as the shirt).
function PanelRow({ label, value, onChange }) {
  return (
    <div className="ds-panel-row">
      <span>{label}</span>
      <div className="ds-swatches ds-swatches-sm">
        <button type="button" className={!value ? 'sw sw-same on' : 'sw sw-same'} aria-pressed={!value}
          title="Same as shirt" aria-label={`${label}: same as shirt`} onClick={() => onChange('')}>=</button>
        {COLOURS.map(([n, c]) => (
          <button key={n} type="button" title={n} aria-label={`${label} ${n}`} aria-pressed={value === c}
            className={value === c ? 'sw on' : 'sw'} style={{ background: c }} onClick={() => onChange(c)} />
        ))}
        <label className="sw-pick" title="Pick any colour">
          <span aria-hidden="true">+</span>
          <input type="color" value={value || '#ffffff'} aria-label={`${label}: pick any colour`} onChange={e => onChange(e.target.value)} />
        </label>
      </div>
    </div>
  );
}

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
  // School shirt options (Pair): contrast panels, collar and sleeve style.
  const [panels, setPanels] = useState(NO_PANELS);
  const [collarStyle, setCollarStyle] = useState(COLLAR_STYLES[0]);
  const [sleeve, setSleeve] = useState(SLEEVE_STYLES[0]);
  const setPanel = (k, v) => setPanels(p => ({ ...p, [k]: v }));
  const panelsOn = Object.values(panels).some(Boolean);
  // Fabric details: typical values, or KSMG's own from the 'fabrics' setting.
  const [fabricOwn, setFabricOwn] = useState(null);
  useEffect(() => { getSetting('fabrics').then(r => { if (r) setFabricOwn(r); }).catch(() => {}); }, []);
  const fspec = fabricSpec(fabric, fabricOwn);
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
  const [logoPos, setLogoPos] = useState(LOGO_START);
  // Pair view: the girls shirt has its own logo position, set separately.
  const [logoPosGirl, setLogoPosGirl] = useState(LOGO_START);
  const [logoFor, setLogoFor] = useState('boy');
  const editGirl = garment === 'Pair' && logoFor === 'girl';
  const editPos = editGirl ? logoPosGirl : logoPos;
  const setEditPos = editGirl ? setLogoPosGirl : setLogoPos;
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
  // 3D preview as a small JPEG on white (keeps the PDF light and the shape correct).
  const snapshot = c => {
    try {
      const k = Math.min(1, 700 / Math.max(c.width, c.height));
      const out = document.createElement('canvas');
      out.width = Math.round(c.width * k); out.height = Math.round(c.height * k);
      const x = out.getContext('2d');
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, out.width, out.height);
      x.drawImage(c, 0, 0, out.width, out.height);
      return { src: out.toDataURL('image/jpeg', 0.85), w: out.width, h: out.height };
    } catch { return null; }
  };
  const makeTechPack = () => {
    const previews = threeOn && mode === '3d'
      ? [...document.querySelectorAll('.g3d canvas')].slice(0, 2).map(snapshot).filter(Boolean)
      : [];
    const d = { name: dname.trim() || 'Current design', industry, garment, fabric, colour, decoration, pattern, sizes: qty, extra: { ...designExtra(), pairQty: pq } };
    downloadTechPack(d, (INDUSTRIES.find(i => i.slug === industry) || {}).name, { spec, fabricSpec: fspec, logoUrl: logoOk !== 'bad' ? logoUrl : '', previews }).catch(() => setMsg('Could not create the tech pack.'));
  };
  const uid = user?.id;

  // Everything about the design that is not a top-level column.
  const designExtra = () => ({
    shirtColour, shirtTex, pantColour, pantTex,
    panels, style: { collar: collarStyle, sleeve },
  });
  const loadExtra = e => {
    if (e.shirtColour) setShirtColour(e.shirtColour);
    setShirtTex(e.shirtTex || '');
    if (e.pantColour) setPantColour(e.pantColour);
    setPantTex(e.pantTex || '');
    setPanels({ ...NO_PANELS, ...(e.panels || {}) });
    const st = e.style || {};
    setCollarStyle(COLLAR_STYLES.includes(st.collar) ? st.collar : COLLAR_STYLES[0]);
    setSleeve(SLEEVE_STYLES.includes(st.sleeve) ? st.sleeve : SLEEVE_STYLES[0]);
  };

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
    loadExtra(e);
    setMsg(`Loaded version ${v.version}. Click Update design to keep it.`);
  };

  // Undo / redo
  const [hist, setHist] = useState({ list: [], i: -1 });
  const snap = useMemo(() => ({ industry, garment, fabric, colour, decoration, pattern, qty, shirtColour, shirtTex, pantColour, pantTex, panels, collarStyle, sleeve }), [industry, garment, fabric, colour, decoration, pattern, qty, shirtColour, shirtTex, pantColour, pantTex, panels, collarStyle, sleeve]);
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
    setPanels(s.panels || NO_PANELS);
    if (s.collarStyle) setCollarStyle(s.collarStyle);
    if (s.sleeve) setSleeve(s.sleeve);
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
            const payload = { name, industry, garment, fabric, colour, decoration, pattern, sizes: qty, extra: { ...designExtra(), pairQty: pq } };
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
  loadExtra(e);
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
  const indName = (INDUSTRIES.find(i => i.slug === industry) || {}).name || industry;
  const colourLabel = c => (COLOURS.find(x => x[1] === c) || ['', c])[0] || c;

  // Shirt style lines for the quote text and approvals (school set only).
  const shirtStyleLines = () => {
    if (garment !== 'Pair') return [];
    const pl = PANEL_PARTS.filter(([k]) => panels[k]).map(([k, n]) => `${n} ${colourLabel(panels[k])}`);
    return [
      `Shirt collar: ${collarStyle}`,
      `Shirt sleeves: ${sleeve}`,
      `Contrast panels: ${pl.length ? pl.join(', ') : 'none'}`,
    ];
  };

  // ---- Share link (#53) ----
  const [params] = useSearchParams();
  const location = useLocation();
  const [shareMsg, setShareMsg] = useState('');
  const link = () => shareUrl({ name: dname.trim(), industry, garment, fabric, colour, decoration, pattern, sizes: qty, extra: designExtra() });
  const copyLink = async () => {
    const url = link();
    try { await navigator.clipboard.writeText(url); setShareMsg('Link copied. Paste it in WhatsApp, email or chat.'); }
    catch { window.prompt('Copy this link:', url); }
  };
  const nativeShare = async () => {
    try { await navigator.share({ title: 'Uniform design from KSMG Design Studio', text: 'Please review this uniform design.', url: link() }); }
    catch { /* cancelled */ }
  };

  // Opening a shared link fills the studio with that design.
  const [shared, setShared] = useState(null);
  useEffect(() => {
    const code = params.get('share');
    if (!code) return;
    const d = readShareCode(code, { garments: GARMENTS, fabrics: FABRICS, decorations: DECORATION, collars: COLLAR_STYLES });
    if (!d) { setMsg('This share link is not valid or is incomplete.'); return; }
    setIndustry(INDUSTRIES.some(i => i.slug === d.industry) ? d.industry : INDUSTRIES[0].slug);
    setGarment(d.garment); setFabric(d.fabric); setColour(d.colour);
    setDecoration(d.decoration); setPattern(d.pattern);
    setQty({ ...EMPTY_QTY, ...d.sizes });
    setPq({ ...EMPTY_PQ, mShirt: { ...EMPTY_QTY, ...d.sizes } });
    loadExtra(d.extra);
    setMode('3d');
    setShared(d);
    // Run once for the link the page was opened with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Customer approval (#54): sent to the KSMG team as a request ----
  const [ap, setAp] = useState({ name: '', org: '', note: '' });
  const [apBusy, setApBusy] = useState(false);
  const [apDone, setApDone] = useState(null);
  const [apErr, setApErr] = useState('');
  const sendApproval = async answer => {
    if (ap.name.trim().length < 2) return setApErr('Please enter your name.');
    if (answer === 'changes' && ap.note.trim().length < 3) return setApErr('Please write what should change.');
    if (ap.note.length > 2000) return setApErr('Notes can have at most 2000 characters.');
    setApErr(''); setApBusy(true);
    const lines = [
      answer === 'approve' ? 'DESIGN APPROVED by the customer.' : 'CHANGES REQUESTED by the customer.',
      ap.note.trim() ? `Customer notes: ${ap.note.trim()}` : '',
      '',
      `Design: ${shared?.name || 'Shared design'}`,
      `Industry: ${indName}`,
      `Garment: ${garment}`,
      `Fabric: ${fabric}`,
      ...shirtStyleLines(),
      `Decoration: ${decoration}`,
      `Total quantity: ${total}`,
      `Design link: ${window.location.href}`,
    ].filter((l, i) => l || i === 2);
    try {
      const id = await submitEnquiry({
        name: ap.name.trim(), organisation: ap.org.trim(), industry: indName, email: user.email, phone: '',
        quantity: total > 0 ? String(total) : '', location: '', neededBy: '', message: lines.join('\n'),
      }, `Design approval: ${answer === 'approve' ? 'approved' : 'changes requested'}`);
      setApDone({ id, answer });
    } catch {
      setApErr('Could not send. Please try again.');
    }
    setApBusy(false);
  };

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
      ...shirtStyleLines(),
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
        <div className="ds-head-row">
          <h1>Custom Design Studio</h1>
          <nav className="ds-links" aria-label="Design references">
            <Link to="/catalogue">Catalogue</Link>
            <Link to="/brochure">Brochure</Link>
          </nav>
        </div>
        {shared && (
          <div className="ds-shared" role="region" aria-label="Shared design review">
            <div className="ds-shared-head">
              <span className="ds-shared-tag">Shared design</span>
              <h2>{shared.name || 'Uniform design for your review'}</h2>
              <p>Look at the design below (turn it in 3D, check colours and sizes). Then approve it or tell us what to change. Your answer goes straight to the KSMG team.</p>
            </div>
            {apDone ? (
              <p className="ds-shared-done" role="status">
                {apDone.answer === 'approve' ? 'Thank you, your approval is sent.' : 'Thank you, your change request is sent.'} Reference: <strong>{apDone.id}</strong>. <Link to="/my-requests">Track it in My requests</Link>.
              </p>
            ) : user ? (
              <div className="ds-shared-form">
                <label>Your name<input value={ap.name} maxLength={100} onChange={e => setAp({ ...ap, name: e.target.value })} /></label>
                <label>School / organisation<input value={ap.org} maxLength={150} onChange={e => setAp({ ...ap, org: e.target.value })} /></label>
                <label className="wide">Notes (needed if you ask for changes)
                  <textarea rows="2" maxLength={2000} value={ap.note} onChange={e => setAp({ ...ap, note: e.target.value })} placeholder="e.g. Make the collar navy, logo a little smaller" />
                </label>
                {apErr && <p className="err wide" role="alert">{apErr}</p>}
                <div className="ds-shared-actions wide">
                  <button type="button" className="btn gold" disabled={apBusy} onClick={() => sendApproval('approve')}>{apBusy ? 'Sending...' : 'Approve design'}</button>
                  <button type="button" className="btn ghost" disabled={apBusy} onClick={() => sendApproval('changes')}>Request changes</button>
                </div>
              </div>
            ) : (
              <p className="ds-shared-login">
                <Link to="/login" state={{ from: location.pathname + location.search }} className="btn gold">Log in to approve or request changes</Link>
              </p>
            )}
          </div>
        )}
        <p className="ds-note"><strong>Conceptual preview only.</strong> This is not a manufacturing-ready pattern. Our team reviews every design before quoting. Fabric options are to be confirmed by the company.</p>
      </div>

      <div className="ds-grid">
       <div className="ds-form ds-panel">
          <div className="ds-steps" role="tablist" aria-label="Design steps">
            {[['style', 'Style'], ['colour', 'Colour'], ['logo', 'Logo'], ['sizes', 'Sizes']].map(([k, n], i) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
                <span className="ds-step-no" aria-hidden="true">{i + 1}</span>{n}
              </button>
            ))}
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
                <small className="ds-hint">In 3D, the fabric changes how the cloth surface looks: cotton is matte with a visible weave, polyester is smoother with a slight sheen.</small>
              </label>
              {fspec ? (
                <div className="ds-fabric" aria-live="polite">
                  <div className="ds-fabric-head">
                    <strong>{fabric}</strong>
                    <span className={fspec.confirmed ? 'ds-tag ok' : 'ds-tag'}>{fspec.confirmed ? 'KSMG specification' : 'Typical values'}</span>
                  </div>
                  {fspec.good && <p className="ds-fabric-good">{fspec.good}</p>}
                  <dl>
                    {FABRIC_FIELDS.filter(([k]) => fspec[k]).map(([k, n]) => (
                      <div key={k}><dt>{n}</dt><dd>{fspec[k]}</dd></div>
                    ))}
                  </dl>
                  {!fspec.confirmed && <small className="ds-hint">Final GSM, composition and finish are confirmed by our team with the quotation.</small>}
                </div>
              ) : (
                <p className="ds-hint">Our sales team will suggest the right fabric for your use.</p>
              )}
              {garment === 'Pair' && (
                <div className="ds-field">
                  <span>Shirt style</span>
                  <label className="ds-inline">Collar
                    <select value={collarStyle} onChange={e => setCollarStyle(e.target.value)}>
                      {COLLAR_STYLES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                  <div className="ds-inline">
                    <span>Sleeves</span>
                    <div className="ds-seg" role="group" aria-label="Sleeve length">
                      {SLEEVE_STYLES.map(v => (
                        <button key={v} type="button" aria-pressed={sleeve === v} className={sleeve === v ? 'on' : ''} onClick={() => setSleeve(v)}>{v}</button>
                      ))}
                    </div>
                  </div>
                  <small className="ds-hint">Sleeve length shows in 3D. The 3D model shows the classic collar; the collar style you pick goes on the tech pack and quotation.</small>
                </div>
              )}
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
                  <div className="ds-seg" role="group" aria-label="Which garment to colour" style={{ alignSelf: 'start' }}>
                    <button type="button" aria-pressed={part === 'shirt'} className={part === 'shirt' ? 'on' : ''} onClick={() => setPart('shirt')}>Shirt</button>
                    <button type="button" aria-pressed={part === 'pant'} className={part === 'pant' ? 'on' : ''} onClick={() => setPart('pant')}>Pant and skirt</button>
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
                        <div className="ds-strip">
                          {SHIRT_TEX.map(([n, u]) => (
                            <button key={n} type="button" title={n} aria-label={'Shirt texture ' + n} aria-pressed={shirtTex === u}
                              className={shirtTex === u ? 'sw sw-tex on' : 'sw sw-tex'}
                              onClick={() => setShirtTex(u)}>
                              <img src={u.replace('/textures/', '/textures/thumbs/')} alt="" loading="lazy" decoding="async" width="38" height="38" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="ds-field">
                        <span>Contrast panels {panelsOn && <button type="button" className="ds-link-btn" onClick={() => setPanels(NO_PANELS)}>Clear all</button>}</span>
                        {PANEL_PARTS.map(([k, n]) => <PanelRow key={k} label={n} value={panels[k]} onChange={v => setPanel(k, v)} />)}
                        <small className="ds-hint">"=" keeps the shirt colour or fabric. Panels show in the 3D preview.</small>
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
                        <div className="ds-strip">
                          {PANT_TEX.map(([n, u]) => (
                            <button key={n} type="button" title={n} aria-label={'Pant texture ' + n} aria-pressed={pantTex === u}
                              className={pantTex === u ? 'sw sw-tex on' : 'sw sw-tex'}
                              onClick={() => setPantTex(u)}>
                              <img src={u.replace('/textures/', '/textures/thumbs/')} alt="" loading="lazy" decoding="async" width="38" height="38" />
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
                  <span>Logo position, size and angle{garment === 'Pair' ? (logoFor === 'girl' ? ': girls shirt' : ': boys shirt') : ''}</span>
                  {garment === 'Pair' && (
                    <div className="ds-logo-for">
                      <div className="ds-seg" role="group" aria-label="Which shirt to adjust">
                        <button type="button" aria-pressed={logoFor === 'boy'} className={logoFor === 'boy' ? 'on' : ''} onClick={() => setLogoFor('boy')}>Boys shirt</button>
                        <button type="button" aria-pressed={logoFor === 'girl'} className={logoFor === 'girl' ? 'on' : ''} onClick={() => setLogoFor('girl')}>Girls shirt</button>
                      </div>
                      <button type="button" className="ds-link-btn" onClick={() => logoFor === 'girl' ? setLogoPos(logoPosGirl) : setLogoPosGirl(logoPos)}>
                        Copy to {logoFor === 'girl' ? 'boys' : 'girls'} shirt
                      </button>
                    </div>
                  )}
                  <div className="ds-logo-ctrl">
                    <div className="ds-pad" role="group" aria-label="Move logo">
                      <button type="button" className="up" title="Up" aria-label="Move up" onClick={() => setEditPos(p => ({ ...p, dy: Math.max(-60, p.dy - 4) }))}>↑</button>
                      <button type="button" className="left" title="Left" aria-label="Move left" onClick={() => setEditPos(p => ({ ...p, dx: Math.max(-60, p.dx - 4) }))}>←</button>
                      <button type="button" className="mid" title="Reset" aria-label="Reset logo" onClick={() => setEditPos(LOGO_START)}>↺</button>
                      <button type="button" className="right" title="Right" aria-label="Move right" onClick={() => setEditPos(p => ({ ...p, dx: Math.min(60, p.dx + 4) }))}>→</button>
                      <button type="button" className="down" title="Down" aria-label="Move down" onClick={() => setEditPos(p => ({ ...p, dy: Math.min(100, p.dy + 4) }))}>↓</button>
                    </div>
                    <div className="ds-logo-side">
                      <div className="ds-pill" role="group" aria-label="Logo size">
                        <button type="button" title="Smaller" aria-label="Smaller logo" onClick={() => setEditPos(p => ({ ...p, size: Math.max(12, p.size - 4) }))}>−</button>
                        <span>Size {editPos.size}</span>
                        <button type="button" title="Bigger" aria-label="Bigger logo" onClick={() => setEditPos(p => ({ ...p, size: Math.min(80, p.size + 4) }))}>+</button>
                      </div>
                      <div className="ds-pill" role="group" aria-label="Logo angle">
                        <button type="button" title="Turn left" aria-label="Turn logo left" onClick={() => setEditPos(p => ({ ...p, rot: Math.max(-45, (p.rot || 0) - 5) }))}>⟲</button>
                        <span>{editPos.rot || 0}°</span>
                        <button type="button" title="Turn right" aria-label="Turn logo right" onClick={() => setEditPos(p => ({ ...p, rot: Math.min(45, (p.rot || 0) + 5) }))}>⟳</button>
                      </div>
                    </div>
                  </div>
                  <small className="ds-hint">In 3D the logo is printed onto the cloth and follows its curves.</small>
                </div>
              )}
              <label>Decoration
                <select value={decoration} onChange={e => setDecoration(e.target.value)}>
                  {DECORATION.map(d => <option key={d}>{d}</option>)}
                </select>
                {logoUrl && <small className="ds-hint">Switch to 3D and zoom in to see the finish: raised threads for embroidery, matte ink for screen print, smooth gloss for heat transfer.</small>}
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

        <div className="ds-preview ds-panel">
          <div className="ds-toolbar">
            <div className="ds-pill" role="group" aria-label="History">
              <button type="button" title="Undo" aria-label="Undo" disabled={hist.i <= 0} onClick={undo}>↶</button>
              <button type="button" title="Redo" aria-label="Redo" disabled={hist.i >= hist.list.length - 1} onClick={redo}>↷</button>
            </div>
            <p className="ds-badge">Conceptual preview</p>
            <div className="ds-seg" role="group" aria-label="Preview type">
              <button type="button" aria-pressed={mode === '2d'} className={mode === '2d' ? 'on' : ''} onClick={() => setMode('2d')}>2D</button>
              {threeOn && <button type="button" aria-pressed={mode === '3d'} className={mode === '3d' ? 'on' : ''} onClick={() => setMode('3d')}>3D</button>}
            </div>
          </div>
          {threeOn && mode === '3d' ? (
          <Boundary onFail={() => setMode('2d')}><Suspense fallback={<div className="g3d-loading" role="status"><span className="g3d-spin" aria-hidden="true" />Loading 3D preview…</div>}>
              <Garment3D garment={garment} colour={colour} pattern={pattern} fabric={fabric} logoUrl={logoOk !== 'bad' ? logoUrl : ''} logoPos={logoPos} logoPosGirl={logoPosGirl} decoration={decoration} shirtPanels={panels} sleeve={sleeve} shirtColour={shirtColour} shirtPattern={shirtPattern} pantColour={pantColour} shirtTex={shirtTex} pantTex={pantTex} />
                        </Suspense></Boundary>
          ) : (
            <svg viewBox="0 0 200 220" role="img" aria-label={`Conceptual preview of a ${colourName} ${garment}`}>
              <GarmentArt garment={garment === 'Pair' ? 'Shirt' : garment} colour={colour} stroke={strokeColour} pattern={pattern} />
              {logoUrl && logoOk !== 'bad' && (
                <image href={logoUrl} x={lx + logoPos.dx} y={ly + logoPos.dy} width={logoPos.size} height={logoPos.size} preserveAspectRatio="xMidYMid meet" onError={() => setLogoOk('bad')}
                  transform={`rotate(${logoPos.rot || 0} ${lx + logoPos.dx + logoPos.size / 2} ${ly + logoPos.dy + logoPos.size / 2})`} />
              )}
            </svg>
          )}

          <div className="ds-total" aria-live="polite">
            <div><span>Total quantity</span><strong>{total}</strong></div>
            {price ? (
              <>
                <div><span>Per piece</span><strong>₹{price.unitNet.toLocaleString('en-IN')}</strong>{price.discount > 0 && <small>{Math.round(price.discount * 100)}% bulk discount</small>}</div>
                <div><span>Estimated total</span><strong>₹{price.total.toLocaleString('en-IN')}</strong><small>Indicative only</small></div>
              </>
            ) : (
              <div className="ds-total-hint"><small>Enter sizes in step 4 to see an estimate.</small></div>
            )}
          </div>

          <div className="ds-actions">
            <button type="button" className="btn ghost" onClick={addToOrder}>Add this garment to order</button>
            <Link to="/quote?design=1" onClick={rememberDesign} className="btn gold">Request review and quotation</Link>
          </div>
          {msg && !user && <p className="ds-note small" role="status">{msg}</p>}

          <details>
            <summary>Design summary</summary>
            <ul className="ds-summary">
              <li>Garment: {garment} ({colourName})</li>
              <li>Fabric: {fabric}</li>
              <li>Pattern: {pattern}</li>
              {shirtStyleLines().map(l => <li key={l}>{l}</li>)}
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
            <summary>Share for approval</summary>
            <div className="ds-save">
              <p className="ds-hint">Send this link to your principal, manager or client. They can see the design in 3D and approve it or ask for changes. The logo is not included in the link; share the logo file separately.</p>
              <div className="ds-actions" style={{ justifyContent: 'flex-start' }}>
                <button type="button" className="btn gold" onClick={copyLink}>Copy share link</button>
                {typeof navigator !== 'undefined' && navigator.share && <button type="button" className="btn ghost" onClick={nativeShare}>Share…</button>}
              </div>
              {shareMsg && <p className="ds-hint" role="status">{shareMsg}</p>}
            </div>
          </details>

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
                    <button type="button" className="btn ghost" onClick={() => setCmp(c => [...c.filter(x => x.id !== 'current'), { id: 'current', name: 'Current (on screen)', industry, garment, fabric, colour, decoration, pattern, sizes: qty, extra: designExtra() }].slice(-2))}>Add current design to compare</button>
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
                                    <Garment3D garment={d.garment} colour={d.colour} pattern={d.pattern || 'Plain'} fabric={d.fabric} shirtPanels={e.panels} sleeve={(e.style || {}).sleeve || 'Half'} shirtColour={e.shirtColour || '#7fb2e5'} pantColour={e.pantColour || '#0a1330'} shirtTex={e.shirtTex || ''} pantTex={e.pantTex || ''} />
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
                            <button type="button" className="btn ghost" onClick={() => downloadTechPack(d, (INDUSTRIES.find(i => i.slug === d.industry) || {}).name, { fabricSpec: fabricSpec(d.fabric, fabricOwn) }).catch(() => setMsg('Could not create the tech pack.'))}>Tech pack</button>
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
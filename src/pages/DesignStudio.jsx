import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { INDUSTRIES } from '../data/industries.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { useAuth } from '../services/auth.jsx';
import { listDesigns, saveDesign, deleteDesign, updateDesign, listVersions } from '../services/designs.js';
import { estimate, setRates } from '../data/pricing.js';
import { getSetting } from '../services/settings.js';
import GarmentArt from '../components/GarmentArt.jsx';
const Garment3D = lazy(() => import('../components/Garment3D.jsx'));
const GARMENTS = ['Shirt', 'Trousers', 'Apron', 'Skirt', 'Pinafore', 'Blazer', 'Scrub top', 'Lab coat', 'Chef coat', 'Salon wear', 'Coverall', 'Hi-vis jacket', 'Gown'];
const FABRICS = ['Cotton', 'Poly-cotton blend', 'Polyester', 'To be advised by sales team'];
const COLOURS = [
  ['Navy', '#0a1330'], ['White', '#ffffff'], ['Sky blue', '#7fb2e5'], ['Grey', '#8b8f98'],
  ['Maroon', '#7a1f2b'], ['Green', '#1f6b4a'], ['Black', '#1a1a1a'], ['Khaki', '#b8a77a'],
];
const DECORATION = ['None', 'Embroidery', 'Screen print', 'Heat transfer'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const EMPTY_QTY = { XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0 };

const LOGO_POS = {
  Shirt: [118, 50], Trousers: [108, 28], Apron: [85, 80], Skirt: [105, 40], Pinafore: [84, 75],
  Blazer: [120, 60], 'Scrub top': [116, 52], 'Lab coat': [118, 60], 'Chef coat': [118, 52],
  'Salon wear': [114, 48], Coverall: [116, 48], 'Hi-vis jacket': [118, 56], Gown: [116, 50],
};

export default function DesignStudio() {
  usePageMeta('Custom Design Studio', 'Create a conceptual uniform design with your colours and logo, then request a technical review and quotation.');
  const [industry, setIndustry] = useState(INDUSTRIES[0].slug);
  const [garment, setGarment] = useState('Shirt');
  const [fabric, setFabric] = useState(FABRICS[0]);
  const [colour, setColour] = useState(COLOURS[0][1]);
  const [decoration, setDecoration] = useState('None');
  const [pattern, setPattern] = useState('Plain');
  const [mode, setMode] = useState('2d');
  const [logoPos, setLogoPos] = useState({ dx: 0, dy: 0, size: 32 });
  const [logoUrl, setLogoUrl] = useState('');
  const [logoOk, setLogoOk] = useState(false);
  const [qty, setQty] = useState(EMPTY_QTY);
  const { user } = useAuth();
  const [designs, setDesigns] = useState([]);
  const [dname, setDname] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
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
    setIndustry(s.industry); setGarment(GARMENTS.includes(s.garment) ? s.garment : 'Shirt');
    setFabric(s.fabric); setColour(s.colour); setDecoration(s.decoration); setPattern(s.pattern || 'Plain');
    setQty({ ...EMPTY_QTY, ...s.sizes });
    setMsg(`Loaded version ${v.version}. Click Update design to keep it.`);
  };

  // Undo / redo
  const [hist, setHist] = useState({ list: [], i: -1 });
  const snap = useMemo(() => ({ industry, garment, fabric, colour, decoration, pattern, qty }), [industry, garment, fabric, colour, decoration, pattern, qty]);
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
      const payload = { name, industry, garment, fabric, colour, decoration, pattern, sizes: qty };
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
    setIndustry(d.industry); setGarment(GARMENTS.includes(d.garment) ? d.garment : 'Shirt');
    setFabric(d.fabric); setColour(d.colour); setDecoration(d.decoration); setPattern(d.pattern || 'Plain');
    setQty({ ...EMPTY_QTY, ...d.sizes });
    setEditId(d.id); setDname(d.name); loadVersions(d.id);
    setMsg(`Opened "${d.name}".`);
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
  const price = estimate({ garment, fabric, decoration, pattern, total });
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
    try { sessionStorage.setItem('ksmg-design', JSON.stringify({ text, total, industry: ind ? ind.name : '' })); } catch { /* ignore */ }
  };

  function onLogo(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoOk(true);
    setLogoUrl(URL.createObjectURL(f));
  }

  return (
    <section className="ds">
      <div className="ds-head">
        <h1>Custom Design Studio</h1>
        <p className="ds-note"><strong>Conceptual preview only.</strong> This is not a manufacturing-ready pattern. Our team reviews every design before quoting. Fabric options are to be confirmed by the company.</p>
      </div>

      <div className="ds-grid">
        <div className="ds-form">
          <label>1. Industry
            <select value={industry} onChange={e => setIndustry(e.target.value)}>
              {INDUSTRIES.map(i => <option key={i.slug} value={i.slug}>{i.name}</option>)}
            </select>
          </label>

          <label>2. Garment
            <select value={garment} onChange={e => setGarment(e.target.value)}>
              {GARMENTS.map(g => <option key={g}>{g}</option>)}
            </select>
          </label>

          <label>3. Fabric
            <select value={fabric} onChange={e => setFabric(e.target.value)}>
              {FABRICS.map(f => <option key={f}>{f}</option>)}
            </select>
          </label>

          <div className="ds-field">
            <span>4. Colour: {colourName}</span>
            <div className="ds-swatches">
              {COLOURS.map(([n, c]) => (
                <button key={n} type="button" title={n} aria-label={n}
                  className={colour === c ? 'sw on' : 'sw'} style={{ background: c }}
                  onClick={() => setColour(c)} />
              ))}
              <label className="sw-pick" title="Pick any colour">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M20.71 5.63l-2.34-2.34a1 1 0 0 0-1.41 0l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.92-1.92 3.12-3.12c.4-.4.4-1.03.01-1.42zM6.92 19L5 17.08l8.06-8.06 1.92 1.92L6.92 19z" /></svg>
                <input type="color" value={colour} aria-label="Pick any colour" onChange={e => setColour(e.target.value)} />
              </label>
            </div>
          </div>

          <label>Pattern
            <select value={pattern} onChange={e => setPattern(e.target.value)}>
              {['Plain', 'Checks', 'Stripes'].map(p => <option key={p}>{p}</option>)}
            </select>
          </label>

          <label>5. Logo (only a logo you are authorised to use)
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

          <label>6. Decoration
            <select value={decoration} onChange={e => setDecoration(e.target.value)}>
              {DECORATION.map(d => <option key={d}>{d}</option>)}
            </select>
          </label>

          <div className="ds-field">
            <span>7. Sizes and quantities (total: {total})</span>
            <div className="ds-sizes">
              {SIZES.map(s => (
                <label key={s}>{s}
                  <input type="number" min="0" value={qty[s]}
                    onChange={e => setQty({ ...qty, [s]: Math.max(0, Number(e.target.value) || 0) })} />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="ds-preview">
          <div className="ds-mode">
            <button type="button" className="btn ghost" title="Undo" aria-label="Undo" disabled={hist.i <= 0} onClick={undo}>↶</button>
            <button type="button" className="btn ghost" title="Redo" aria-label="Redo" disabled={hist.i >= hist.list.length - 1} onClick={redo}>↷</button>
          </div>
          <div className="ds-mode">
            <button type="button" className={mode === '2d' ? 'btn gold' : 'btn ghost'} onClick={() => setMode('2d')}>2D</button>
            <button type="button" className={mode === '3d' ? 'btn gold' : 'btn ghost'} onClick={() => setMode('3d')}>3D</button>
          </div>
          {mode === '3d' ? (
            <Suspense fallback={<p className="ds-note small">Loading 3D...</p>}>
              <Garment3D garment={garment} colour={colour} pattern={pattern} />
            </Suspense>
          ) : (
            <svg viewBox="0 0 200 220" role="img" aria-label={`Conceptual preview of a ${colourName} ${garment}`}>
              <GarmentArt garment={garment} colour={colour} stroke={strokeColour} pattern={pattern} />
              {logoUrl && logoOk !== 'bad' && (
                <image href={logoUrl} x={lx + logoPos.dx} y={ly + logoPos.dy} width={logoPos.size} height={logoPos.size} preserveAspectRatio="xMidYMid meet" onError={() => setLogoOk('bad')} />
              )}
            </svg>
          )}
          <p className="ds-badge">CONCEPTUAL PREVIEW</p>
          <ul className="ds-summary">
            <li>Garment: {garment} ({colourName})</li>
            <li>Fabric: {fabric}</li>
            <li>Pattern: {pattern}</li>
            <li>Decoration: {decoration}</li>
            <li>Logo: {logoUrl ? 'added' : 'none'}</li>
            <li>Total quantity: {total}</li>
            {price && (
              <li>
                Estimated: ₹{price.unitNet.toLocaleString('en-IN')} per piece
                {price.discount > 0 ? ` (${Math.round(price.discount * 100)}% bulk discount)` : ''}
                , total about ₹{price.total.toLocaleString('en-IN')}
                <br /><small>Indicative only. Final price in the quotation.</small>
              </li>
            )}
          </ul>
          <Link to="/quote?design=1" onClick={rememberDesign} className="btn gold">Request review and quotation</Link>
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
                  <h3>My saved designs ({designs.length})</h3>
                  <ul className="ds-list">
                    {designs.map(d => (
                      <li key={d.id}>
                        <span><strong>{d.name}</strong><br /><small>{d.garment} | {d.industry}</small></span>
                        <span className="rfq-actions">
                          <button type="button" className="btn ghost" onClick={() => openDesign(d)}>Open</button>
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
        </div>
      </div>
    </section>
  );
}
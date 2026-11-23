import { useEffect, useState } from 'react';
import usePageMeta from '../hooks/usePageMeta.js';
import { DEFAULT_RATES, setRates } from '../data/pricing.js';
import { getSetting, saveSetting } from '../services/settings.js';
import FeatureFlags from '../components/FeatureFlags.jsx';

function Group({ title, note, obj, onChange }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {note && <p className="note">{note}</p>}
      {Object.keys(obj).map(k => (
        <label key={k}>{k}
          <input type="number" min="0" step="0.01" value={obj[k]}
            onChange={e => onChange({ ...obj, [k]: e.target.value === '' ? '' : Number(e.target.value) })} />
        </label>
      ))}
    </div>
  );
}

export default function Pricing() {
  usePageMeta('Pricing rates');
  const [r, setR] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSetting('pricing').then(d => setR({ ...DEFAULT_RATES, ...(d || {}) })).catch(() => { setR(DEFAULT_RATES); setMsg('Could not load saved rates. Showing defaults.'); });
  }, []);


  if (!r) return <section className="wrap">Loading...</section>;

  const save = async () => {
    const bad = [...Object.values(r.base), ...Object.values(r.fabric), ...Object.values(r.decoration), ...Object.values(r.pattern)]
      .some(v => v === '' || Number(v) < 0);
    if (bad) return setMsg('Fill every rate with a number, 0 or more.');
    setBusy(true);
    try { await saveSetting('pricing', r); setRates(r); setMsg('Rates saved.'); }
    // catch { setMsg('Could not save. Only staff can change rates.'); }
    catch (e) { console.error(e); setMsg('Could not save: ' + (e?.message || 'unknown error')); }
    setBusy(false);
  };

  return (
    <section className="wrap narrow">
      <h1>Pricing rates</h1>
      <p className="note">These rates are used for the indicative estimate in the Design Studio. Prices are in Rs per piece.</p>
      <Group title="Base price per garment (Rs)" obj={r.base} onChange={v => setR({ ...r, base: v })} />
      <Group title="Fabric factor" note="1 = no change, 1.1 = 10% more, 0.95 = 5% less." obj={r.fabric} onChange={v => setR({ ...r, fabric: v })} />
      <Group title="Decoration extra (Rs per piece)" obj={r.decoration} onChange={v => setR({ ...r, decoration: v })} />
      <Group title="Pattern extra (Rs per piece)" obj={r.pattern} onChange={v => setR({ ...r, pattern: v })} />
      <button type="button" className="btn gold" disabled={busy} onClick={save}>{busy ? 'Saving...' : 'Save rates'}</button>
      {msg && <p role="status">{msg}</p>}
      <FeatureFlags />
    </section>
  );
}
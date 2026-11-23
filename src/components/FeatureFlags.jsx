import { useEffect, useState } from 'react';
import { saveSetting } from '../services/settings.js';
import { FLAGS, AUDIENCES, loadFeatures, hashEmail, maskEmail } from '../services/features.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Admin panel: choose who sees each Design Studio feature (tracker task 5).
export default function FeatureFlags() {
  const [flags, setFlags] = useState(null);
  const [draft, setDraft] = useState({}); // email being typed, per flag
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { loadFeatures(true).then(setFlags); }, []);
  if (!flags) return <div className="card"><h2>Studio features</h2><p>Loading...</p></div>;

  const set = (k, patch) => setFlags({ ...flags, [k]: { ...flags[k], ...patch } });

  const addEmail = async k => {
    const email = (draft[k] || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return setMsg('Type a valid email address.');
    const hash = await hashEmail(email);
    if (flags[k].emails.some(e => e.hash === hash)) return setMsg('That email is already on the list.');
    set(k, { emails: [...flags[k].emails, { hash, label: maskEmail(email) }] });
    setDraft({ ...draft, [k]: '' });
    setMsg('');
  };

  const save = async () => {
    setBusy(true);
    try { await saveSetting('features', flags); await loadFeatures(true); setMsg('Studio features saved. Visitors get the change on their next page load.'); }
    catch (e) { console.error(e); setMsg('Could not save: ' + (e?.message || 'unknown error')); }
    setBusy(false);
  };

  return (
    <div className="card ff">
      <h2>Studio features</h2>
      <p className="note">Choose who can see each part of the Design Studio. Staff always see features set to "Selected emails", so you can test before customers do.</p>
      {Object.entries(FLAGS).map(([k, f]) => (
        <fieldset key={k} className="ff-flag">
          <legend>{f.label}</legend>
          <p className="note">{f.note}</p>
          <label>Who can see it
            <select value={flags[k].audience} onChange={e => set(k, { audience: e.target.value })}>
              {AUDIENCES.map(([v, n]) => <option key={v} value={v}>{n}</option>)}
            </select>
          </label>
          {flags[k].audience === 'selected' && (
            <div className="ff-emails">
              <div className="row">
                <input type="email" placeholder="customer@school.com" aria-label={`Add email for ${f.label}`} value={draft[k] || ''}
                  onChange={e => setDraft({ ...draft, [k]: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEmail(k); } }} />
                <button type="button" className="btn ghost" onClick={() => addEmail(k)}>Add</button>
              </div>
              {flags[k].emails.length === 0 ? <p className="note">No emails yet: only staff will see it.</p> : (
                <ul>
                  {flags[k].emails.map(e => (
                    <li key={e.hash}>{e.label}
                      <button type="button" className="btn ghost" aria-label={`Remove ${e.label}`} onClick={() => set(k, { emails: flags[k].emails.filter(x => x.hash !== e.hash) })}>Remove</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </fieldset>
      ))}
      <button type="button" className="btn gold" disabled={busy} onClick={save}>{busy ? 'Saving...' : 'Save features'}</button>
      {msg && <p role="status">{msg}</p>}
    </div>
  );
}

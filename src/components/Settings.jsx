import { useEffect, useState } from 'react';
const KEY = 'ksmg-settings', DEFAULTS = { theme: 'system', motion: true };
export const loadSettings = () => { try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) }; } catch { return DEFAULTS; } };
export function applySettings(s) {
  const d = document.documentElement;
  const dark = s.theme === 'dark' || (s.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  d.dataset.theme = dark ? 'dark' : 'light';
  d.dataset.motion = s.motion ? 'on' : 'off';
}
export default function Settings() {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState(loadSettings);
  useEffect(() => {
    applySettings(s); localStorage.setItem(KEY, JSON.stringify(s));
    const mq = matchMedia('(prefers-color-scheme: dark)'), fn = () => applySettings(s);
    mq.addEventListener('change', fn); return () => mq.removeEventListener('change', fn);
  }, [s]);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);
  return (
    <div className="settings" onClick={e => e.stopPropagation()}>
      <button className="btn ghost sbtn" aria-expanded={open} onClick={() => setOpen(!open)}>Settings</button>
      {open && (
        <div className="panel" role="dialog" aria-label="Settings">
          <fieldset><legend>Theme</legend>
            {['system', 'light', 'dark'].map(t => (
              <label key={t} className="opt"><input type="radio" name="theme" checked={s.theme === t} onChange={() => setS({ ...s, theme: t })} />{t[0].toUpperCase() + t.slice(1)}</label>
            ))}
          </fieldset>
          <label className="opt"><input type="checkbox" checked={s.motion} onChange={e => setS({ ...s, motion: e.target.checked })} />Animations</label>
        </div>
      )}
    </div>
  );
}

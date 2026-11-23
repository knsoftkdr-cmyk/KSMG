// Feature flags for the Design Studio (tracker task 5).
// Stored in studio_settings under id 'features'. Each flag has an audience:
//   all      - everyone, including visitors who are not logged in
//   users    - any logged-in user
//   staff    - logged-in staff (any role other than 'customer')
//   selected - only the listed email addresses (staff always included, so they can test)
//   off      - nobody
// Selected emails are stored as SHA-256 hashes plus a masked label, because the
// settings row is readable by visitors and must not expose customer emails.
import { useEffect, useState } from 'react';
import { getSetting } from './settings.js';
import { useAuth } from './auth.jsx';

export const FLAGS = {
  classic: { label: 'Classic Design Studio', note: 'The whole /design-studio page and its menu link.' },
  threeD: { label: 'Advanced 3D preview', note: 'The 3D button and 3D view inside the Design Studio.' },
  ai: { label: 'AI Studio', note: 'AI design features (tracker tasks 35-41). Nothing uses this yet; it is ready for when they ship.' },
};
export const AUDIENCES = [
  ['all', 'Everyone'],
  ['users', 'Logged-in users'],
  ['staff', 'Staff only'],
  ['selected', 'Selected emails'],
  ['off', 'Nobody (off)'],
];
export const DEFAULT_FEATURES = {
  classic: { audience: 'all', emails: [] },
  threeD: { audience: 'all', emails: [] },
  ai: { audience: 'off', emails: [] },
};

// Accepts the saved row (including the old { threeD: true/false } shape) and fills gaps.
export function normaliseFeatures(raw) {
  const out = {};
  for (const k of Object.keys(DEFAULT_FEATURES)) {
    const v = raw?.[k];
    if (v === true) out[k] = { audience: 'all', emails: [] };
    else if (v === false) out[k] = { audience: 'off', emails: [] };
    else if (v && typeof v === 'object' && AUDIENCES.some(([a]) => a === v.audience)) {
      out[k] = { audience: v.audience, emails: Array.isArray(v.emails) ? v.emails : [] };
    } else out[k] = { ...DEFAULT_FEATURES[k], emails: [] };
  }
  return out;
}

export async function hashEmail(email) {
  const bytes = new TextEncoder().encode(String(email).trim().toLowerCase());
  const buf = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function maskEmail(email) {
  const [name, domain = ''] = String(email).trim().toLowerCase().split('@');
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(1, name.length - 2))}@${domain}`;
}

// Pure check: is this flag on for this person? emailHash is the user's hashed email (or null).
export function isFeatureOn(flag, { user, role, emailHash }) {
  const staff = !!user && !!role && role !== 'customer';
  switch (flag?.audience) {
    case 'all': return true;
    case 'users': return !!user;
    case 'staff': return staff;
    case 'selected': return staff || (!!emailHash && (flag.emails || []).some(e => e.hash === emailHash));
    default: return false;
  }
}

let cache = null; // one fetch per page load
export function loadFeatures(force = false) {
  if (!cache || force) cache = getSetting('features').then(normaliseFeatures).catch(() => normaliseFeatures(null));
  return cache;
}

// React hook: { ready, on: { classic, threeD, ai } } for the current user.
export function useFeatures() {
  const { user, role, loading } = useAuth();
  const [state, setState] = useState({ ready: false, on: { classic: true, threeD: true, ai: false } });
  useEffect(() => {
    if (loading) return;
    let alive = true;
    (async () => {
      const flags = await loadFeatures();
      const emailHash = user?.email ? await hashEmail(user.email) : null;
      const on = {};
      for (const k of Object.keys(flags)) on[k] = isFeatureOn(flags[k], { user, role, emailHash });
      if (alive) setState({ ready: true, on });
    })();
    return () => { alive = false; };
  }, [user, role, loading]);
  return state;
}

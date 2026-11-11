import { useEffect, useState } from 'react';
import { listStaff, setUserRole } from '../services/staff.js';
import { useAuth } from '../services/auth.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

const ROLES = [
  ['customer', 'Customer'],
  ['sales', 'Sales'],
  ['product_manager', 'Product Manager'],
  ['super_admin', 'Super Admin'],
];

export default function Staff() {
  usePageMeta('Staff roles');
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const load = () => listStaff().then(setRows).catch(() => setErr('Could not load users.'));
  useEffect(() => { load(); }, []);

  const change = async (r, role) => {
    if (role === r.role) return;
    if (!confirm(`Change ${r.email} to ${role}?`)) return;
    setErr(''); setOk('');
    try {
      await setUserRole(r.email, role);
      setOk(`${r.email} is now ${role}.`);
      await load();
    } catch (e) {
      setErr(e.message || 'Could not change the role.');
    }
  };

  return (
    <section className="wrap">
      <h1>Staff roles</h1>
      <p className="note">Create the person first in Supabase (Authentication, Users). They will appear here as Customer. Then choose their role.</p>
      {err && <p className="err" role="alert">{err}</p>}
      {ok && <p role="status">{ok}</p>}
      {rows === null && !err && <p>Loading...</p>}
      {rows && (
        <table>
          <thead><tr><th>Email</th><th>Role</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.email}{r.id === user?.id ? ' (you)' : ''}</td>
                <td>
                  <select aria-label={`Role for ${r.email}`} value={r.role} disabled={r.id === user?.id}
                    onChange={e => change(r, e.target.value)}>
                    {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
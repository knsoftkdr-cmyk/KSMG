import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

export default function Login() {
  usePageMeta('Log in');
  const { user, role, signIn, signOut } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setBusy(true); setErr('');
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) return setErr('Wrong email or password.');
    nav('/');
  };

  if (user) {
    return (
      <section className="wrap narrow">
        <h1>You are logged in</h1>
        <p>{user.email} ({role})</p>
        <button className="btn ghost" onClick={signOut}>Log out</button>
      </section>
    );
  }

  return (
    <section className="wrap narrow">
      <h1>Log in</h1>
      <form onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn gold" disabled={busy}>{busy ? 'Please wait...' : 'Log in'}</button>
      </form>
    </section>
  );
}
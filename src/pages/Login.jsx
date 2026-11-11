import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/auth.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

export default function Login() {
  const { user, role, signIn, signUp, signOut } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '';
  const [mode, setMode] = useState(location.state?.signup ? 'signup' : 'login');
  usePageMeta(mode === 'login' ? 'Log in' : 'Create account');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user && from) nav(from, { replace: true });
  }, [user, from, nav]);

  const switchMode = m => { setMode(m); setErr(''); setInfo(''); };

  const submit = async e => {
    e.preventDefault();
    setErr(''); setInfo('');
    const mail = email.trim();
    if (mode === 'signup') {
      if (name.trim().length < 2) return setErr('Please enter your name.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) return setErr('Please enter a valid email, like name@example.com.');
      if (password.length < 8) return setErr('Password must be at least 8 characters.');
      if (password !== confirm) return setErr('The two passwords do not match.');
    }
    setBusy(true);
    if (mode === 'login') {
      const { error } = await signIn(mail, password);
      setBusy(false);
      if (error) return setErr('Wrong email or password.');
      return from ? undefined : nav('/');
    }
    const { data, error } = await signUp(mail, password, name.trim());
    setBusy(false);
    if (error) return setErr(error.message || 'Could not create the account. Please try again.');
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return setErr('This email may already have an account. Try logging in.');
    }
    if (data.session) return from ? undefined : nav('/');
    setInfo('Account created. Please check your email and click the link to confirm, then log in.');
    setPassword(''); setConfirm('');
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
      <h1>{mode === 'login' ? 'Log in' : 'Create account'}</h1>
      <form onSubmit={submit}>
        {mode === 'signup' && (
          <label>Your name<input value={name} onChange={e => setName(e.target.value)} required autoComplete="name" /></label>
        )}
        <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        {mode === 'signup' && (
          <label>Confirm password<input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" /></label>
        )}
        {err && <p className="err" role="alert">{err}</p>}
        {info && <p role="status">{info}</p>}
        <button className="btn gold" disabled={busy}>
          {busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>
      <p>
        {mode === 'login'
          ? <>New customer? <button type="button" className="btn ghost" onClick={() => switchMode('signup')}>Create an account</button></>
          : <>Already have an account? <button type="button" className="btn ghost" onClick={() => switchMode('login')}>Log in</button></>}
      </p>
    </section>
  );
}
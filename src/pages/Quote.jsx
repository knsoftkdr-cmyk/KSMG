import { useEffect, useState } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { getAll } from '../services/db.js';
import { submitEnquiry } from '../services/enquiries.js';
import { useAuth } from '../services/auth.jsx';
import { INDUSTRIES } from '../data/industries.js';
import usePageMeta from '../hooks/usePageMeta.js';


function readDesign(wanted) {
  if (!wanted) return null;
  try { return JSON.parse(sessionStorage.getItem('ksmg-design') || 'null'); } catch { return null; }
}
export default function Quote() {
  usePageMeta('Request a quote', 'Send your uniform requirements, sizes and quantities to get a quotation from Prasanna Reddy Garments.');
  const [params] = useSearchParams();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const design = readDesign(params.get('design') === '1');
  const [f, setF] = useState({
    name: '', organisation: '', industry: design?.industry || '', email: '', phone: '',
    productId: params.get('product') || '', quantity: design?.total > 0 ? String(design.total) : '',
    location: '', neededBy: '', message: design?.text || '',
  });
  const [rfqId, setRfqId] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { getAll('products').then(setProducts); }, []);
  useEffect(() => {
    if (user?.email) setF(old => (old.email ? old : { ...old, email: user.email }));
  }, [user]);
  const set = k => e => setF({ ...f, [k]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    const email = f.email.trim(), digits = f.phone.replace(/\D/g, '');
    if (f.name.trim().length < 2) return setErr('Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setErr('Please enter a valid email, like name@example.com.');
    if (f.phone.trim() && (digits.length < 8 || digits.length > 15)) return setErr('Phone number should have 8 to 15 digits.');
    if (f.name.trim().length > 100 || f.organisation.length > 150 || f.location.length > 150) return setErr('Name, organisation or location is too long.');
    if (f.message.length > 5000) return setErr('Details can have at most 5000 characters.');
    if (f.quantity && (!Number.isInteger(Number(f.quantity)) || Number(f.quantity) < 1 || Number(f.quantity) > 1000000)) return setErr('Quantity must be a whole number from 1 to 1,000,000.');
    if (f.neededBy && f.neededBy < new Date().toLocaleDateString('en-CA')) return setErr('Needed-by date cannot be in the past.');
    setErr('');
    setBusy(true);
    try {
      const p = products.find(x => x.id === f.productId);
      const id = await submitEnquiry({ ...f, email }, p?.name || '', p?.id || '');
      try { sessionStorage.removeItem('ksmg-design'); } catch { /* ignore */ }
      setRfqId(id);
    } catch {
      setErr('Could not send your request. Please try again.');
    }
    setBusy(false);
  };

  if (loading) return <section className="wrap narrow"><p>Loading...</p></section>;

  if (!user) {
    const from = location.pathname + location.search;
    return (
      <section className="wrap narrow">
        <h1>Log in to request a quote</h1>
        <p>Please log in or create a free account first. Then you can track your request and see our quote on this website.</p>
        <p className="row">
          <Link to="/login" state={{ from }} className="btn gold">Log in</Link>
          {' '}
          <Link to="/login" state={{ from, signup: true }} className="btn ghost">Create an account</Link>
        </p>
      </section>
    );
  }

  if (rfqId) {
    return (
      <section className="wrap narrow">
        <h1>Thank you</h1>
        <p>Your quote request is received. Your reference number is:</p>
        <p className="rfq-id">{rfqId}</p>
        <p className="rfq-note">Our sales team will review your request. Please keep this reference number.</p>
        <p><Link to="/my-requests">Track this request in My requests</Link></p>
        <Link to="/products" className="btn ghost">Back to products</Link>
      </section>
    );
  }

  return (
    <section className="wrap narrow">
      <h1>Request a quote</h1>
      <form onSubmit={submit}>
        
        {design && <p className="ds-note small">Your Design Studio details are filled in below. You can edit them.</p>}
        <label>Your name<input value={f.name} onChange={set('name')} required /></label>
        <label>Organisation<input value={f.organisation} onChange={set('organisation')} /></label>
        <label>Industry
          <select value={f.industry} onChange={set('industry')}>
            <option value="">Select industry</option>
            {INDUSTRIES.map(i => <option key={i.slug} value={i.name}>{i.name}</option>)}
          </select>
        </label>
        <label>Email<input type="email" value={f.email} onChange={set('email')} required /></label>
        <label>Phone<input value={f.phone} onChange={set('phone')} /></label>
        <label>Product
          <select value={f.productId} onChange={set('productId')}>
            <option value="">Not sure yet</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label>Approximate quantity<input type="number" min="1" value={f.quantity} onChange={set('quantity')} /></label>
        <label>Delivery location (city, country)<input value={f.location} onChange={set('location')} /></label>
        <label>Needed by (date)<input type="date" value={f.neededBy} onChange={set('neededBy')} /></label>
        <label>Details (sizes, logo, other needs)<textarea rows="4" value={f.message} onChange={set('message')} /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn gold" disabled={busy}>{busy ? 'Sending...' : 'Send quote request'}</button>
      </form>
    </section>
  );
}
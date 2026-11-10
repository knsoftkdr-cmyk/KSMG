import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getAll, save, newId } from '../services/db.js';
import { INDUSTRIES } from '../data/industries.js';

async function nextRfqId() {
  const all = await getAll('enquiries');
  const y = new Date().getFullYear();
  const nums = all
    .map(e => e.rfqId)
    .filter(id => id && id.startsWith(`RFQ-${y}-`))
    .map(id => Number(id.split('-')[2]) || 0);
  const n = (nums.length ? Math.max(...nums) : 0) + 1;
  return `RFQ-${y}-${String(n).padStart(4, '0')}`;
}

export default function Quote() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [f, setF] = useState({
    name: '', organisation: '', industry: '', email: '', phone: '',
    productId: params.get('product') || '', quantity: '',
    location: '', neededBy: '', message: '',
  });
  const [rfqId, setRfqId] = useState('');
  useEffect(() => { getAll('products').then(setProducts); }, []);
  const set = k => e => setF({ ...f, [k]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    const p = products.find(x => x.id === f.productId);
    const id = await nextRfqId();
    await save('enquiries', {
      ...f,
      id: newId(),
      rfqId: id,
      status: 'New',
      productName: p?.name || '',
      createdAt: Date.now(),
    });
    setRfqId(id);
  };

  if (rfqId) {
    return (
      <section className="wrap narrow">
        <h1>Thank you</h1>
        <p>Your quote request is saved. Your reference number is:</p>
        <p className="rfq-id">{rfqId}</p>
        <p className="rfq-note">Demo note: at this stage requests are saved only in this browser. They will reach the sales team once the backend is connected.</p>
        <Link to="/products" className="btn ghost">Back to products</Link>
      </section>
    );
  }

  return (
    <section className="wrap narrow">
      <h1>Request a quote</h1>
      <form onSubmit={submit}>
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
        <button className="btn gold">Send quote request</button>
      </form>
    </section>
  );
}
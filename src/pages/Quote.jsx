import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAll, save, newId } from '../services/db.js';
export default function Quote() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [f, setF] = useState({ name: '', organisation: '', email: '', phone: '', productId: params.get('product') || '', quantity: '', message: '' });
  const [done, setDone] = useState(false);
  useEffect(() => { getAll('products').then(setProducts); }, []);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault();
    const p = products.find(x => x.id === f.productId);
    await save('enquiries', { ...f, id: newId(), productName: p?.name || '', createdAt: Date.now() });
    setDone(true);
  };
  if (done) return <section className="wrap narrow"><h1>Thank you</h1><p>Your quote request is saved. Our sales team will contact you.</p></section>;
  return (
    <section className="wrap narrow">
      <h1>Request a quote</h1>
      <form onSubmit={submit}>
        <label>Your name<input value={f.name} onChange={set('name')} required /></label>
        <label>Organisation<input value={f.organisation} onChange={set('organisation')} /></label>
        <label>Email<input type="email" value={f.email} onChange={set('email')} required /></label>
        <label>Phone<input value={f.phone} onChange={set('phone')} /></label>
        <label>Product<select value={f.productId} onChange={set('productId')}><option value="">Not sure yet</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label>Approximate quantity<input type="number" min="1" value={f.quantity} onChange={set('quantity')} /></label>
        <label>Details (sizes, logo, delivery location)<textarea rows="4" value={f.message} onChange={set('message')} /></label>
        <button className="btn gold">Send quote request</button>
      </form>
    </section>
  );
}

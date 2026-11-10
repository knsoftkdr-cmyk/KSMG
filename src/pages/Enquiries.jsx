import { useEffect, useState } from 'react';
import { getAll, remove } from '../services/db.js';
export default function Enquiries() {
  const [list, setList] = useState(null);
  const load = () => getAll('enquiries').then(r => setList(r.sort((a, b) => b.createdAt - a.createdAt)));
  useEffect(() => { load(); }, []);
  if (!list) return <section className="wrap">Loading...</section>;
  return (
    <section className="wrap">
      <h1>Quote requests</h1>
      {list.length === 0 && <p>No requests yet.</p>}
      {list.map(e => (
        <div key={e.id} className="card">
          <h3>{e.name}{e.organisation && `, ${e.organisation}`}</h3>
          <p>{e.email} {e.phone && `| ${e.phone}`}</p>
          <p>{e.productName || 'No product chosen'}{e.quantity && ` | Qty ${e.quantity}`}</p>
          <p>{e.message}</p>
          <small>{new Date(e.createdAt).toLocaleString()}</small>{' '}
          <button className="btn ghost" onClick={async () => { await remove('enquiries', e.id); load(); }}>Delete</button>
        </div>
      ))}
    </section>
  );
}

import { useEffect, useState } from 'react';
import { getAll, save, remove } from '../services/db.js';

const STATUSES = ['New', 'In review', 'Quoted', 'Closed'];

export default function Enquiries() {
  const [list, setList] = useState(null);
  const [filter, setFilter] = useState('All');
  const load = () => getAll('enquiries').then(r => setList(r.sort((a, b) => b.createdAt - a.createdAt)));
  useEffect(() => { load(); }, []);

  const changeStatus = async (e, status) => {
    await save('enquiries', { ...e, status });
    load();
  };

  if (!list) return <section className="wrap">Loading...</section>;
  const shown = filter === 'All' ? list : list.filter(e => (e.status || 'New') === filter);

  return (
    <section className="wrap">
      <h1>Quote requests</h1>
      <p className="rfq-note">Demo: this page is open to everyone for now. It will be restricted to staff logins with the backend.</p>
      <label className="rfq-filter">Show
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option>All</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </label>
      {shown.length === 0 && <p>No requests to show.</p>}
      {shown.map(e => {
        const status = e.status || 'New';
        return (
          <div key={e.id} className="card">
            <p className="rfq-id small">{e.rfqId || 'No ID (older request)'}</p>
            <h3>{e.name}{e.organisation && `, ${e.organisation}`}</h3>
            {e.industry && <p>Industry: {e.industry}</p>}
            <p>{e.email} {e.phone && `| ${e.phone}`}</p>
            <p>{e.productName || 'No product chosen'}{e.quantity && ` | Qty ${e.quantity}`}</p>
            {e.location && <p>Delivery: {e.location}{e.neededBy && ` | Needed by ${e.neededBy}`}</p>}
            <p>{e.message}</p>
            <small>{new Date(e.createdAt).toLocaleString()}</small>
            <div className="rfq-actions">
              <span className={`status status-${status.replace(' ', '-').toLowerCase()}`}>{status}</span>
              <select value={status} onChange={ev => changeStatus(e, ev.target.value)} aria-label="Change status">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
              <button className="btn ghost" onClick={async () => { await remove('enquiries', e.id); load(); }}>Delete</button>
            </div>
          </div>
        );
      })}
    </section>
  );
}
import { useEffect, useState } from 'react';
import { listEnquiries, setEnquiryStatus } from '../services/enquiries.js';
import usePageMeta from '../hooks/usePageMeta.js';

const STATUSES = ['New', 'In review', 'Quoted', 'Closed'];

export default function Enquiries() {
  usePageMeta('Quote requests');
  const [list, setList] = useState(null);
  const [filter, setFilter] = useState('All');
  const [err, setErr] = useState('');
  const load = () => listEnquiries().then(setList).catch(() => { setErr('Could not load quote requests.'); setList([]); });
  useEffect(() => { load(); }, []);

  const changeStatus = async (e, status) => {
    setErr('');
    try { await setEnquiryStatus(e.id, status); } catch { setErr('Could not change the status.'); }
    load();
  };

  if (!list) return <section className="wrap">Loading...</section>;
  const shown = filter === 'All' ? list : list.filter(e => (e.status || 'New') === filter);

  return (
    <section className="wrap">
      <h1>Quote requests</h1>
      {err && <p className="err" role="alert">{err}</p>}
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
            <p className="rfq-id small">{e.rfqId}</p>
            <h2>{e.name}{e.organisation && `, ${e.organisation}`}</h2>
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
            </div>
          </div>
        );
      })}
    </section>
  );
}
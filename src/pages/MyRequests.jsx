import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myRequests } from '../services/enquiries.js';
import { useAuth } from '../services/auth.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

const money = n => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function MyRequests() {
  usePageMeta('My requests');
  const { user, loading } = useAuth();
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  const uid = user?.id;

  useEffect(() => {
    if (!uid) return;
    myRequests().then(setList).catch(() => { setErr('Could not load your requests.'); setList([]); });
  }, [uid]);

  if (loading) return <section className="wrap narrow"><p>Loading...</p></section>;
  if (!user) {
    return (
      <section className="wrap narrow">
        <h1>Please log in</h1>
        <p>Log in to see your quote requests and quotes.</p>
        <Link to="/login" className="btn gold">Log in</Link>
      </section>
    );
  }
  if (!list) return <section className="wrap narrow"><p>Loading...</p></section>;

  return (
    <section className="wrap narrow">
      <h1>My requests</h1>
      {err && <p className="err" role="alert">{err}</p>}
      {list.length === 0 && !err && (
        <>
          <p>You have no quote requests yet. Requests you send while logged in will appear here.</p>
          <Link to="/quote" className="btn gold">Request a quote</Link>
        </>
      )}
      {list.map(r => (
        <div key={r.id} className="card">
          <p className="rfq-id small">{r.rfqId}</p>
          <h2>{r.productName || 'No product chosen'}{r.quantity && ` | Qty ${r.quantity}`}</h2>
          {r.location && <p>Delivery: {r.location}{r.neededBy && ` | Needed by ${r.neededBy}`}</p>}
          {r.message && <p>{r.message}</p>}
          <small>Sent on {new Date(r.createdAt).toLocaleString()}</small>
          <div className="rfq-actions">
            <span className={`status status-${r.status.replace(' ', '-').toLowerCase()}`}>{r.status}</span>
          </div>
          <h3>Quotes</h3>
          {r.quotes.length === 0 && <p className="note">No quote has been sent to you yet. Our sales team is reviewing your request.</p>}
          {r.quotes.map((q, i) => {
            const sub = q.unitPrice * q.quantity;
            const tax = sub * q.gst / 100;
            return (
              <div key={q.id} className="my-quote">
                <p>
                  <strong>Quote v{q.version}</strong>{i === 0 && ' (latest)'}<br />
                  {money(q.unitPrice)} per piece x {q.quantity} = {money(sub)}<br />
                  GST {q.gst}% = {money(tax)}<br />
                  <strong>Total: {money(sub + tax)}</strong>
                </p>
                {q.validUntil && <p>Valid until {q.validUntil}</p>}
                {q.notes && <p>{q.notes}</p>}
                <small>Sent on {new Date(q.sentAt).toLocaleString()}</small>
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}
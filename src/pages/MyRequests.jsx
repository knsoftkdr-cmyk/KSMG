import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myRequests, respondToQuote } from '../services/enquiries.js';
import { useAuth } from '../services/auth.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

const money = n => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function QuoteBox({ q, isLatest, locked, onDone, onError }) {
  const [asking, setAsking] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const sub = q.unitPrice * q.quantity;
  const tax = sub * q.gst / 100;
  const total = sub + tax;
  const expired = q.validUntil && q.validUntil < new Date().toLocaleDateString('en-CA');

  const reply = async (answer, note = '') => {
    setBusy(true);
    try {
      await respondToQuote(q.id, answer, note);
      onError('');
      setAsking(false); setText('');
      await onDone();
    } catch (e) {
      onError(e?.message || 'Could not send your reply. Please try again.');
    }
    setBusy(false);
  };

  const accept = () => {
    if (!window.confirm(`Accept quote v${q.version} (total ${money(total)})? Our sales team will be told.`)) return;
    reply('accepted');
  };

  const askChanges = () => {
    const t = text.trim();
    if (t.length < 3) return onError('Please write what you want changed.');
    if (t.length > 2000) return onError('Please keep your message under 2000 characters.');
    reply('changes_requested', t);
  };

  return (
    <div className="my-quote">
      <p>
        <strong>Quote v{q.version}</strong>{isLatest && ' (latest)'}<br />
        {money(q.unitPrice)} per piece x {q.quantity} = {money(sub)}<br />
        GST {q.gst}% = {money(tax)}<br />
        <strong>Total: {money(total)}</strong>
      </p>
      {q.validUntil && <p>{expired ? 'Expired on' : 'Valid until'} {q.validUntil}</p>}
      {q.notes && <p>{q.notes}</p>}
      <small>Sent on {new Date(q.sentAt).toLocaleString()}</small>

      {q.response === 'accepted' && (
        <p className="quote-reply"><strong>You accepted this quote</strong> on {new Date(q.respondedAt).toLocaleString()}. Our sales team will contact you for the next step.</p>
      )}
      {q.response === 'changes_requested' && (
        <p className="quote-reply"><strong>You asked for changes</strong> on {new Date(q.respondedAt).toLocaleString()}: {q.responseNote}<br />We will send you a new quote.</p>
      )}
      {!q.response && !isLatest && <p className="note">This quote was replaced by a newer one.</p>}
      {!q.response && isLatest && locked && <p className="note">Another quote was already accepted.</p>}
      {!q.response && isLatest && !locked && (
        <div className="quote-reply">
          {expired && <p className="note">This quote has expired. You can ask for a new one.</p>}
          {!asking && (
            <div className="rfq-actions">
              {!expired && <button type="button" className="btn gold" disabled={busy} onClick={accept}>Accept this quote</button>}
              <button type="button" className="btn ghost" disabled={busy} onClick={() => setAsking(true)}>Ask for changes</button>
            </div>
          )}
          {asking && (
            <>
              <label>What would you like changed? (price, quantity, delivery date...)
                <textarea rows="3" value={text} onChange={e => setText(e.target.value)} maxLength={2000} />
              </label>
              <div className="rfq-actions">
                <button type="button" className="btn gold" disabled={busy} onClick={askChanges}>{busy ? 'Sending...' : 'Send request'}</button>
                <button type="button" className="btn ghost" disabled={busy} onClick={() => { setAsking(false); onError(''); }}>Cancel</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyRequests() {
  usePageMeta('My requests');
  const { user, loading } = useAuth();
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  const uid = user?.id;

  const load = () => myRequests().then(setList).catch(() => { setErr('Could not load your requests.'); setList(l => l || []); });
  useEffect(() => { if (uid) load(); }, [uid]);

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
      {list.map(r => {
        const locked = r.quotes.some(q => q.response === 'accepted');
        return (
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
            {r.quotes.map((q, i) => (
              <QuoteBox key={q.id} q={q} isLatest={i === 0} locked={locked} onDone={load} onError={setErr} />
            ))}
          </div>
        );
      })}
    </section>
  );
}
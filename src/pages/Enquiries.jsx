import { useEffect, useState } from 'react';
import usePageMeta from '../hooks/usePageMeta.js';
import { listEnquiries, setEnquiryStatus, listEvents, addNote, listQuotes, addQuote, sendQuote, listSamples, sendSample, listDispatches, addDispatch } from '../services/enquiries.js';
import PoDownloads from '../components/PoDownloads.jsx';
import { listFeedback } from '../services/enquiries.js';
import InvoiceUpload from '../components/InvoiceUpload.jsx';

const STATUSES = ['New', 'In review', 'Quoted', 'Accepted', 'Sample sent', 'Sample changes', 'Sample approved', 'PO received', 'In production', 'Quality check', 'Dispatched', 'Delivered', 'Closed'];
const money = n => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Notes({ enquiryId, events, onAdded, onError }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const add = async () => {
    const t = text.trim();
    if (!t) return onError('Write a note first.');
    if (t.length > 2000) return onError('A note can have at most 2000 characters.');
    setBusy(true);
    try { await addNote(enquiryId, t); setText(''); onError(''); await onAdded(); }
    catch { onError('Could not save the note.'); }
    setBusy(false);
  };
  return (
    <details className="rfq-events">
      <summary>Notes and history ({events.length})</summary>
      {events.length === 0 && <p>No notes or changes yet.</p>}
      <ul>
        {events.map(ev => (
          <li key={ev.id}>
            {ev.kind === 'note'
              ? <><strong>Note:</strong> {ev.body}</>
              : <><strong>Status:</strong> {ev.oldStatus || 'New'} to {ev.newStatus}</>}
            <br /><small>{ev.by || 'Unknown'} | {new Date(ev.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
      <label>Add a note
        <textarea rows="2" value={text} onChange={e => setText(e.target.value)} maxLength={2000} />
      </label>
      <button type="button" className="btn ghost" disabled={busy} onClick={add}>{busy ? 'Saving...' : 'Save note'}</button>
    </details>
  );
}

function Quotes({ enquiry, quotes, onAdded, onError }) {
  const [f, setF] = useState({ price: '', qty: enquiry.quantity ? String(enquiry.quantity) : '', gst: '5', valid: '', note: '' });
  const [busy, setBusy] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const accepted = quotes.some(q => q.response === 'accepted');
  const today = new Date().toLocaleDateString('en-CA');

  const add = async () => {
    const price = Number(f.price), qty = Number(f.qty), gst = Number(f.gst);
    if (!(price > 0)) return onError('Price per piece must be more than 0.');
    if (!Number.isInteger(qty) || qty < 1) return onError('Quantity must be a whole number, 1 or more.');
    if (f.gst === '' || !(gst >= 0 && gst <= 100)) return onError('GST must be between 0 and 100.');
    if (f.valid && f.valid < today) return onError('Valid until cannot be in the past.');
    if (f.note.length > 2000) return onError('Notes can have at most 2000 characters.');
    setBusy(true);
    try {
      await addQuote(enquiry.id, { price, qty, gst, valid: f.valid, note: f.note.trim() });
      setF({ ...f, price: '', valid: '', note: '' });
      onError('');
      await onAdded();
    } catch { onError('Could not save the quote version.'); }
    setBusy(false);
  };

  const send = async q => {
    if (!window.confirm(`Send quote v${q.version} to the customer? They will be able to see it. This cannot be undone.`)) return;
    setBusy(true);
    try { await sendQuote(q.id); onError(''); await onAdded(); }
    catch { onError('Could not send the quote.'); }
    setBusy(false);
  };

  return (
    <details className="rfq-events">
      <summary>Quote versions ({quotes.length})</summary>
      {!enquiry.userId && (
        <p className="note">This request was sent without login, so the customer cannot see quotes on the website. Send the quote by email or phone.</p>
      )}
      {quotes.length === 0 && <p>No quote created yet.</p>}
      <ul>
        {[...quotes].reverse().map(q => {
          const sub = q.unitPrice * q.quantity;
          const tax = sub * q.gst / 100;
          return (
            <li key={q.id}>
              <strong>v{q.version}</strong>: {money(q.unitPrice)} x {q.quantity} = {money(sub)}
              {' '}+ GST {q.gst}% ({money(tax)}) = <strong>{money(sub + tax)}</strong>
              {q.validUntil && <> | Valid until {q.validUntil}</>}
              {q.notes && <><br />{q.notes}</>}
              <br /><small>{q.by || 'Unknown'} | {new Date(q.createdAt).toLocaleString()}</small>
              {q.sentAt
                ? <><br /><small><strong>Sent to customer</strong> | {new Date(q.sentAt).toLocaleString()}</small></>
                : <>
                    <br /><small>Draft: the customer cannot see this yet.</small>
                    {enquiry.userId && !accepted && (
                      <> <button type="button" className="btn ghost" disabled={busy} onClick={() => send(q)}>Send to customer</button></>
                    )}
                  </>}
              {q.response === 'accepted' && (
                <><br /><strong>Customer accepted this quote</strong> | {new Date(q.respondedAt).toLocaleString()}</>
              )}
              {q.response === 'changes_requested' && (
                <><br /><strong>Customer asked for changes:</strong> {q.responseNote} | {new Date(q.respondedAt).toLocaleString()}</>
              )}
            </li>
          );
        })}
      </ul>
      {accepted ? (
        <p className="note">The customer accepted a quote, so no new version can be created.</p>
      ) : (
      <>
      <h3>New version (v{quotes.length + 1})</h3>
      <label>Price per piece<input type="number" min="0" step="0.01" value={f.price} onChange={set('price')} /></label>
      <label>Quantity<input type="number" min="1" step="1" value={f.qty} onChange={set('qty')} /></label>
      <label>GST %<input type="number" min="0" max="100" step="0.01" value={f.gst} onChange={set('gst')} /></label>
      <label>Valid until<input type="date" value={f.valid} min={today} onChange={set('valid')} /></label>
      <label>Notes (the customer sees these after you send)<textarea rows="2" value={f.note} onChange={set('note')} maxLength={2000} /></label>
      <button type="button" className="btn gold" disabled={busy} onClick={add}>{busy ? 'Saving...' : 'Save quote version'}</button>
            </>
      )}
    </details>
  );
}

function Samples({ enquiry, quotes, samples, onAdded, onError }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const accepted = quotes.some(q => q.response === 'accepted');
  const approved = samples.some(s => s.response === 'approved');
  const waiting = samples.some(s => !s.response);
  const closed = enquiry.status === 'Closed';
  if (!accepted && samples.length === 0) return null;

  const send = async () => {
    if (note.length > 2000) return onError('Notes can have at most 2000 characters.');
    if (!window.confirm('Mark the sample as sent? The customer will see it and can approve it.')) return;
    setBusy(true);
    try { await sendSample(enquiry.id, note.trim()); setNote(''); onError(''); await onAdded(); }
    catch (e) { onError(e?.message || 'Could not save the sample.'); }
    setBusy(false);
  };

  return (
    <details className="rfq-events">
      <summary>Sample ({samples.length})</summary>
      {samples.length === 0 && <p>No sample sent yet. If a sample is not needed, the customer can upload the purchase order directly.</p>}
      <ul>
        {[...samples].reverse().map(s => (
          <li key={s.id}>
            <strong>Sample sent</strong>{s.note && <>: {s.note}</>}
            <br /><small>{s.by || 'Unknown'} | {new Date(s.sentAt).toLocaleString()}</small>
            {s.response === 'approved' && (
              <><br /><strong>Customer approved the sample</strong> | {new Date(s.respondedAt).toLocaleString()}</>
            )}
            {s.response === 'changes_requested' && (
              <><br /><strong>Customer asked for changes:</strong> {s.responseNote} | {new Date(s.respondedAt).toLocaleString()}</>
            )}
            {!s.response && <><br /><small>Waiting for the customer to reply.</small></>}
          </li>
        ))}
      </ul>
      {approved && <p className="note">The sample is approved.</p>}
      {!approved && waiting && <p className="note">Waiting for the customer to reply to the last sample.</p>}
      {!approved && !waiting && !closed && (
        <>
          <label>Notes for the customer (optional)
            <textarea rows="2" value={note} onChange={e => setNote(e.target.value)} maxLength={2000} />
          </label>
          <button type="button" className="btn gold" disabled={busy} onClick={send}>{busy ? 'Saving...' : 'Mark sample as sent'}</button>
        </>
      )}
    </details>
  );
}

function Dispatches({ enquiry, items, onAdded, onError }) {
  const [f, setF] = useState({ courier: '', tracking: '', note: '' });
  const [busy, setBusy] = useState(false);
  const status = enquiry.status || 'New';
  const show = ['PO received', 'In production', 'Quality check', 'Dispatched', 'Delivered'].includes(status);
  if (!show && items.length === 0) return null;
  const set = k => e => setF({ ...f, [k]: e.target.value });

  const add = async () => {
    const courier = f.courier.trim();
    if (courier.length < 2) return onError('Enter the courier or transport name.');
    if (f.tracking.length > 80) return onError('Tracking number can have at most 80 characters.');
    if (f.note.length > 2000) return onError('Notes can have at most 2000 characters.');
    if (!window.confirm('Save dispatch details? The customer will see them and the status will change to Dispatched.')) return;
    setBusy(true);
    try {
      await addDispatch(enquiry.id, courier, f.tracking.trim(), f.note.trim());
      if (!['Dispatched', 'Delivered'].includes(status)) await setEnquiryStatus(enquiry.id, 'Dispatched');
      setF({ courier: '', tracking: '', note: '' });
      onError('');
      await onAdded();
    } catch (e) { onError(e?.message || 'Could not save the dispatch details.'); }
    setBusy(false);
  };

  return (
    <details className="rfq-events">
      <summary>Dispatch ({items.length})</summary>
      {items.length === 0 && <p>No dispatch recorded yet.</p>}
      <ul>
        {[...items].reverse().map(d => (
          <li key={d.id}>
            <strong>{d.courier}</strong>{d.trackingNo && <> | Tracking: {d.trackingNo}</>}
            {d.note && <><br />{d.note}</>}
            <br /><small>{new Date(d.sentAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
      <label>Courier / transport name<input value={f.courier} onChange={set('courier')} maxLength={80} /></label>
      <label>Tracking number (optional)<input value={f.tracking} onChange={set('tracking')} maxLength={80} /></label>
      <label>Notes for the customer (optional)<textarea rows="2" value={f.note} onChange={set('note')} maxLength={2000} /></label>
      <button type="button" className="btn gold" disabled={busy} onClick={add}>{busy ? 'Saving...' : 'Save dispatch'}</button>
    </details>
  );
}

export default function Enquiries() {
  usePageMeta('Quote requests');
  const [list, setList] = useState(null);
  const [events, setEvents] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [samples, setSamples] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [err, setErr] = useState('');
  const load = async () => {
    try {
      setList(await listEnquiries());
      setEvents(await listEvents());
      setQuotes(await listQuotes());
      setSamples(await listSamples());
      try { setDispatches(await listDispatches()); } catch { setDispatches([]); }
            try { setFeedback(await listFeedback()); } catch { setFeedback([]); }
    } catch { setErr('Could not load quote requests.'); setList(l => l || []); }
  };
  useEffect(() => { load(); }, []);

  const changeStatus = async (e, status) => {
    setErr('');
    try { await setEnquiryStatus(e.id, status); } catch { setErr('Could not change the status.'); }
    load();
  };

  if (!list) return <section className="wrap">Loading...</section>;
  const filtered = filter === 'All' ? list : list.filter(e => (e.status || 'New') === filter);
  const PAGE_SIZE = 10;
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const shown = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  return (
    <section className="wrap">
      <h1>Quote requests</h1>
      {err && <p className="err" role="alert">{err}</p>}
      <label className="rfq-filter">Show
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}>
          <option>All</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </label>
      {shown.length === 0 && <p>No requests to show.</p>}
      {shown.map(e => {
        const status = e.status || 'New';
        const mine = quotes.filter(x => x.enquiryId === e.id);
        const accepted = mine.find(x => x.response === 'accepted');
        const sentOnes = mine.filter(x => x.sentAt);
        const latest = sentOnes.length ? sentOnes[sentOnes.length - 1] : null;
        return (
          <div key={e.id} className="card">
                        <div className="rq-head">
              <span className="rfq-id small">{e.rfqId}</span>
              <h2>{e.name}{e.organisation && `, ${e.organisation}`}</h2>
              <span className={`status status-${status.replace(' ', '-').toLowerCase()}`}>{status}</span>
            </div>
            <p className="rq-sum">{e.productName || 'No product chosen'}{e.quantity && ` | Qty ${e.quantity}`}<br />{e.email}{e.phone && ` | ${e.phone}`}</p>
            {accepted && <p className="quote-reply"><strong>Customer accepted quote v{accepted.version}.</strong></p>}
            {!accepted && latest && latest.response === 'changes_requested' && (
              <p className="quote-reply"><strong>Customer asked for changes on v{latest.version}.</strong> Create a new version and send it.</p>
            )}
            <div className="rfq-actions">
              <select value={status} onChange={ev => changeStatus(e, ev.target.value)} aria-label="Change status">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <details className="rfq-events">
              <summary>Request details</summary>
              {e.industry && <p>Industry: {e.industry}</p>}
              {e.location && <p>Delivery: {e.location}{e.neededBy && ` | Needed by ${e.neededBy}`}</p>}
              <p style={{ whiteSpace: 'pre-line' }}>{e.message}</p>
              <small>{new Date(e.createdAt).toLocaleString()}</small>
            </details>

            <details className="rfq-events rq-manage">
              <summary>Manage request</summary>
            <Quotes enquiry={e} quotes={mine} onAdded={load} onError={setErr} />
            <Samples enquiry={e} quotes={mine} samples={samples.filter(x => x.enquiryId === e.id)} onAdded={load} onError={setErr} />
            <PoDownloads enquiryId={e.id} />
            {e.userId && ['PO received', 'In production', 'Quality check', 'Dispatched', 'Delivered', 'Closed'].includes(status) && (
              <InvoiceUpload enquiryId={e.id} customerId={e.userId} />
            )}
            <Dispatches enquiry={e} items={dispatches.filter(x => x.enquiryId === e.id)} onAdded={load} onError={setErr} />
              {feedback.filter(f => f.enquiryId === e.id).map(f => (
              <p key={f.createdAt} className="quote-reply"><strong>Customer feedback: {f.rating} / 5</strong>{f.comment && <> | {f.comment}</>}</p>
            ))}
            <Notes enquiryId={e.id} events={events.filter(x => x.enquiryId === e.id)} onAdded={load} onError={setErr} />
            </details>
          </div>
        );
      })}
            {pages > 1 && (
        <div className="rfq-actions">
          <button type="button" className="btn ghost" disabled={cur <= 1} onClick={() => setPage(cur - 1)}>Previous</button>
          <span>Page {cur} of {pages}</span>
          <button type="button" className="btn ghost" disabled={cur >= pages} onClick={() => setPage(cur + 1)}>Next</button>
        </div>
      )}
    </section>
  );
}
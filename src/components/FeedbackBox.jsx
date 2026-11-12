import { useEffect, useState } from 'react';
import { myFeedback, submitFeedback } from '../services/enquiries.js';

export default function FeedbackBox({ enquiryId }) {
  const [mine, setMine] = useState(undefined);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => myFeedback()
    .then(all => setMine(all.find(f => f.enquiryId === enquiryId) || null))
    .catch(() => setMine(null));
  useEffect(() => { load(); }, [enquiryId]);

  const submit = async () => {
    if (rating < 1) return setErr('Please choose a rating from 1 to 5.');
    if (text.length > 1000) return setErr('Please keep your comment under 1000 characters.');
    setErr('');
    setBusy(true);
    try {
      await submitFeedback(enquiryId, rating, text.trim());
      await load();
    } catch (e) {
      setErr(e?.message || 'Could not send your feedback. Please try again.');
    }
    setBusy(false);
  };

  if (mine === undefined) return null;
  if (mine) {
    return (
      <div className="my-quote">
        <p><strong>Your feedback:</strong> {mine.rating} / 5</p>
        {mine.comment && <p>{mine.comment}</p>}
        <small>Thank you. Sent on {new Date(mine.createdAt).toLocaleString()}</small>
      </div>
    );
  }
  return (
    <div className="my-quote">
      <h3>How was your order?</h3>
      <div className="rfq-actions">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" className={n === rating ? 'btn gold' : 'btn ghost'}
            aria-pressed={n === rating} onClick={() => setRating(n)}>{n}</button>
        ))}
      </div>
      <label>Comment (optional)
        <textarea rows="3" value={text} maxLength={1000} onChange={e => setText(e.target.value)} />
      </label>
      {err && <p className="err" role="alert">{err}</p>}
      <button type="button" className="btn gold" disabled={busy} onClick={submit}>
        {busy ? 'Sending...' : 'Send feedback'}
      </button>
    </div>
  );
}
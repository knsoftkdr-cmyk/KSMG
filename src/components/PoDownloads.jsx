import { useEffect, useState } from 'react';
import { listPosFor, poSignedUrl } from '../services/enquiries.js';

export default function PoDownloads({ enquiryId }) {
  const [pos, setPos] = useState([]);
  const [err, setErr] = useState('');
  useEffect(() => { listPosFor(enquiryId).then(setPos).catch(() => setPos([])); }, [enquiryId]);

  const open = async p => {
    setErr('');
    const w = window.open('', '_blank');
    try {
      const url = await poSignedUrl(p.filePath);
      if (w) { w.opener = null; w.location.href = url; }
    } catch {
      if (w) w.close();
      setErr('Could not open the file.');
    }
  };

  if (pos.length === 0) return null;
  return (
    <details className="rfq-events" open>
      <summary>Purchase orders ({pos.length})</summary>
      {err && <p className="err" role="alert">{err}</p>}
      <ul>
        {pos.map(p => (
          <li key={p.id}>
            <strong>{p.fileName}</strong>{p.poNumber && <> | PO {p.poNumber}</>}<br />
            <small>Uploaded {new Date(p.createdAt).toLocaleString()}</small>{' '}
            <button type="button" className="btn ghost" onClick={() => open(p)}>Open file</button>
          </li>
        ))}
      </ul>
    </details>
  );
}
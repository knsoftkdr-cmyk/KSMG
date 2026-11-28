import { useEffect, useState } from 'react';
import { listPosFor, uploadPo } from '../services/enquiries.js';
import { makePoTemplatePdf } from '../services/quotePdf.js';

const MAX_BYTES = 5 * 1024 * 1024;

export default function PoUpload({ enquiryId, enquiry, quote }) {
  const [pos, setPos] = useState(null);
  const [poNo, setPoNo] = useState('');
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => listPosFor(enquiryId).then(setPos).catch(() => setPos([]));
  useEffect(() => { load(); }, [enquiryId]);

  const submit = async () => {
    if (!file) return setErr('Please choose a file first.');
    if (!/\.(pdf|jpe?g|png)$/i.test(file.name)) return setErr('Only PDF, JPG or PNG files are allowed.');
    if (file.size === 0) return setErr('This file is empty.');
    if (file.size > MAX_BYTES) return setErr('The file is too big. Please keep it under 5 MB.');
    if (poNo.length > 50) return setErr('PO number can have at most 50 characters.');
    setErr('');
    setBusy(true);
    try {
      await uploadPo(enquiryId, file, poNo.trim());
      setFile(null); setPoNo(''); setFileKey(k => k + 1);
      await load();
    } catch (e) {
      setErr(e?.message || 'Could not upload the file. Please try again.');
    }
    setBusy(false);
  };

  return (
    <div className="po-box">
      <h3>Purchase order</h3>
      <p>You accepted a quote. Please upload your purchase order (PDF, JPG or PNG, up to 5 MB).</p>
      {enquiry && quote && (
        <p className="note">
          No purchase order format? Download our template. It already has the items, quantity and price from
          quote v{quote.version}. Fill in your company details, sign it, add your company stamp, then upload a scan or photo here.
          <br />
          <button type="button" className="btn ghost" onClick={() => makePoTemplatePdf(enquiry, quote)}>
            Download PO template
          </button>
        </p>
      )}
      {pos && pos.length > 0 && (
        <ul>
          {pos.map(p => (
            <li key={p.id}>
              {p.fileName}{p.poNumber && ` (PO ${p.poNumber})`}<br />
              <small>Uploaded {new Date(p.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
      {pos && pos.length < 5 && (
        <>
          <label>PO number (optional)
            <input value={poNo} maxLength={50} onChange={e => setPoNo(e.target.value)} />
          </label>
          <label>PO file
            <input key={fileKey} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={e => setFile(e.target.files[0] || null)} />
          </label>
          {err && <p className="err" role="alert">{err}</p>}
          <button type="button" className="btn gold" disabled={busy} onClick={submit}>
            {busy ? 'Uploading...' : 'Upload purchase order'}
          </button>
        </>
      )}
      {pos && pos.length >= 5 && <p className="note">You have uploaded the maximum of 5 files for this request.</p>}
    </div>
  );
}
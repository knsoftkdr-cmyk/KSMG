import { useEffect, useState } from 'react';
import { listInvoicesFor, uploadInvoice, invoiceSignedUrl } from '../services/enquiries.js';

const MAX_BYTES = 5 * 1024 * 1024;

export default function InvoiceUpload({ enquiryId, customerId }) {
  const [items, setItems] = useState(null);
  const [no, setNo] = useState('');
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => listInvoicesFor(enquiryId).then(setItems).catch(() => setItems([]));
  useEffect(() => { load(); }, [enquiryId]);

  const open = async it => {
    setErr('');
    const w = window.open('', '_blank');
    try {
      const url = await invoiceSignedUrl(it.filePath);
      if (w) { w.opener = null; w.location.href = url; }
    } catch {
      if (w) w.close();
      setErr('Could not open the file.');
    }
  };

  const submit = async () => {
    if (!customerId) return setErr('This request has no customer account.');
    if (!no.trim()) return setErr('Please enter the invoice number.');
    if (!file) return setErr('Please choose a PDF file.');
    if (!/\.pdf$/i.test(file.name)) return setErr('Only PDF files are allowed.');
    if (file.size === 0) return setErr('This file is empty.');
    if (file.size > MAX_BYTES) return setErr('The file is too big. Keep it under 5 MB.');
    setErr('');
    setBusy(true);
    try {
      await uploadInvoice(enquiryId, customerId, file, no.trim());
      setFile(null); setNo(''); setFileKey(k => k + 1);
      await load();
    } catch (e) {
      setErr(e?.message || 'Could not upload. Please try again.');
    }
    setBusy(false);
  };

  return (
    <div className="po-box">
      <h3>Invoices {items ? `(${items.length})` : ''}</h3>
      {items && items.length > 0 && (
        <ul>
          {items.map(it => (
            <li key={it.id}>
              <strong>{it.invoiceNumber}</strong> | {it.fileName}<br />
              <small>Uploaded {new Date(it.createdAt).toLocaleString()}</small>{' '}
              <button type="button" className="btn ghost" onClick={() => open(it)}>Open file</button>
            </li>
          ))}
        </ul>
      )}
      {items && items.length < 10 && (
        <>
          <label>Invoice number
            <input value={no} maxLength={50} onChange={e => setNo(e.target.value)} />
          </label>
          <label>Invoice PDF
            <input key={fileKey} type="file" accept=".pdf,application/pdf"
              onChange={e => setFile(e.target.files[0] || null)} />
          </label>
          {err && <p className="err" role="alert">{err}</p>}
          <button type="button" className="btn gold" disabled={busy} onClick={submit}>
            {busy ? 'Uploading...' : 'Upload invoice'}
          </button>
        </>
      )}
    </div>
  );
}
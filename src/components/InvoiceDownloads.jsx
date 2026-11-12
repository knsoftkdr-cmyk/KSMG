import { useEffect, useState } from 'react';
import { myInvoices, invoiceSignedUrl } from '../services/enquiries.js';

export default function InvoiceDownloads({ enquiryId }) {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    myInvoices().then(all => setItems(all.filter(i => i.enquiryId === enquiryId))).catch(() => setItems([]));
  }, [enquiryId]);

    const open = async it => {
    setErr('');
    try {
      const url = await invoiceSignedUrl(it.filePath, it.fileName);
      const a = document.createElement('a');
      a.href = url;
      a.download = it.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setErr('Could not download the file.');
    }
  };

  if (items.length === 0) return null;
  return (
    <details className="rfq-events" open>
      <summary>Invoices ({items.length})</summary>
      {err && <p className="err" role="alert">{err}</p>}
      <ul>
        {items.map(it => (
          <li key={it.id}>
            <strong>Invoice {it.invoiceNumber}</strong> | {it.fileName}<br />
            <small>Uploaded {new Date(it.createdAt).toLocaleString()}</small>{' '}
            <button type="button" className="btn ghost" onClick={() => open(it)}>Download</button>
          </li>
        ))}
      </ul>
    </details>
  );
}
import { useEffect, useMemo, useState } from 'react';
import { listEnquiries } from '../services/enquiries.js';
import usePageMeta from '../hooks/usePageMeta.js';

const STATUSES = ['New', 'In review', 'Quoted', 'Closed'];
const dayKey = t => new Date(t).toLocaleDateString('en-CA');

function countBy(list, fn) {
  const m = new Map();
  for (const e of list) {
    const k = fn(e) || 'Not set';
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function Bars({ title, rows, max = 8 }) {
  const shown = rows.slice(0, max);
  const top = Math.max(1, ...shown.map(r => r[1]));
  return (
    <div className="card dash-card">
      <h2>{title}</h2>
      {shown.length === 0 && <p>No data for this period.</p>}
      <ul className="bars">
        {shown.map(([k, v]) => (
          <li key={k}>
            <span className="bar-label">{k}</span>
            <span className="bar-track"><span className="bar-fill" style={{ width: `${(v / top) * 100}%` }} /></span>
            <span className="bar-num">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const safe = v => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
};

function downloadCsv(rows) {
  const head = ['RFQ', 'Status', 'Created', 'Name', 'Organisation', 'Industry', 'Email', 'Phone',
    'Product', 'Quantity', 'Location', 'Needed by', 'Message'];
  const lines = [head.map(safe).join(',')];
  for (const e of rows) {
    lines.push([e.rfqId, e.status || 'New', new Date(e.createdAt).toISOString(), e.name, e.organisation,
      e.industry, e.email, e.phone, e.productName, e.quantity, e.location, e.neededBy, e.message]
      .map(safe).join(','));
  }
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quote-requests-${dayKey(Date.now())}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  usePageMeta('Dashboard');
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    listEnquiries().then(setList).catch(() => { setErr('Could not load the data.'); setList([]); });
  }, []);

  const badRange = from && to && from > to;
  const shown = useMemo(() => {
    if (!list) return [];
    return list.filter(e => {
      const d = dayKey(e.createdAt);
      return (!from || d >= from) && (!to || d <= to);
    });
  }, [list, from, to]);

  if (!list) return <section className="wrap">Loading...</section>;

  const byStatus = STATUSES.map(s => [s, shown.filter(e => (e.status || 'New') === s).length]);
  const byIndustry = countBy(shown, e => e.industry);
  const byProduct = countBy(shown.filter(e => e.productName), e => e.productName);
  const byMonth = countBy(shown, e => dayKey(e.createdAt).slice(0, 7))
    .sort((a, b) => a[0].localeCompare(b[0])).slice(-12);

  return (
    <section className="wrap">
      <h1>Dashboard</h1>
      {err && <p className="err" role="alert">{err}</p>}
      <div className="dash-filter">
        <label>From<input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
        <label>To<input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
        <button type="button" className="btn ghost" onClick={() => { setFrom(''); setTo(''); }}>Clear dates</button>
        <button type="button" className="btn gold" disabled={shown.length === 0 || badRange} onClick={() => downloadCsv(shown)}>
          Download CSV ({shown.length})
        </button>
      </div>
      {badRange && <p className="err" role="alert">The From date must be before the To date.</p>}

      <div className="dash-stats">
        <div className="card dash-card"><p className="stat-num">{shown.length}</p><p>Quote requests</p></div>
        {byStatus.map(([s, n]) => (
          <div key={s} className="card dash-card"><p className="stat-num">{n}</p><p>{s}</p></div>
        ))}
      </div>

      {!badRange && (
        <div className="dash-grid">
          <Bars title="By status" rows={byStatus} />
          <Bars title="By industry" rows={byIndustry} />
          <Bars title="Most requested products" rows={byProduct} />
          <Bars title="Requests per month" rows={byMonth} max={12} />
        </div>
      )}
    </section>
  );
}
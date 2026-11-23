import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta.js';
import { INDUSTRIES, bdClass } from '../data/industries.js';
import {
  loadCatalogue, sectorLooks, sectorFabrics, collectionName, lookTitle, fabricTitle,
  lookSrc, swatchSrc, lookText, fabricText,
} from '../services/catalogue.js';

const STEP = 24;
const block = e => e.preventDefault();
const noSave = { draggable: false, onDragStart: block, onContextMenu: block };

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const key = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', key);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="cs-modal" role="dialog" aria-modal="true" aria-label={title} onClick={onClose} onContextMenu={block}>
      <div className="cs-modal-in" onClick={e => e.stopPropagation()}>
        <button type="button" className="cs-close" onClick={onClose} aria-label="Close">×</button>
        {children}
      </div>
    </div>
  );
}

function LookDetail({ look, data }) {
  return (
    <>
      <span className="cs-eyebrow">{collectionName(data, look.c)}</span>
      <h2>{lookTitle(look, data)}</h2>
      <div className={look.sw ? 'cs-detail two' : 'cs-detail'}>
        <img src={lookSrc(look.id)} alt={lookTitle(look, data)} {...noSave} />
        {look.sw && <img src={swatchSrc(look.id)} alt="Fabric swatches for this design" {...noSave} />}
      </div>
      {look.f.length > 0 && (
        <table className="cs-table">
          <thead><tr><th>Used for</th><th>Fabric</th><th>Code</th><th>Specification</th></tr></thead>
          <tbody>{look.f.map((f, i) => (
            <tr key={i}><td>{f.role}</td><td><strong>{f.n}</strong></td><td>{f.code}</td><td>{f.d || '-'}</td></tr>
          ))}</tbody>
        </table>
      )}
      <div className="row"><Link to="/quote" className="btn gold">Request a quote for this design</Link><Link to="/design-studio" className="btn ghost">Customise in Design Studio</Link></div>
    </>
  );
}

function FabricDetail({ card, data }) {
  return (
    <>
      <span className="cs-eyebrow">{collectionName(data, card.c)}</span>
      <h2>{fabricTitle(card)}</h2>
      <div className="cs-detail"><img src={swatchSrc(card.id)} alt={fabricTitle(card)} {...noSave} /></div>
      <table className="cs-table">
        <thead><tr><th>Fabric</th><th>Composition / type</th><th>Shades</th></tr></thead>
        <tbody>{card.q.map((q, i) => <tr key={i}><td><strong>{q.n}</strong></td><td>{q.d || '-'}</td><td>{q.r || 'See swatches'}</td></tr>)}</tbody>
      </table>
      <div className="row"><Link to="/quote" className="btn gold">Request a quote</Link><Link to="/contact" className="btn ghost">Ask for a fabric sample</Link></div>
    </>
  );
}

export default function CatalogueSector() {
  const { slug } = useParams();
  const ind = INDUSTRIES.find(i => i.slug === slug);
  usePageMeta(ind ? `${ind.name} catalogue` : 'Catalogue', ind?.blurb);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('looks');
  const [col, setCol] = useState('');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(STEP);
  const [open, setOpen] = useState(null);

  useEffect(() => { loadCatalogue().then(setData).catch(() => setErr('The catalogue could not be loaded. Please try again.')); }, []);
  const looks = useMemo(() => (data ? sectorLooks(data, slug) : []), [data, slug]);
  const fabrics = useMemo(() => (data ? sectorFabrics(data, slug) : []), [data, slug]);
  useEffect(() => { if (data && !looks.length && fabrics.length) setTab('fabrics'); }, [data, looks.length, fabrics.length]);
  useEffect(() => { setLimit(STEP); setCol(''); }, [tab, slug]);
  useEffect(() => setLimit(STEP), [q, col]);

  const all = tab === 'looks' ? looks : fabrics;
  const cols = [...new Set(all.map(x => x.c))];
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const list = all.filter(x => (!col || x.c === col) &&
    (!words.length || words.every(w => (tab === 'looks' ? lookText(x, data) : fabricText(x, data)).includes(w))));

  if (!ind) return <section className="wrap">Sector not found. <Link to="/catalogue">See all sectors</Link></section>;

  return (
    <>
      <div className={`banner ${bdClass(slug)} ind-banner`}>
        <img className="ind-banner-img" src={`/images/banners/${slug}.png`} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} />
        <div><h1>{ind.name}</h1><p>{ind.blurb}</p></div>
      </div>

      <section className="wrap">
        <p><Link to="/catalogue">‹ All sectors</Link></p>
        {err && <p className="err">{err}</p>}
        {!data && !err && <p>Loading catalogue...</p>}

        {data && looks.length + fabrics.length === 0 && (
          <div className="cs-empty">
            <h2>Catalogue coming soon</h2>
            <p>We make {ind.name.toLowerCase()} uniforms to order. Tell us what you need and our team will share designs and fabric options.</p>
            <div className="row"><Link to="/quote" className="btn gold">Request a quote</Link><Link to={`/industries/${slug}`} className="btn ghost">What we make for {ind.name}</Link></div>
          </div>
        )}

        {data && looks.length + fabrics.length > 0 && (
          <>
            <div className="cs-tabs" role="tablist" aria-label="Catalogue sections">
              {looks.length > 0 && <button type="button" role="tab" aria-selected={tab === 'looks'} className={tab === 'looks' ? 'btn gold' : 'btn ghost'} onClick={() => setTab('looks')}>Uniform designs ({looks.length})</button>}
              {fabrics.length > 0 && <button type="button" role="tab" aria-selected={tab === 'fabrics'} className={tab === 'fabrics' ? 'btn gold' : 'btn ghost'} onClick={() => setTab('fabrics')}>Fabrics ({fabrics.length})</button>}
            </div>
            <p className="note">{tab === 'looks'
              ? 'Each design shows the shirting and suiting fabrics used. Click a design for the full fabric details.'
              : 'Fabric ranges with composition and shade numbers. Click a fabric to see all its shades.'}</p>
            <div className="row cs-filters">
              <input type="search" placeholder="Search fabric name or code, e.g. Scottish, Oxford 001" aria-label="Search" value={q} onChange={e => setQ(e.target.value)} />
              {cols.length > 1 && (
                <select value={col} aria-label="Collection" onChange={e => setCol(e.target.value)}>
                  <option value="">All collections</option>
                  {cols.map(c => <option key={c} value={c}>{collectionName(data, c)}</option>)}
                </select>
              )}
            </div>
            {list.length === 0 && <p>Nothing matches. Try another name or code.</p>}

            <div className="cs-grid" onContextMenu={block}>
              {list.slice(0, limit).map(x => tab === 'looks' ? (
                <button key={x.id} type="button" className="cs-card" onClick={() => setOpen({ type: 'look', x })}>
                  <div className="cs-img"><img src={lookSrc(x.id)} alt={lookTitle(x, data)} loading="lazy" {...noSave} /></div>
                  <div className="cs-body">
                    <span className="cs-eyebrow">{collectionName(data, x.c)}</span>
                    <h3>{lookTitle(x, data)}</h3>
                    {x.f.length > 0 && <ul>{x.f.map((f, i) => <li key={i}><span>{f.role}:</span> {f.n} {f.code}</li>)}</ul>}
                  </div>
                </button>
              ) : (
                <button key={x.id} type="button" className="cs-card fabric" onClick={() => setOpen({ type: 'fabric', x })}>
                  <div className="cs-img"><img src={swatchSrc(x.id)} alt={fabricTitle(x)} loading="lazy" {...noSave} /></div>
                  <div className="cs-body">
                    <span className="cs-eyebrow">{collectionName(data, x.c)}</span>
                    <h3>{fabricTitle(x)}</h3>
                    <ul>{x.q.filter(qq => qq.d || qq.r).map((qq, i) => <li key={i}>{[x.q.length > 1 && qq.n, qq.d, qq.r && `shades ${qq.r}`].filter(Boolean).join(' · ')}</li>)}</ul>
                  </div>
                </button>
              ))}
            </div>
            {list.length > limit && (
              <div className="cs-more"><button type="button" className="btn ghost" onClick={() => setLimit(limit + STEP)}>Show more ({list.length - limit} left)</button></div>
            )}
          </>
        )}
      </section>

      <section className="wrap alt cs-cta">
        <h2>Need these uniforms for your {ind.slug === 'schools' ? 'school' : 'team'}?</h2>
        <p>Send us your quantities and sizes. We confirm fabric, colours and pricing with you before production.</p>
        <div className="row"><Link to="/quote" className="btn gold">Request a quote</Link><Link to="/design-studio" className="btn ghost">Open Design Studio</Link></div>
      </section>

      {open && (
        <Modal title={open.type === 'look' ? lookTitle(open.x, data) : fabricTitle(open.x)} onClose={() => setOpen(null)}>
          {open.type === 'look' ? <LookDetail look={open.x} data={data} /> : <FabricDetail card={open.x} data={data} />}
        </Modal>
      )}
    </>
  );
}

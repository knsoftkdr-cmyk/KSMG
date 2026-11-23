import { useState, useEffect, useCallback } from 'react';
import usePageMeta from '../hooks/usePageMeta.js';

// View-only brochure: pages are served as images (no PDF is published), with
// no download control, right-click and drag-to-save disabled.
const PAGE_COUNT = 8;
const pageSrc = n => `/brochure/pages/page-${n}.jpg`;
const block = e => e.preventDefault();

export default function Brochure() {
  usePageMeta('Brochure', 'View the KSMG Global uniform brochure.');
  const [page, setPage] = useState(1);

  const go = useCallback(d => setPage(p => Math.min(PAGE_COUNT, Math.max(1, p + d))), []);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if ((e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key.toLowerCase())) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  // Preload the neighbouring pages so flipping feels instant.
  useEffect(() => {
    [page - 1, page + 1].filter(n => n >= 1 && n <= PAGE_COUNT).forEach(n => { new Image().src = pageSrc(n); });
  }, [page]);

  return (
    <section className="brochure" onContextMenu={block}>
      <h1>Our Brochure</h1>
      <div className="brochure-bar">
        <button type="button" className="btn ghost" onClick={() => go(-1)} disabled={page === 1} aria-label="Previous page">‹ Prev</button>
        <span aria-live="polite">Page {page} of {PAGE_COUNT}</span>
        <button type="button" className="btn ghost" onClick={() => go(1)} disabled={page === PAGE_COUNT} aria-label="Next page">Next ›</button>
      </div>
      <div className="brochure-page">
        <img src={pageSrc(page)} alt={`Brochure page ${page}`} draggable="false" onDragStart={block} onContextMenu={block} />
      </div>
      <div className="brochure-thumbs">
        {Array.from({ length: PAGE_COUNT }, (_, i) => i + 1).map(n => (
          <button key={n} type="button" className={n === page ? 'on' : ''} onClick={() => setPage(n)} aria-label={`Go to page ${n}`}>
            <img src={pageSrc(n)} alt="" draggable="false" onDragStart={block} loading="lazy" />
          </button>
        ))}
      </div>
    </section>
  );
}

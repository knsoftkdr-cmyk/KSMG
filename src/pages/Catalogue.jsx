import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta.js';
import { INDUSTRIES } from '../data/industries.js';
import { loadCatalogue, sectorLooks, sectorFabrics } from '../services/catalogue.js';

// Catalogue home: one row per sector, same layout as the Products page.
export default function Catalogue() {
  usePageMeta('Catalogue', 'KSMG Global uniform and fabric catalogue by sector: schools, healthcare, corporate, hospitality, industrial and more.');
  const [data, setData] = useState(null);
  useEffect(() => { loadCatalogue().then(setData).catch(() => setData(null)); }, []);

  return (
    <>
      <section className="wrap" style={{ paddingBottom: 0 }}>
        <h1>Catalogue</h1>
        <p className="note">Choose a sector to see our uniform designs and fabrics for it.</p>
      </section>
      <section className="wrap pshow">
        {INDUSTRIES.map((i, n) => {
          const looks = data ? sectorLooks(data, i.slug).length : 0;
          const fabrics = data ? sectorFabrics(data, i.slug).length : 0;
          return (
            <div className={n % 2 ? 'prow rev' : 'prow'} key={i.slug}>
              <div className="prow-text">
                <span className="eyebrow">{String(n + 1).padStart(2, '0')}</span>
                <h2>{i.name}</h2>
                <p>{i.blurb}</p>
                {data && (looks + fabrics > 0) && (
                  <p className="cat-count">{[looks && `${looks} uniform designs`, fabrics && `${fabrics} fabric ranges`].filter(Boolean).join(' · ')}</p>
                )}
                <Link to={`/catalogue/${i.slug}`} className="btn gold">View collection</Link>
              </div>
              <div className="prow-img">
                <img src={`/images/catalog/${i.slug}.jpg`} alt={i.name} loading="lazy" />
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}

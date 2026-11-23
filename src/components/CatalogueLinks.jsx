import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadCatalogue, sectorLooks, sectorFabrics } from '../services/catalogue.js';

// Link from an industry page to its catalogue sector page.
export default function CatalogueLinks({ industry, name }) {
  const [n, setN] = useState(null);
  useEffect(() => { loadCatalogue().then(d => setN({ looks: sectorLooks(d, industry).length, fabrics: sectorFabrics(d, industry).length })).catch(() => setN(null)); }, [industry]);
  if (!n || n.looks + n.fabrics === 0) return null;
  return (
    <section className="wrap alt cs-cta">
      <h2>See the {name} catalogue</h2>
      <p>{[n.looks && `${n.looks} uniform designs`, n.fabrics && `${n.fabrics} fabric ranges`].filter(Boolean).join(' and ')}, with fabric names, codes and specifications.</p>
      <Link to={`/catalogue/${industry}`} className="btn gold">View catalogue</Link>
    </section>
  );
}

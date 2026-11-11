import { Link } from 'react-router-dom';
import { INDUSTRIES } from '../data/industries.js';
import usePageMeta from '../hooks/usePageMeta.js';
export default function Industries() {
  usePageMeta('Industries we serve', 'Uniforms for schools, healthcare, corporate, hospitality, industrial, government and more. Explore all 15 industries.');
  return (
    <section className="wrap">
      <h1>Industries</h1>
      <div className="grid">
        {INDUSTRIES.map(i => (
          <div key={i.slug} className="card"><h3>{i.name}</h3><p>{i.blurb}</p>
            <Link to={`/industries/${i.slug}`}>See details</Link></div>
        ))}
      </div>
    </section>
  );
}

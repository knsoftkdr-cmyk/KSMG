import { Link } from 'react-router-dom';
import { INDUSTRIES } from '../data/industries.js';
export default function Industries() {
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

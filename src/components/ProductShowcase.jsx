import { Link } from 'react-router-dom';
import { INDUSTRIES } from '../data/industries.js';

const IMGS = ['schools', 'healthcare', 'corporate', 'hospitality', 'industrial', 'government', 'transport', 'retail', 'sports', 'food', 'beauty', 'ceremonial', 'events', 'facilities', 'specialised'];

export default function ProductShowcase() {
  return (
    <section className="wrap pshow">
      {INDUSTRIES.map((i, n) => (
        <div className={n % 2 ? 'prow rev' : 'prow'} key={i.slug}>
          <div className="prow-text">
            <span className="eyebrow">{String(n + 1).padStart(2, '0')}</span>
            <h2>{i.name}</h2>
            <p>{i.blurb}</p>
            <Link to={`/industries/${i.slug}`} className="btn gold">View collection</Link>
          </div>
          <div className="prow-img">
            {IMGS[n] && <img src={`/images/cards/${IMGS[n]}.jpg`} alt={i.name} loading="lazy" />}
          </div>
        </div>
      ))}
    </section>
  );
}
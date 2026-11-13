import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAll } from '../services/db.js';
import Photo from '../components/Photo.jsx';
import { INDUSTRIES } from '../data/industries.js';
import usePageMeta from '../hooks/usePageMeta.js';
const BIG = ['schools', 'healthcare'];
const ORBS = [
  ['orb-school', '/industries/schools', 'School uniforms'],
  ['orb-health', '/industries/healthcare', 'Healthcare'],
  ['orb-office', '/industries/corporate', 'Corporate'],
  ['orb-air', '/industries/hospitality', 'Hospitality'],
  ['orb-work', '/industries/industrial', 'Workwear'],
  ['orb-kids', '/industries/schools', 'School teams'],
];
const IMGS = ['schools', 'healthcare', 'corporate', 'hospitality', 'industrial', 'government', 'transport', 'retail', 'sports', 'food', 'beauty', 'ceremonial', 'events', 'facilities', 'specialised'];
const STEPS = [
  ['Send a request', 'Pick products, add sizes and quantities.'],
  ['Get a quotation', 'Our sales team prepares costing for you.'],
  ['Approve and sample', 'Confirm the quote, review samples if needed.'],
  ['We make and deliver', 'Production, quality check, dispatch.'],
];
export default function Home() {
  usePageMeta('Uniforms for every industry', 'School, hospital, corporate, hospitality and industrial uniforms. Browse the catalogue and request a bulk quotation from KSMG Global.');
  const [feat, setFeat] = useState([]);
  useEffect(() => { getAll('products').then(r => setFeat(r.sort((a, b) => b.createdAt - a.createdAt).slice(0, 4))); }, []);
  return (
    <>
      <section className="hero">
        <svg className="stitch" viewBox="0 0 1440 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g fill="none" strokeLinecap="round" strokeDasharray="14 12">
            <path d="M-20 520 C 300 420, 520 640, 820 500 S 1260 300, 1480 380" stroke="#c9a24a" strokeWidth="3" />
            <path d="M-20 440 C 260 340, 560 560, 860 420 S 1280 220, 1480 300" stroke="#c9a24a" strokeOpacity=".45" strokeWidth="2" />
            <path d="M-20 360 C 240 260, 600 480, 900 340 S 1300 140, 1480 220" stroke="#fff" strokeOpacity=".25" strokeWidth="2" />
          </g>
        </svg>

        <div className="orbs">
          {ORBS.map(([img, to, label], i) => (
            <Link key={img} to={to} className={`orb o${i + 1}`} aria-label={label}>
              <img src={`/images/orbs/${img}.jpg`} alt="" />
            </Link>
          ))}
        </div>

        <div className="hero-in">
          <h1>Every profession. Every institution.</h1>
          <p>One supplier for school, hospital, office, hotel and factory uniforms. Browse the catalogue, then send your quantities for a quotation.</p>
          <div className="row">
            <Link className="btn gold" to="/quote">Request a quote</Link>
            <Link className="btn ghost" to="/products">Browse products</Link>
          </div>
        </div>
      </section>

                 <section className="wrap showcase">
        <h2>Fifteen industries, one supplier</h2>
        <div className="show-grid">
          {INDUSTRIES.map((i, n) => (
            <div className="show-item" key={i.slug}>
              <Link to={`/industries/${i.slug}`} className="show-card" style={{ animationDelay: `${(n % 5) * 0.6}s` }}>
                {IMGS[n]
                  ? <img src={`/images/cards/${IMGS[n]}.jpg`} alt={i.name} loading="lazy" />
                  : <span className="show-ph" aria-hidden="true" />}
                <span className="show-cap"><strong>{i.name}</strong><small>{i.blurb}</small></span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap">
        <h2>Fifteen industries, one supplier</h2>
        <div className="grid bento">
          {INDUSTRIES.map(i => (
            <Link key={i.slug} to={`/industries/${i.slug}`} className={`card thread ${BIG.includes(i.slug) ? 'big' : ''}`}>
              <h3>{i.name}</h3><p>{i.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {feat.length > 0 && (
        <section className="wrap alt">
          <h2>Featured collections</h2>
          <div className="grid">
            {feat.map(p => <Link key={p.id} to={`/products/${p.id}`} className="card prod"><Photo blob={p.photos[0]} alt={p.name} /><h3>{p.name}{p.sample && <span className="tag">Sample</span>}</h3></Link>)}
          </div>
        </section>
      )}

      <section className="dark">
        <div className="wrap">
          <h2>How a bulk order works</h2>
          <ol className="steps">
            {STEPS.map(([t, d]) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="wrap alt">
        <h2>Fabrics, quality and manufacturing</h2>
        <div className="grid">
          <Link className="card thread" to="/fabrics"><h3>Fabrics</h3><p>Composition, weight and care details.</p></Link>
          <Link className="card thread" to="/quality"><h3>Quality & Standards</h3><p>Certifications shown only with valid evidence.</p></Link>
          <Link className="card thread" to="/manufacturing"><h3>Manufacturing</h3><p>From fabric to dispatch.</p></Link>
          <Link className="card thread" to="/sustainability"><h3>Sustainability</h3><p>Our approach to responsible production.</p></Link>
        </div>
      </section>

      <section className="wrap cta">
        <h2>Planning a bulk order?</h2>
        <p>Tell us what you need and we will send a quotation. Exporters and distributors can also write to us through the quote form.</p>
        <Link className="btn gold" to="/quote">Request a quote</Link>
      </section>
    </>
  );
}

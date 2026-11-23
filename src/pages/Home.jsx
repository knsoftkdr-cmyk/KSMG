import * as R from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAll } from '../services/db.js';
import Photo from '../components/Photo.jsx';
import CompanyVideo from '../components/CompanyVideo.jsx';
import IndIcon from '../components/IndIcon.jsx';
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

function CountUp({ to }) {
  const ref = R.useRef(null);
  const [n, setN] = R.useState(0);
  R.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / 1400, 1);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{n}</span>;
}

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

      <section className="wrap showcase" id="industries">
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

<section className="wrap about">
  <div className="about-text">
    <span className="eyebrow">About us</span>
    <h2>KSMG Global Private Limited</h2>
    <p>KSMG Global Private Limited is a Hyderabad based textile company offering a complete range of uniform fabrics for schools, corporate offices, hospitality and healthcare institutions.</p>
    <p>From vibrant checks and classic stripes to rich plain shades and premium suitings, our collection is selected for comfort, durability and a smart, consistent look, wash after wash.</p>
    <ul className="about-why">
      <li><strong>Wide Range</strong><span>Checks, stripes, plains and suitings</span></li>
      <li><strong>Lasting Quality</strong><span>Durable, colour-fast fabrics</span></li>
      <li><strong>Custom Solutions</strong><span>Shades and designs for your institution</span></li>
      <li><strong>Reliable Supply</strong><span>Bulk orders with timely delivery</span></li>
    </ul>
  </div>
  <div className="about-img">
    <img src="/images/about-kids.jpg" alt="School students in KSMG uniforms" loading="lazy" />
  </div>
</section>


<CompanyVideo />

<section className="wrap why">
  <div className="sec-head">
    <span className="eyebrow">Why choose us</span>
    <h2>Quality you can rely on</h2>
  </div>
  <div className="why-grid">
    <div className="why-card"><strong>Wide Range</strong><span>Checks, stripes, plains and suitings</span></div>
    <div className="why-card"><strong>Lasting Quality</strong><span>Durable, colour-fast fabrics</span></div>
    <div className="why-card"><strong>Custom Solutions</strong><span>Shades and designs for your institution</span></div>
    <div className="why-card"><strong>Reliable Supply</strong><span>Bulk orders with timely delivery</span></div>
  </div>
  <div className="stats">
    <div className="stat"><b><CountUp to={15} /></b><span>Industries served</span></div>
    <div className="stat"><b><CountUp to={4} /></b><span>Fabric types</span></div>
    <div className="stat"><b><CountUp to={3} /></b><span>Collections</span></div>
    <div className="stat"><b className="txt">Hyderabad</b><span>Based</span></div>
  </div>
</section>

      <section className="dark">
        <div className="wrap">
          <h2>How a bulk order works</h2>
          <ol className="steps">
            {STEPS.map(([t, d]) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="wrap contact-sec">
  <div className="sec-head">
    <span className="eyebrow">Get in touch</span>
    <h2>Let's dress your institution in quality</h2>
  </div>
  <div className="contact-grid">
    <div className="contact-info">
      <img className="contact-logo" src="/images/ksmg-logo.png" alt="KSMG Global Private Limited" loading="lazy" />
      <ul className="contact-list">
        <li><b>Phone</b><a href="tel:+919896289628">+91 98-9628 9628</a></li>
        <li><b>Email</b><a href="mailto:pr@ksmgtextiles.com">info@ksmgtextiles.com</a></li>
        <li><b>Website</b><span>www.ksmgtextiles.com</span></li>
        <li><b>Uppal</b><span>H. No. 13-106, Sri Sri Nagar Colony, Near HUDA Park, Uppal, Hyderabad, Telangana – 500039, India. <a href="https://www.google.com/maps/search/?api=1&query=Sri+Sri+Nagar+Colony,+Near+HUDA+Park,+Uppal,+Hyderabad+500039" target="_blank" rel="noopener noreferrer">Get directions</a></span></li>
<li><b>Kondapur</b><span>Aditya Neeladri, 4th Cross, Block-C, Sriram Nagar, Kondapur, Hyderabad – 500084, India.</span></li>
      </ul>
      <Link to="/quote" className="btn gold">Request a quote</Link>
    </div>
    <div className="contact-map">
      <iframe
        title="KSMG Global location"
        src="https://www.google.com/maps?q=H.+No.+13-106,+Sri+Sri+Nagar+Colony,+Near+HUDA+Park,+Uppal,+Hyderabad,+Telangana+500039&output=embed"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
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

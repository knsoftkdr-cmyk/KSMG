import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { INDUSTRIES, bdClass, industryItems } from '../data/industries.js';
import { getAll } from '../services/db.js';
import Photo from '../components/Photo.jsx';
import IndIcon from '../components/IndIcon.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
const TAG = {
  schools: 'Complete Uniform Solutions for Schools, Colleges and Educational Institutions',
  healthcare: 'Reliable Uniforms for Hospitals, Clinics and Medical Institutions',
  corporate: 'Smart Uniforms for Offices, Corporates and Business Teams',
  hospitality: 'Elegant Uniforms for Hotels, Restaurants and Catering Teams',
  industrial: 'Durable Workwear for Factories, Workshops and Technical Teams',
  government: 'Dependable Uniforms for Security, Municipal and Public Service Teams',
  transport: 'Professional Uniforms for Aviation, Rail and Transport Crews',
  retail: 'Neat Uniforms for Stores, Showrooms and Customer-Facing Teams',
  sports: 'Performance Wear for Teams, Gyms and Fitness Studios',
  'food-agri': 'Hygienic Workwear for Food Plants, Dairies and Agriculture Teams',
  beauty: 'Stylish Uniforms for Salons, Spas and Wellness Studios',
  ceremonial: 'Graceful Attire for Academic, Cultural and Ceremonial Occasions',
  events: 'Smart Crew Wear for Events, Exhibitions and Media Teams',
  facilities: 'Practical Uniforms for Cleaning, Housekeeping and Home Care Services',
  specialised: 'Purpose-Built Uniforms for NGOs, Institutions and Field Teams',
};
export default function IndustryDetail() {
  const { slug } = useParams();
  const ind = INDUSTRIES.find(i => i.slug === slug);
  const [products, setProducts] = useState([]);
  usePageMeta(ind ? `${ind.name} uniforms` : 'Industry', ind?.blurb);
  useEffect(() => { getAll('products').then(r => setProducts(r.filter(p => p.industry === slug))); }, [slug]);
  if (!ind) return <section className="wrap">Industry not found. <Link to="/industries">See all industries</Link></section>;
  return (
    <>
      <div className={`banner ${bdClass(slug)} ind-banner`}>
        <img key={slug} className="ind-banner-img" src={`/images/banners/${slug}.png`} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} />
        <div><h1>{ind.name}</h1><p>{TAG[slug] || ind.blurb}</p></div>
      </div>
      <section className="wrap">
        <h2>What we make</h2>
        <div className="pc-grid">
          {industryItems(slug).map((x, n) => (
            <div className="pc-card" key={x}>
              <div className="pc-img">
                <img src={`/images/items/${slug}/${String(n + 1).padStart(2, '0')}.png`} alt={x} loading="lazy" onError={e => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <div className="pc-foot">
                <span className="pc-ico"><IndIcon name={slug === 'food-agri' ? 'food' : slug} /></span>
                <span className="pc-name">{x}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="row"><Link className="btn gold" to="/quote">Request a quote</Link><Link className="btn ghost" to={`/products?industry=${slug}`}>All {ind.name} products</Link></div>
      </section>
      {products.length > 0 && (
        <section className="wrap alt">
          <h2>Our products</h2>
          <div className="pc-grid">
            {products.map(p => (
              <Link key={p.id} to={`/products/${p.id}`} className="pc-card">
                <div className="pc-img"><Photo blob={p.photos[0]} alt={p.name} /></div>
                <div className="pc-foot">
                  <span className="pc-ico"><IndIcon name={slug === 'food-agri' ? 'food' : slug} /></span>
                  <span className="pc-name">{p.name}{p.sample && <span className="tag">Sample</span>}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { INDUSTRIES, bdClass, industryItems } from '../data/industries.js';
import { getAll } from '../services/db.js';
import Photo from '../components/Photo.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
export default function IndustryDetail() {
  const { slug } = useParams();
  const ind = INDUSTRIES.find(i => i.slug === slug);
  const [products, setProducts] = useState([]);
  usePageMeta(ind ? `${ind.name} uniforms` : 'Industry', ind?.blurb);
  useEffect(() => { getAll('products').then(r => setProducts(r.filter(p => p.industry === slug))); }, [slug]);
  if (!ind) return <section className="wrap">Industry not found. <Link to="/industries">See all industries</Link></section>;
  return (
    <>
      <div className={`banner ${bdClass(slug)}`}><div><h1>{ind.name}</h1><p>{ind.blurb}</p></div></div>
      <section className="wrap">
        <h2>What we make</h2>
        <div className="chips">{industryItems(slug).map(x => <span key={x}>{x}</span>)}</div>
        <div className="row"><Link className="btn gold" to="/quote">Request a quote</Link><Link className="btn ghost" to={`/products?industry=${slug}`}>All {ind.name} products</Link></div>
      </section>
      {products.length > 0 && (
        <section className="wrap alt">
          <h2>Featured products</h2>
          <div className="grid">
            {products.slice(0, 4).map(p => (
              <Link key={p.id} to={`/products/${p.id}`} className="card prod"><Photo blob={p.photos[0]} alt={p.name} /><h3>{p.name}{p.sample && <span className="tag">Sample</span>}</h3></Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

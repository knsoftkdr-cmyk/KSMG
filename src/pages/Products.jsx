import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAll } from '../services/db.js';
import { INDUSTRIES, industryName, bdClass } from '../data/industries.js';
import Photo from '../components/Photo.jsx';
export default function Products() {
  const [items, setItems] = useState(null);
  const [params, setParams] = useSearchParams();
  const industry = params.get('industry') || '';
  const [q, setQ] = useState('');
  useEffect(() => { getAll('products').then(setItems); }, []);
  const list = (items || []).filter(p => (!industry || p.industry === industry) &&
    (p.name + p.sku + p.fabric + (p.category || '')).toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.createdAt - a.createdAt);
  return (
    <>
      <div className={`banner ${bdClass(industry)}`}>
        <div><h1>{industry ? industryName(industry) : 'Products'}</h1><p>{INDUSTRIES.find(i => i.slug === industry)?.blurb || 'Browse uniforms for every industry.'}</p></div>
      </div>
      <section className="wrap">
        <div className="row">
          <input placeholder="Search name, SKU, category or fabric" value={q} onChange={e => setQ(e.target.value)} />
          <select value={industry} aria-label="Industry" onChange={e => setParams(e.target.value ? { industry: e.target.value } : {})}>
            <option value="">All industries</option>
            {INDUSTRIES.map(i => <option key={i.slug} value={i.slug}>{i.name}</option>)}
          </select>
        </div>
        {!items && <p>Loading...</p>}
        {items && list.length === 0 && <p>No products match. <Link to="/admin/add-product">Add a product</Link>.</p>}
        <div className="grid">
          {list.map(p => (
            <Link key={p.id} to={`/products/${p.id}`} className="card prod">
              <Photo blob={p.photos[0]} alt={p.name} />
              <h3>{p.name}{p.sample && <span className="tag">Sample</span>}</h3>
              <p>{industryName(p.industry)}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

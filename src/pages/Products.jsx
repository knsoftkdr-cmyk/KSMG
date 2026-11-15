import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAll } from '../services/db.js';
import { INDUSTRIES, industryName, bdClass } from '../data/industries.js';
import Photo from '../components/Photo.jsx';
import ProductShowcase from '../components/ProductShowcase.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
export default function Products() {
  usePageMeta('All uniform collections', 'Browse uniforms by industry. Search the catalogue and request a bulk quotation.');
  const [items, setItems] = useState(null);
  const [params, setParams] = useSearchParams();
  const industry = params.get('industry') || '';
  const [q, setQ] = useState('');
  useEffect(() => { getAll('products').then(setItems); }, []);
  const list = (items || []).filter(p => (!industry || p.industry === industry) &&
    (p.name + p.sku + p.fabric + (p.category || '')).toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.createdAt - a.createdAt);
  return (
    <>
      <section className="wrap" style={{ paddingBottom: 0 }}>
  <h1>{industry ? industryName(industry) : 'Products'}</h1>
</section>

      <section className="wrap">
        <div className="row">
          <input placeholder="Search name, SKU, category or fabric" value={q} onChange={e => setQ(e.target.value)} />
          <select value={industry} aria-label="Industry" onChange={e => setParams(e.target.value ? { industry: e.target.value } : {})}>
            <option value="">All industries</option>
            {INDUSTRIES.map(i => <option key={i.slug} value={i.slug}>{i.name}</option>)}
          </select>
        </div>

        {!industry && <ProductShowcase />}
        
       
      </section>
    </>
  );
}

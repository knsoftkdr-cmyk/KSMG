import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { get, getAll, remove } from '../services/db.js';
import { industryName } from '../data/industries.js';
import Photo from '../components/Photo.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import useProductSchema from '../hooks/useProductSchema.js';
export default function ProductDetail() {
  const { id } = useParams(); const nav = useNavigate();
  const [p, setP] = useState(undefined); const [related, setRelated] = useState([]);
  usePageMeta(p?.name || 'Product', p?.description);
  useProductSchema(p);
  useEffect(() => {
    get('products', id).then(x => { setP(x); if (x) getAll('products').then(all => setRelated(
      all.filter(r => r.id !== x.id && (r.industry === x.industry || (x.category && r.category === x.category))).slice(0, 4))); });
  }, [id]);
  if (p === undefined) return <section className="wrap">Loading...</section>;
  if (!p) return <section className="wrap">Product not found. <Link to="/products">Back to products</Link></section>;
  const custom = [p.embroidery && 'Embroidery', p.print && 'Printing', p.logo && 'Logo placement'].filter(Boolean).join(', ');
  const rows = [['SKU', p.sku], ['Industry', industryName(p.industry)], ['Category', p.category], ['Fabric', p.fabric], ['GSM', p.gsm],
    ['Season', p.season], ['Construction', p.construction], ['Fit', p.fit], ['Collar', p.collar], ['Cuff', p.cuff], ['Pockets', p.pockets],
    ['Colours', p.colours], ['Sizes', p.sizes], ['Accessories', p.accessories], ['Customisation', custom],
    ['Minimum order quantity', p.moq], ['Lead time', p.leadTime], ['Sample', p.sampleAvailable ? 'Available' : ''], ['Wash and care', p.washcare]].filter(r => r[1]);
  const blocks = [['Quantity-based pricing', p.pricing], ['Technical specifications', p.techSpecs], ['Compliance evidence', p.compliance]].filter(b => b[1]);
  return (
    <section className="wrap">
      <div className="detail">
        <div className="photos">{(p.photos.length ? p.photos : [null]).map((b, i) => <Photo key={i} blob={b} alt={p.name} />)}</div>
        <div>
          <h1>{p.name}{p.sample && <span className="tag">Sample</span>}</h1>
          <p>{p.description}</p>
          <table><tbody>{rows.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}</tbody></table>
          {blocks.map(([h, t]) => <div key={h}><h3>{h}</h3><p className="pre">{t}</p></div>)}
          <div className="row">
            <Link className="btn gold" to={`/quote?product=${p.id}`}>Request a quote</Link>
            <Link className="btn ghost" to={`/admin/edit-product/${p.id}`}>Edit</Link>
            <button className="btn ghost" onClick={async () => { if (confirm('Delete this product?')) { await remove('products', p.id); nav('/products'); } }}>Delete</button>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <>
          <h2 style={{ marginTop: 48 }}>Related products</h2>
          <div className="grid">{related.map(r => <Link key={r.id} to={`/products/${r.id}`} className="card prod"><Photo blob={r.photos[0]} alt={r.name} /><h3>{r.name}</h3></Link>)}</div>
        </>
      )}
    </section>
  );
}

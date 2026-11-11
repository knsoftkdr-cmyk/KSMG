import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, save, newId } from '../services/db.js';
import { INDUSTRIES } from '../data/industries.js';
import usePageMeta from '../hooks/usePageMeta.js';
const EMPTY = { name: '', sku: '', industry: 'schools', category: '', description: '', fabric: '', gsm: '', season: '', construction: '',
  fit: '', collar: '', cuff: '', pockets: '', colours: '', sizes: '', accessories: '', embroidery: false, print: false, logo: false,
  washcare: '', moq: '', leadTime: '', sampleAvailable: false, pricing: '', techSpecs: '', compliance: '' };
export default function AddProduct() {
  const { id } = useParams(); const nav = useNavigate();
  usePageMeta(id ? 'Edit product' : 'Add product');
  const [f, setF] = useState(EMPTY); const [old, setOld] = useState(null);
  const [files, setFiles] = useState([]); const [err, setErr] = useState('');
  useEffect(() => { if (id) get('products', id).then(p => { if (p) { setOld(p); setF({ ...EMPTY, ...p }); } }); }, [id]);
  const set = k => e => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const T = (k, label, ph = '') => <label>{label}<input value={f[k]} onChange={set(k)} placeholder={ph} /></label>;
  const C = (k, label) => <label className="opt"><input type="checkbox" checked={f[k]} onChange={set(k)} />{label}</label>;
  const A = (k, label, ph = '') => <label>{label}<textarea rows="3" value={f[k]} onChange={set(k)} placeholder={ph} /></label>;
  const pick = e => {
    const chosen = [...e.target.files];
    if (chosen.some(x => !x.type.startsWith('image/') || x.size > 5 * 1024 * 1024)) return setErr('Use image files under 5 MB each.');
    setErr(''); setFiles(chosen);
  };
  const submit = async e => {
    e.preventDefault();
    if (!f.name.trim()) return setErr('Product name is required.');
    const item = old ? { ...old, ...f, photos: files.length ? files : old.photos } : { ...f, id: newId(), photos: files, sample: false, createdAt: Date.now() };
    await save('products', item);
    nav(`/products/${item.id}`);
  };
  return (
    <section className="wrap narrow">
      <h1>{id ? 'Edit product' : 'Add a product'}</h1>
      <p className="note">Stored in this browser for now. Real shared storage comes with the backend.</p>
      <form onSubmit={submit}>
        <fieldset className="group"><legend>Basics</legend>
          {T('name', 'Product name *')}{T('sku', 'SKU')}
          <label>Industry<select value={f.industry} onChange={set('industry')}>{INDUSTRIES.map(i => <option key={i.slug} value={i.slug}>{i.name}</option>)}</select></label>
          {T('category', 'Category', 'e.g. Shirts, Scrubs, Aprons')}{A('description', 'Description')}
        </fieldset>
        <fieldset className="group"><legend>Fabric</legend>
          {T('fabric', 'Fabric composition', 'e.g. 65% polyester, 35% cotton')}{T('gsm', 'GSM')}{T('season', 'Seasonal suitability')}{T('construction', 'Construction')}
        </fieldset>
        <fieldset className="group"><legend>Style</legend>
          {T('fit', 'Fit')}{T('collar', 'Collar')}{T('cuff', 'Cuff')}{T('pockets', 'Pockets')}{T('colours', 'Colours', 'Navy, White')}{T('sizes', 'Sizes', 'S, M, L, XL')}{T('accessories', 'Accessories')}
        </fieldset>
        <fieldset className="group"><legend>Customisation</legend>
          {C('embroidery', 'Embroidery available')}{C('print', 'Printing available')}{C('logo', 'Logo placement available')}
        </fieldset>
        <fieldset className="group"><legend>Care</legend>{A('washcare', 'Wash and care instructions')}</fieldset>
        <fieldset className="group"><legend>Ordering</legend>
          {T('moq', 'Minimum order quantity')}{T('leadTime', 'Estimated lead time', 'e.g. 3 weeks')}{C('sampleAvailable', 'Sample available')}
          {A('pricing', 'Quantity-based pricing (one tier per line)', '100-499: price\n500+: price')}
        </fieldset>
        <fieldset className="group"><legend>Technical</legend>
          {A('techSpecs', 'Technical specifications')}
          {A('compliance', 'Compliance evidence')}
          <p className="note">Add certifications or test claims only if you hold valid documents for them.</p>
        </fieldset>
        <label>Photos{old ? ` (${old.photos.length} saved; choose new ones to replace them)` : ''}<input type="file" accept="image/*" multiple onChange={pick} /></label>
        {err && <p className="err">{err}</p>}
        <button className="btn gold">Save product</button>
      </form>
    </section>
  );
}

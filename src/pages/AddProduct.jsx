import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, getAll, save, newId } from '../services/db.js';
import { INDUSTRIES } from '../data/industries.js';
import usePageMeta from '../hooks/usePageMeta.js';
const EMPTY = { name: '', sku: '', industry: 'schools', category: '', description: '', fabric: '', gsm: '', season: '', construction: '',
  fit: '', collar: '', cuff: '', pockets: '', colours: '', sizes: '', accessories: '', embroidery: false, print: false, logo: false,
  washcare: '', moq: '', leadTime: '', sampleAvailable: false, pricing: '', techSpecs: '', compliance: '' };
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_PHOTOS = 6;
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
    if (chosen.length > MAX_PHOTOS) { setFiles([]); return setErr(`Choose at most ${MAX_PHOTOS} photos.`); }
    if (chosen.some(x => !IMAGE_TYPES.includes(x.type))) { setFiles([]); return setErr('Photos must be JPG, PNG, WEBP or GIF files.'); }
    if (chosen.some(x => x.size > 5 * 1024 * 1024)) { setFiles([]); return setErr('Each photo must be under 5 MB.'); }
    setErr(''); setFiles(chosen);
  };
  const check = async () => {
    const name = f.name.trim(); const sku = f.sku.trim();
    if (!name) return 'Product name is required.';
    if (name.length < 3) return 'Product name must be at least 3 characters.';
    if (name.length > 100) return 'Product name must be 100 characters or fewer.';
    if (sku) {
      if (!/^[A-Za-z0-9_-]{2,30}$/.test(sku)) return 'SKU can have only letters, numbers, - and _ (2 to 30 characters).';
      let all = [];
      try { all = await getAll('products'); } catch { /* the save step will report problems */ }
      if (all.some(p => p.id !== id && (p.sku || '').toLowerCase() === sku.toLowerCase())) return 'This SKU is already used by another product.';
    }
    const gsm = String(f.gsm).trim();
    if (gsm && !(/^\d+$/.test(gsm) && Number(gsm) >= 50 && Number(gsm) <= 600)) return 'GSM must be a number between 50 and 600.';
    const moq = String(f.moq).trim();
    if (moq && !(/^\d+$/.test(moq) && Number(moq) >= 1)) return 'Minimum order quantity must be a whole number, 1 or more.';
    if (f.description.length > 2000) return 'Description must be 2000 characters or fewer.';
    if (Object.values(f).some(v => typeof v === 'string' && v.length > 2000)) return 'One of the fields is too long (maximum 2000 characters).';
    return '';
  };
  const submit = async e => {
    e.preventDefault();
    const problem = await check();
    if (problem) return setErr(problem);
    setErr('');
    const clean = { ...f, name: f.name.trim(), sku: f.sku.trim(), gsm: String(f.gsm).trim(), moq: String(f.moq).trim() };
    const item = old ? { ...old, ...clean, photos: files.length ? files : old.photos } : { ...clean, id: newId(), photos: files, sample: false, createdAt: Date.now() };
    try { await save('products', item); } catch { return setErr('Could not save. Please log in as a product manager and try again.'); }
    nav(`/products/${item.id}`);
  };
  return (
    <section className="wrap narrow">
      <h1>{id ? 'Edit product' : 'Add a product'}</h1>
      <p className="note">Products are saved online and shown to all visitors. Only product managers can add or edit.</p>
      <form onSubmit={submit}>
        <fieldset className="group"><legend>Basics</legend>
          {T('name', 'Product name *')}{T('sku', 'SKU', 'e.g. SCH-SHIRT-001')}
          <label>Industry<select value={f.industry} onChange={set('industry')}>{INDUSTRIES.map(i => <option key={i.slug} value={i.slug}>{i.name}</option>)}</select></label>
          {T('category', 'Category', 'e.g. Shirts, Scrubs, Aprons')}{A('description', 'Description')}
        </fieldset>
        <fieldset className="group"><legend>Fabric</legend>
          {T('fabric', 'Fabric composition', 'e.g. 65% polyester, 35% cotton')}{T('gsm', 'GSM', 'e.g. 150')}{T('season', 'Seasonal suitability')}{T('construction', 'Construction')}
        </fieldset>
        <fieldset className="group"><legend>Style</legend>
          {T('fit', 'Fit')}{T('collar', 'Collar')}{T('cuff', 'Cuff')}{T('pockets', 'Pockets')}{T('colours', 'Colours', 'Navy, White')}{T('sizes', 'Sizes', 'S, M, L, XL')}{T('accessories', 'Accessories')}
        </fieldset>
        <fieldset className="group"><legend>Customisation</legend>
          {C('embroidery', 'Embroidery available')}{C('print', 'Printing available')}{C('logo', 'Logo placement available')}
        </fieldset>
        <fieldset className="group"><legend>Care</legend>{A('washcare', 'Wash and care instructions')}</fieldset>
        <fieldset className="group"><legend>Ordering</legend>
          {T('moq', 'Minimum order quantity', 'e.g. 50')}{T('leadTime', 'Estimated lead time', 'e.g. 3 weeks')}{C('sampleAvailable', 'Sample available')}
          {A('pricing', 'Quantity-based pricing (one tier per line)', '100-499: price\n500+: price')}
        </fieldset>
        <fieldset className="group"><legend>Technical</legend>
          {A('techSpecs', 'Technical specifications')}
          {A('compliance', 'Compliance evidence')}
          <p className="note">Add certifications or test claims only if you hold valid documents for them.</p>
        </fieldset>
        <label>Photos (JPG, PNG, WEBP or GIF, up to {MAX_PHOTOS}, 5 MB each){old ? ` (${old.photos.length} saved; choose new ones to replace them)` : ''}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={pick} /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn gold">Save product</button>
      </form>
    </section>
  );
}
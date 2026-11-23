// Uniform & fabric catalogue built from KSMG_Global_Brochures.pdf (see scripts/build_catalogue.py).
// The data lives in /public/catalogue and is fetched on demand so it does not bloat the main bundle.

export const lookSrc = id => `/catalogue/looks/${id}.webp`;
export const swatchSrc = id => `/catalogue/swatches/${id}.webp`;

let cache = null;
export function loadCatalogue() {
  if (!cache) {
    cache = fetch('/catalogue/catalogue.json')
      .then(r => { if (!r.ok) throw new Error('Catalogue not found'); return r.json(); })
      .catch(e => { cache = null; throw e; });
  }
  return cache;
}

export const sectorLooks = (data, sector) => data.looks.filter(l => l.s.includes(sector));
export const sectorFabrics = (data, sector) => data.fabrics.filter(f => f.s.includes(sector));
export const collectionName = (data, slug) => data.collections.find(c => c.slug === slug)?.name || '';

export const fabricCode = f => (f.code ? `${f.n} ${f.code}` : f.n);

// Short heading for a uniform look, e.g. "Oxford 001 with Scottish 001".
export function lookTitle(look, data) {
  const f = look.f || [];
  if (!f.length) return look.c === 'saree-suit-uniforms' ? 'Uniform saree & suit' : `${collectionName(data, look.c)} uniform`;
  return f.slice(0, 2).map(fabricCode).join(' with ');
}

export const fabricTitle = card => card.q.map(q => q.n).join(' / ');

// All text a card can be searched by, lower-cased.
export const lookText = (l, data) => [collectionName(data, l.c), ...(l.f || []).map(f => `${fabricCode(f)} ${f.d} ${f.role}`)].join(' ').toLowerCase();
export const fabricText = (c, data) => [collectionName(data, c.c), ...c.q.map(q => `${q.n} ${q.d || ''} ${q.r || ''}`)].join(' ').toLowerCase();

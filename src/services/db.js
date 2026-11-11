// Storage layer (IndexedDB, runs in the browser, no backend needed).
// Later, replace the bodies of these functions with fetch() calls to a real API;
// the pages do not need to change.
const NAME = 'ksmg', STORES = ['products', 'enquiries'];
let conn;
const open = () => conn || (conn = new Promise((ok, fail) => {
  const r = indexedDB.open(NAME, 1);
  r.onupgradeneeded = () => STORES.forEach(s => r.result.createObjectStore(s, { keyPath: 'id' }));
  r.onsuccess = () => ok(r.result);
  r.onerror = () => fail(r.error);
}));
const run = async (store, mode, fn) => {
  const db = await open();
  return new Promise((ok, fail) => {
    const t = db.transaction(store, mode), q = fn(t.objectStore(store));
    t.oncomplete = () => ok(q.result);
    t.onerror = () => fail(t.error);
  });
};
export const getAll = async s => { if (s === 'products') await seedOnce(); return run(s, 'readonly', o => o.getAll()); };
export const get = (s, id) => run(s, 'readonly', o => o.get(id));
export const save = (s, item) => run(s, 'readwrite', o => o.put(item));
export const remove = (s, id) => run(s, 'readwrite', o => o.delete(id));
export const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

// First run only: add clearly-labelled SAMPLE products so the catalogue is not empty.
let seeding;
export const seedOnce = () => seeding || (seeding = doSeed().then(doSeedMore));
async function doSeed() {
  if (localStorage.getItem('ksmg-seeded')) return;
  const samples = [
    ['SAMPLE-SCH-001', 'School shirt (sample)', 'schools', 'Poly-cotton', 120],
    ['SAMPLE-HOS-001', 'Nurse scrub set (sample)', 'healthcare', 'Cotton-polyester blend', 180],
    ['SAMPLE-COR-001', 'Branded polo (sample)', 'corporate', 'Cotton pique', 200],
    ['SAMPLE-HSP-001', 'Chef coat (sample)', 'hospitality', 'Cotton twill', 220],
  ];
  for (const [sku, name, industry, fabric, gsm] of samples)
    await save('products', { id: newId(), sku, name, industry, fabric, gsm, colours: 'Navy, White', sizes: 'S, M, L, XL',
      moq: '', description: 'Sample entry. Replace with real product details.', photos: [], sample: true, createdAt: Date.now() });
  localStorage.setItem('ksmg-seeded', '1');
}


// Second batch of clearly-labelled SAMPLE products (runs once per browser).
async function doSeedMore() {
  if (localStorage.getItem('ksmg-seeded-2')) return;
  const more = [
    ['SAMPLE-SCH-002', 'School trousers (sample)', 'schools', 'Poly-viscose', 200],
    ['SAMPLE-SCH-003', 'Girls pinafore (sample)', 'schools', 'Poly-cotton check', 180],
    ['SAMPLE-HOS-002', 'Lab coat (sample)', 'healthcare', 'Cotton-polyester blend', 190],
    ['SAMPLE-COR-002', 'Office blazer (sample)', 'corporate', 'Poly-viscose suiting', 260],
    ['SAMPLE-HSP-002', 'Kitchen apron (sample)', 'hospitality', 'Cotton drill', 240],
  ];
  for (const [sku, name, industry, fabric, gsm] of more)
    await save('products', { id: newId(), sku, name, industry, fabric, gsm, colours: 'Navy, White', sizes: 'S, M, L, XL',
      moq: '', description: 'Sample entry. Replace with real product details.', photos: [], sample: true, createdAt: Date.now() });
  localStorage.setItem('ksmg-seeded-2', '1');
}
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
export const newId = () => crypto.randomUUID();

// First run only: add clearly-labelled SAMPLE products so the catalogue is not empty.
let seeding;
export const seedOnce = () => seeding || (seeding = doSeed());
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

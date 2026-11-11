// Storage layer: products live in Supabase (Postgres table + photo Storage).
import { supabase } from './supabase.js';
import { newId } from './ids.js';
export { newId };

const BUCKET = 'product-photos';
const KNOWN = ['id', 'sku', 'name', 'industry', 'sample', 'createdAt', 'photos'];

const fromRow = r => ({
  ...r.details,
  id: r.id, sku: r.sku || '', name: r.name, industry: r.industry,
  sample: r.is_sample, photos: r.photos || [], createdAt: new Date(r.created_at).getTime(),
});

const toRow = item => {
  const details = {};
  Object.keys(item).forEach(k => { if (!KNOWN.includes(k)) details[k] = item[k]; });
  return { id: item.id, sku: item.sku || null, name: item.name, industry: item.industry,
    is_sample: !!item.sample, details, photos: item.photos };
};

async function uploadPhotos(id, photos) {
  const out = [];
  for (const p of photos) {
    if (typeof p === 'string') { out.push(p); continue; }
    const ext = (p.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    const path = `${id}/${newId()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, p, { contentType: p.type });
    if (error) throw error;
    out.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
  }
  return out;
}

export const getAll = async () => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map(fromRow);
};

export const get = async (_store, id) => {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error) { console.error(error); return null; }
  return data ? fromRow(data) : null;
};

export const save = async (_store, item) => {
  const photos = await uploadPhotos(item.id, item.photos || []);
  const { error } = await supabase.from('products').upsert(toRow({ ...item, photos }));
  if (error) throw error;
};

export const remove = async (_store, id) => {
  const { data: files } = await supabase.storage.from(BUCKET).list(id);
  if (files?.length) await supabase.storage.from(BUCKET).remove(files.map(f => `${id}/${f.name}`));
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
};
import { supabase } from './supabase.js';

const toRow = d => ({
  name: d.name, industry: d.industry, garment: d.garment, fabric: d.fabric,
  colour: d.colour, decoration: d.decoration, pattern: d.pattern || 'Plain', sizes: d.sizes,
});

export async function listDesigns() {
  const { data, error } = await supabase.from('saved_designs').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(r => ({
    id: r.id, name: r.name, industry: r.industry, garment: r.garment, fabric: r.fabric,
    colour: r.colour, decoration: r.decoration, pattern: r.pattern || 'Plain', sizes: r.sizes || {},
    createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function saveDesign(d) {
  const { error } = await supabase.from('saved_designs').insert(toRow(d));
  if (error) throw error;
}

export async function updateDesign(id, d) {
  const { data: cur, error: e1 } = await supabase.from('saved_designs').select('*').eq('id', id).single();
  if (e1) throw e1;
  const { count } = await supabase.from('design_versions').select('id', { count: 'exact', head: true }).eq('design_id', id);
  const snapshot = {
    name: cur.name, industry: cur.industry, garment: cur.garment, fabric: cur.fabric,
    colour: cur.colour, decoration: cur.decoration, pattern: cur.pattern || 'Plain', sizes: cur.sizes || {},
  };
  const { error: e2 } = await supabase.from('design_versions').insert({ design_id: id, version: (count || 0) + 1, snapshot });
  if (e2) throw e2;
  const { error: e3 } = await supabase.from('saved_designs').update(toRow(d)).eq('id', id);
  if (e3) throw e3;
}

export async function listVersions(designId) {
  const { data, error } = await supabase.from('design_versions').select('*').eq('design_id', designId).order('version', { ascending: false });
  if (error) throw error;
  return data.map(r => ({ id: r.id, version: r.version, snapshot: r.snapshot, createdAt: new Date(r.created_at).getTime() }));
}

export async function deleteDesign(id) {
  const { error } = await supabase.from('saved_designs').delete().eq('id', id);
  if (error) throw error;
}
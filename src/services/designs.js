import { supabase } from './supabase.js';

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
  const { error } = await supabase.from('saved_designs').insert({
    name: d.name, industry: d.industry, garment: d.garment, fabric: d.fabric,
    colour: d.colour, decoration: d.decoration, pattern: d.pattern || 'Plain', sizes: d.sizes,
  });
  if (error) throw error;
}

export async function deleteDesign(id) {
  const { error } = await supabase.from('saved_designs').delete().eq('id', id);
  if (error) throw error;
}
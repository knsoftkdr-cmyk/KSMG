import { supabase } from './supabase.js';

export async function getSetting(id) {
  const { data, error } = await supabase.from('studio_settings').select('data').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? data.data : null;
}

export async function saveSetting(id, value) {
  const { error } = await supabase.from('studio_settings')
    .upsert({ id, data: value, updated_at: new Date().toISOString() });
  if (error) throw error;
}
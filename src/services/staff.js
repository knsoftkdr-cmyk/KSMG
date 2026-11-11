import { supabase } from './supabase.js';

export async function listStaff() {
  const { data, error } = await supabase.rpc('list_staff');
  if (error) throw error;
  return data;
}

export async function setUserRole(email, role) {
  const { error } = await supabase.rpc('set_user_role', { target_email: email, new_role: role });
  if (error) throw error;
}
import { supabase } from './supabase.js';

const fromRow = r => ({
  id: r.id, rfqId: r.rfq_id, status: r.status, name: r.name, organisation: r.organisation,
  industry: r.industry, email: r.email, phone: r.phone, productName: r.product_name,
  quantity: r.quantity, location: r.location, neededBy: r.needed_by, message: r.message,
  createdAt: new Date(r.created_at).getTime(),
});

export async function submitEnquiry(f, productName) {
  const { data, error } = await supabase.rpc('submit_enquiry', {
    payload: {
      name: f.name, organisation: f.organisation, industry: f.industry, email: f.email, phone: f.phone,
      product_name: productName, quantity: f.quantity, location: f.location,
      needed_by: f.neededBy, message: f.message,
    },
  });
  if (error) throw error;
  return data;
}

export async function listEnquiries() {
  const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(fromRow);
}

export async function setEnquiryStatus(id, status) {
  const { error } = await supabase.from('enquiries').update({ status }).eq('id', id);
  if (error) throw error;
}
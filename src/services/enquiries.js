import { supabase } from './supabase.js';

const fromRow = r => ({
  id: r.id, rfqId: r.rfq_id, status: r.status, name: r.name, organisation: r.organisation,
  industry: r.industry, email: r.email, phone: r.phone, productName: r.product_name,
  quantity: r.quantity, location: r.location, neededBy: r.needed_by, message: r.message,
  createdAt: new Date(r.created_at).getTime(),
});

export async function submitEnquiry(f, productName, productId = '') {
  const { data, error } = await supabase.rpc('submit_enquiry', {
    payload: {
      name: f.name, organisation: f.organisation, industry: f.industry, email: f.email, phone: f.phone,
      product_id: productId, product_name: productName, quantity: f.quantity, location: f.location,
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

export async function listEvents() {
  const { data, error } = await supabase.from('enquiry_events').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(r => ({
    id: r.id, enquiryId: r.enquiry_id, kind: r.kind, body: r.body,
    oldStatus: r.old_status, newStatus: r.new_status, by: r.author_email,
    createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function addNote(enquiryId, text) {
  const { error } = await supabase.rpc('add_enquiry_note', { enquiry: enquiryId, note: text });
  if (error) throw error;
}

export async function listQuotes() {
  const { data, error } = await supabase.from('quote_versions').select('*').order('version', { ascending: true });
  if (error) throw error;
  return data.map(r => ({
    id: r.id, enquiryId: r.enquiry_id, version: r.version, unitPrice: Number(r.unit_price),
    quantity: r.quantity, gst: Number(r.gst_percent), validUntil: r.valid_until, notes: r.notes,
    by: r.author_email, createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function addQuote(enquiryId, q) {
  const { data, error } = await supabase.rpc('add_quote_version', {
    enquiry: enquiryId, price: q.price, qty: q.qty, gst: q.gst, valid: q.valid || null, note: q.note || '',
  });
  if (error) throw error;
  return data;
}
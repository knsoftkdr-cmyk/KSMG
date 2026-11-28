import { supabase } from './supabase.js';

const fromRow = r => ({
  id: r.id, rfqId: r.rfq_id, status: r.status, name: r.name, organisation: r.organisation,
  industry: r.industry, email: r.email, phone: r.phone, productName: r.product_name,
  quantity: r.quantity, location: r.location, neededBy: r.needed_by, message: r.message,
  userId: r.user_id,
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
    sentAt: r.sent_at ? new Date(r.sent_at).getTime() : null,
    response: r.response || null, responseNote: r.response_note || '',
    respondedAt: r.responded_at ? new Date(r.responded_at).getTime() : null,
  }));
}

export async function addQuote(enquiryId, q) {
  const { data, error } = await supabase.rpc('add_quote_version', {
    enquiry: enquiryId, price: q.price, qty: q.qty, gst: q.gst, valid: q.valid || null, note: q.note || '',
  });
  if (error) throw error;
  return data;
}

export async function sendQuote(quoteId) {
  const { error } = await supabase.rpc('send_quote_version', { quote: quoteId });
  if (error) throw error;
}

export async function respondToQuote(quoteId, answer, note = '') {
  const { error } = await supabase.rpc('respond_to_quote', { quote: quoteId, answer, note });
  if (error) throw error;
}

export async function myRequests() {
  const { data, error } = await supabase.rpc('my_requests');
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id, rfqId: r.rfq_id, status: r.status || 'New', productName: r.product_name,
    quantity: r.quantity, location: r.location, neededBy: r.needed_by, message: r.message,
    createdAt: new Date(r.created_at).getTime(),
      samples: (r.samples || []).map(s => ({
      id: s.id, note: s.note || '', sentAt: new Date(s.sent_at).getTime(),
      response: s.response || null, responseNote: s.response_note || '',
      respondedAt: s.responded_at ? new Date(s.responded_at).getTime() : null,
    })),
    quotes: (r.quotes || []).map(q => ({
      id: q.id, version: q.version, unitPrice: Number(q.unit_price), quantity: q.quantity,
      gst: Number(q.gst_percent), validUntil: q.valid_until, notes: q.notes,
      sentAt: new Date(q.sent_at).getTime(),
      response: q.response || null, responseNote: q.response_note || '',
      respondedAt: q.responded_at ? new Date(q.responded_at).getTime() : null,
    })),
  }));
}

export async function listPosFor(enquiryId) {
  const { data, error } = await supabase.from('purchase_orders')
    .select('id, po_number, file_name, file_path, created_at')
    .eq('enquiry_id', enquiryId).order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(r => ({
    id: r.id, poNumber: r.po_number, fileName: r.file_name, filePath: r.file_path,
    createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function uploadPo(enquiryId, file, poNumber) {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) throw new Error('Please log in.');
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
  const path = `${uid}/${enquiryId}/${Date.now()}-${safe}`;
  const { error: upErr } = await supabase.storage.from('purchase-orders')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) { console.error(upErr); throw new Error('Could not upload the file. Please try again.'); }
  const { error } = await supabase.rpc('register_po', {
    enquiry: enquiryId, path, fname: file.name.slice(0, 200), po_no: poNumber || '',
  });
  if (error) throw error;
}

export async function poSignedUrl(path) {
  const { data, error } = await supabase.storage.from('purchase-orders').createSignedUrl(path, 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function listSamples() {
  const { data, error } = await supabase.from('samples').select('*').order('sent_at', { ascending: true });
  if (error) throw error;
  return data.map(r => ({
    id: r.id, enquiryId: r.enquiry_id, note: r.note || '', by: r.sent_by,
    sentAt: new Date(r.sent_at).getTime(),
    response: r.response || null, responseNote: r.response_note || '',
    respondedAt: r.responded_at ? new Date(r.responded_at).getTime() : null,
  }));
}

export async function sendSample(enquiryId, note = '') {
  const { error } = await supabase.rpc('send_sample', { enquiry: enquiryId, note });
  if (error) throw error;
}

export async function respondToSample(sampleId, answer, note = '') {
  const { error } = await supabase.rpc('respond_to_sample', { sample: sampleId, answer, note });
  if (error) throw error;
}


export async function listDispatches() {
  const { data, error } = await supabase.from('dispatches').select('*').order('sent_at', { ascending: true });
  if (error) throw error;
  return data.map(r => ({
    id: r.id, enquiryId: r.enquiry_id, courier: r.courier, trackingNo: r.tracking_no || '',
    note: r.note || '', sentAt: new Date(r.sent_at).getTime(),
  }));
}

export async function addDispatch(enquiryId, courier, trackingNo = '', note = '') {
  const { error } = await supabase.rpc('add_dispatch', {
    p_enquiry: enquiryId, p_courier: courier, p_tracking: trackingNo, p_note: note,
  });
  if (error) throw error;
}

export async function myDispatches() {
  const { data, error } = await supabase.rpc('my_dispatches');
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id, enquiryId: r.enquiry_id, courier: r.courier, trackingNo: r.tracking_no || '',
    note: r.note || '', sentAt: new Date(r.sent_at).getTime(),
  }));
}

export async function listInvoicesFor(enquiryId) {
  const { data, error } = await supabase.from('invoices')
    .select('id, invoice_number, file_name, file_path, created_at')
    .eq('enquiry_id', enquiryId).order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(r => ({
    id: r.id, invoiceNumber: r.invoice_number, fileName: r.file_name, filePath: r.file_path,
    createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function uploadInvoice(enquiryId, customerId, file, invoiceNo) {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
  const path = `${customerId}/${enquiryId}/${Date.now()}-${safe}`;
  const { error: upErr } = await supabase.storage.from('invoices')
    .upload(path, file, { contentType: 'application/pdf', upsert: false });
  if (upErr) { console.error(upErr); throw new Error('Could not upload the file. Please try again.'); }
  const { error } = await supabase.rpc('add_invoice', {
    p_enquiry: enquiryId, p_path: path, p_fname: file.name.slice(0, 200), p_no: invoiceNo,
  });
  if (error) throw error;
}

export async function myInvoices() {
  const { data, error } = await supabase.rpc('my_invoices');
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id, enquiryId: r.enquiry_id, invoiceNumber: r.invoice_number,
    fileName: r.file_name, filePath: r.file_path, createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function invoiceSignedUrl(path, downloadName) {
  const { data, error } = await supabase.storage.from('invoices')
    .createSignedUrl(path, 60, downloadName ? { download: downloadName } : undefined);
  if (error) throw error;
  return data.signedUrl;
}


export async function listEmailLog() {
  const { data, error } = await supabase.from('email_log')
    .select('id, enquiry_id, event, recipient, subject, status, error, created_at')
    .order('created_at', { ascending: false }).limit(500);
  if (error) throw error;
  return data.map(r => ({
    id: r.id, enquiryId: r.enquiry_id, event: r.event, to: r.recipient, subject: r.subject,
    status: r.status, error: r.error || '', createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function confirmDelivery(enquiryId) {
  const { error } = await supabase.rpc('confirm_delivery', { p_enquiry: enquiryId });
  if (error) throw error;
}

export async function submitFeedback(enquiryId, rating, comment = '') {
  const { error } = await supabase.rpc('submit_feedback', {
    p_enquiry: enquiryId, p_rating: rating, p_comment: comment,
  });
  if (error) throw error;
}

export async function myFeedback() {
  const { data, error } = await supabase.rpc('my_feedback');
  if (error) throw error;
  return (data || []).map(r => ({
    enquiryId: r.enquiry_id, rating: r.rating, comment: r.comment || '',
    createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function listFeedback() {
  const { data, error } = await supabase.from('feedback').select('*');
  if (error) throw error;
  return data.map(r => ({
    enquiryId: r.enquiry_id, rating: r.rating, comment: r.comment || '',
    createdAt: new Date(r.created_at).getTime(),
  }));
}
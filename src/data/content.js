// Text for the info pages. Replace the "TO CONFIRM" parts with real, verified company details.
// Rule from the brief: never publish certifications, clients, capacity or achievements without evidence.
const TBC = 'Company to confirm: this page has no verified details yet.';
export const CONTENT = {
  manufacturing: { title: 'Manufacturing', intro: 'How uniforms are made, from fabric to dispatch.', notice: TBC, sections: [
    { h: 'Our process', list: ['Design and technical review', 'Fabric sourcing and cutting', 'Stitching and finishing', 'Quality checks', 'Packing and dispatch'] },
    { h: 'Facilities and capacity', p: 'To be provided by the company. No capacity figures are published until they are verified.' }] },
  fabrics: { title: 'Fabrics', intro: 'Fabric options for each type of uniform.', notice: TBC, sections: [
    { h: 'What each product page shows', list: ['Fabric composition', 'GSM (fabric weight)', 'Colours and sizes', 'Seasonal suitability', 'Wash and care instructions'] },
    { h: 'Available fabrics', p: 'To be provided by the company.' }] },
  quality: { title: 'Quality & Standards', intro: 'Certifications and test evidence are shown here only when we hold valid proof.', notice: 'No certifications are listed yet. The standards below are examples of what may apply to specific products. They are not claims.', sections: [
    { h: 'Standards that may apply, depending on the product', table: [
      ['ISO 9001', 'Quality management systems'], ['ISO 14001', 'Environmental management systems'],
      ['OEKO-TEX STANDARD 100', 'Textiles tested for harmful substances'], ['ISO 20471', 'High-visibility clothing'],
      ['ISO 11612', 'Clothing protecting against heat and flame'], ['EN 13795', 'Surgical gowns and drapes']] },
    { h: 'Our commitment', p: 'We publish a certification or protective-performance claim only with valid supporting documents.' }] },
  sustainability: { title: 'Sustainability', intro: 'Our approach to responsible manufacturing.', notice: TBC, sections: [{ h: 'Practices and commitments', p: 'To be provided by the company.' }] },
  'bulk-orders': { title: 'Bulk Orders', intro: 'Ordering for schools, hospitals, offices and other institutions.', sections: [
    { h: 'How it works', list: ['Send a quote request with products, sizes and quantities', 'Our sales team prepares costing and sends a quotation', 'You approve the quotation and, if needed, samples', 'Production, quality check, dispatch and delivery'] },
    { h: 'Ready to start?', cta: true }] },
  samples: { title: 'Samples', intro: 'Ask for a sample before you place a bulk order.', notice: 'Sample availability and charges are to be confirmed by the company.', sections: [{ h: 'Request a sample', p: 'Mention "sample" in the details box of the quote request and tell us which product you want.', cta: true }] },
  faq: { title: 'FAQ', intro: 'Common questions about ordering.', sections: [
    { h: 'What is an RFQ?', p: 'A Request for Quotation. You tell us what you need, and we send back a price quote.' },
    { h: 'What is MOQ?', p: 'Minimum order quantity. It differs by product and is shown on the product page when available.' },
    { h: 'Can I order custom uniforms with my logo?', p: 'Yes, mention your logo and customisation needs in the quote request. Logos must be ones you are authorised to use.' },
    { h: 'Do you supply official government or police uniforms?', p: 'Only authorised official uniforms. Restricted insignia need approval.' }] },
  privacy: { title: 'Privacy Policy', intro: 'How this website handles your information.', notice: 'DRAFT: have a legal advisor review and complete this before going live.', sections: [
    { h: 'What we collect', p: 'Details you enter in the quote request form (name, organisation, email, phone and message).' },
    { h: 'How it is used', p: 'To respond to your request. To be completed by the company.' }] },
  terms: { title: 'Terms of Use', intro: 'Terms for using this website.', notice: 'DRAFT: have a legal advisor review and complete this before going live.', sections: [{ h: 'Terms', p: 'To be provided by the company.' }] },
  shipping: { title: 'Shipping', intro: 'Delivery information.', notice: TBC, sections: [{ h: 'Delivery and lead times', p: 'To be provided by the company.' }] },
  returns: { title: 'Returns', intro: 'Returns and exchanges.', notice: TBC, sections: [{ h: 'Policy', p: 'To be provided by the company.' }] },
  cookies: { title: 'Cookie & Consent Preferences', intro: 'How this site stores data in your browser.', sections: [
    { h: 'Current use', p: 'This site currently stores only your settings (theme, animations) and the products or quote requests you create, in your own browser. It has no advertising or tracking cookies.' }] },
};

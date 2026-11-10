// Industry taxonomy from the master document (section 3). Edit freely.
export const INDUSTRIES = [
  ['schools', 'Schools & Education', 'Shirts, trousers, skirts, blazers, ties, sportswear, teacher and college wear'],
  ['healthcare', 'Healthcare & Hospitals', 'Doctor coats, scrubs, lab coats, patient gowns, hospital staff'],
  ['corporate', 'Corporate & Office', 'Formal wear, reception, IT/BPO, branded polos and jackets'],
  ['hospitality', 'Hospitality & Food Service', 'Hotel staff, chef coats, aprons, housekeeping, cafe and catering'],
  ['industrial', 'Industrial & Technical', 'Coveralls, boiler suits, high-visibility and workshop wear'],
  ['government', 'Government, Security & Public Services', 'Security guards, municipal staff, utilities (insignia need approval)'],
  ['transport', 'Aviation, Rail & Transport', 'Cabin crew, ground staff, railway, metro, bus, chauffeur'],
  ['retail', 'Retail & Commercial', 'Supermarkets, showrooms, jewellery, petrol stations, delivery'],
  ['sports', 'Sports & Fitness', 'Team jerseys, tracksuits, gym, yoga, swimming'],
  ['food-agri', 'Food Processing & Agriculture', 'Food plants, dairies, bakeries, poultry, fisheries'],
  ['beauty', 'Beauty & Wellness', 'Salon, spa, cosmetic clinic, wellness studios'],
  ['ceremonial', 'Ceremonial & Cultural', 'Academic gowns, choir robes, marching bands'],
  ['events', 'Events & Media', 'Conference crews, exhibitions, promotions, volunteers'],
  ['facilities', 'Facilities & Domestic Services', 'Cleaning, laundry, pest control, landscaping, home care'],
  ['specialised', 'Specialised Institutional', 'NGOs, CSR, research labs, training, field surveys'],
].map(([slug, name, blurb]) => ({ slug, name, blurb }));
export const industryName = slug => INDUSTRIES.find(i => i.slug === slug)?.name || slug;

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

const BACKDROPS = ['schools', 'healthcare', 'corporate', 'hospitality', 'industrial', 'sports', 'transport', 'government', 'retail'];
export const bdClass = slug => `bd bd-${BACKDROPS.includes(slug) ? slug : 'default'}`;

// Garments and segments per industry (from the master document, section 3).
const D = {
  schools: 'Preschool to senior secondary; CBSE, ICSE, IB, Cambridge and boarding schools; Shirts, trousers, skirts, pinafores, tunics; Blazers, waistcoats, sweaters; Ties, belts, socks, scarves; Bags, jackets, rainwear; Sports houses; Teachers and admin staff; Colleges and universities; Graduation wear',
  healthcare: 'Doctors coats; Nurses scrubs; Surgical theatre clothing; Lab coats; Dental, pharmacy, veterinary; Physiotherapy and diagnostic; EMS and ambulance; Reception and administration; Housekeeping and maintenance; Patient gowns; Maternity care; Medical colleges',
  corporate: 'Business suits; Shirts, trousers, skirts; Smart-casual wear; Reception and front desk; Customer support and sales; IT and BPO; Branded polos; Jackets and sweatshirts; Event apparel',
  hospitality: 'Concierge and bell staff; Front desk; Housekeeping; Chef coats and hats; Aprons; Bakery and kitchen; Restaurants and cafes; Baristas; Banquets, resorts, spas and cruises',
  industrial: 'Factories; Automotive and workshops; Engineering and maintenance; Construction; Warehouse and logistics; Mining, oil and gas, energy, solar EPC; Coveralls and boiler suits; High-visibility wear; Cold storage, flame-resistant or chemical-resistant (only where verified)',
  government: 'Private security; Facility guards; Municipal and government office staff; Public utilities; Postal services; Emergency response; Civil defence. Authorised official uniforms only; restricted insignia need approval',
  transport: 'Airline cabin crew; Ground handling; Airport reception; Railway and metro; Bus and chauffeur; Shipping and maritime; Fleet staff',
  retail: 'Supermarkets; Shopping malls; Showrooms; Electronics; Automobile dealers; Petrol stations; Jewellery stores; Cashiers; Customer service; Delivery',
  sports: 'Cricket; Football; Basketball; Volleyball; Badminton; Athletics; Tennis; Swimming; Gym; Yoga; Academies; Tournament jerseys; Tracksuits; Fan apparel',
  'food-agri': 'Food plants; Dairies; Bakeries; Pharmaceuticals; Packaging; Agriculture and horticulture; Poultry; Fisheries; Cold-chain operations',
  beauty: 'Salon; Beauty parlour; Spa; Cosmetic clinic; Wellness; Grooming studios',
  ceremonial: 'Choir robes; Academic gowns; Cultural groups; Marching bands; Ceremonial attire',
  events: 'Conferences; Exhibitions; Promotions; Production crews; Theme parks; Volunteers',
  facilities: 'Cleaning; Laundry; Pest control; Landscaping; Building maintenance; Home care',
  specialised: 'NGOs; CSR; Skill development; Research labs; Technical training; Field surveys',
};
export const industryItems = slug => (D[slug] || '').split(';').map(s => s.trim()).filter(Boolean);

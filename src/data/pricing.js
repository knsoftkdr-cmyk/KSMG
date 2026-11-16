// PLACEHOLDER rates in INR per piece. Company to confirm. Staff can edit them on the Pricing page.
export const DEFAULT_RATES = {
  base: {
    Shirt: 450, Trousers: 550, Apron: 300, Skirt: 400, Pinafore: 450, Blazer: 1500,
    'Scrub top': 400, 'Lab coat': 650, 'Chef coat': 700, 'Salon wear': 500,
    Coverall: 900, 'Hi-vis jacket': 800, Gown: 600,
  },
  fabric: { Cotton: 1.1, 'Poly-cotton blend': 1, Polyester: 0.95, 'To be advised by sales team': 1 },
  decoration: { None: 0, Embroidery: 60, 'Screen print': 30, 'Heat transfer': 40 },
  pattern: { Plain: 0, Checks: 40, Stripes: 30 },
  discounts: [[500, 0.1], [200, 0.07], [100, 0.05], [50, 0.03]],
};

let RATES = DEFAULT_RATES;
export const getRates = () => RATES;
export function setRates(r) {
  if (r && r.base) RATES = { ...DEFAULT_RATES, ...r };
}

export function estimate({ garment, fabric, decoration, pattern, total }) {
  if (!total) return null;
  const R = RATES;
  const unit = (R.base[garment] || 0) * (R.fabric[fabric] || 1)
    + (R.decoration[decoration] || 0) + (R.pattern[pattern] || 0);
  const d = (R.discounts.find(([q]) => total >= q) || [0, 0])[1];
  const unitNet = Math.round(unit * (1 - d));
  return { unit: Math.round(unit), discount: d, unitNet, total: unitNet * total };
}
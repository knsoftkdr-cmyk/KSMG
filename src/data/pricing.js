// PLACEHOLDER rates in INR per piece. Company to confirm before going live.
export const BASE_PRICE = {
  Shirt: 450, Trousers: 550, Apron: 300, Skirt: 400, Pinafore: 450, Blazer: 1500,
  'Scrub top': 400, 'Lab coat': 650, 'Chef coat': 700, 'Salon wear': 500,
  Coverall: 900, 'Hi-vis jacket': 800, Gown: 600,
};
export const FABRIC_FACTOR = {
  Cotton: 1.1, 'Poly-cotton blend': 1, Polyester: 0.95, 'To be advised by sales team': 1,
};
export const DECORATION_EXTRA = { None: 0, Embroidery: 60, 'Screen print': 30, 'Heat transfer': 40 };
export const PATTERN_EXTRA = { Plain: 0, Checks: 40, Stripes: 30 };
export const DISCOUNTS = [[500, 0.1], [200, 0.07], [100, 0.05], [50, 0.03]];

export function estimate({ garment, fabric, decoration, pattern, total }) {
  if (!total) return null;
  const unit = (BASE_PRICE[garment] || 0) * (FABRIC_FACTOR[fabric] || 1)
    + (DECORATION_EXTRA[decoration] || 0) + (PATTERN_EXTRA[pattern] || 0);
  const d = (DISCOUNTS.find(([q]) => total >= q) || [0, 0])[1];
  const unitNet = Math.round(unit * (1 - d));
  return { unit: Math.round(unit), discount: d, unitNet, total: unitNet * total };
}
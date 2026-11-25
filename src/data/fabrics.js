// Fabric details shown in the Design Studio and printed in the tech pack.
// These are TYPICAL industry values for uniform fabrics, not KSMG's confirmed
// supplier specifications. Replace them with the real values from the
// supplier / brochure, or save a 'fabrics' setting in Supabase with the same
// shape to override them without a code change.
export const FABRIC_SPECS = {
  Cotton: {
    composition: '100% cotton',
    gsm: '110–140 (shirts), 220–280 (trousers, skirts)',
    weave: 'Poplin or oxford for shirts, twill for bottoms',
    width: '58–60 inches',
    finish: 'Pre-shrunk, soft wash',
    stretch: 'None',
    shrinkage: 'Up to 3% after first wash',
    care: 'Machine wash 40°C, medium iron',
    good: 'Breathable and comfortable in hot weather',
  },
  'Poly-cotton blend': {
    composition: '65% polyester, 35% cotton (also 67/33)',
    gsm: '115–150 (shirts), 230–300 (trousers, skirts)',
    weave: 'Poplin for shirts, twill or gaberdine for bottoms',
    width: '58–60 inches',
    finish: 'Easy-care, wrinkle resistant',
    stretch: 'None',
    shrinkage: 'Up to 1.5%',
    care: 'Machine wash 40°C, low iron',
    good: 'Holds colour and shape through daily washing',
  },
  Polyester: {
    composition: '100% polyester',
    gsm: '120–160 (shirts), 240–300 (trousers, skirts)',
    weave: 'Plain or twill',
    width: '58–60 inches',
    finish: 'Colour-fast, quick dry',
    stretch: 'Slight (mechanical)',
    shrinkage: 'Under 1%',
    care: 'Machine wash 30°C, cool iron',
    good: 'Very durable, low cost, dries fast',
  },
};

export const FABRIC_FIELDS = [
  ['composition', 'Composition'],
  ['gsm', 'Weight (GSM)'],
  ['weave', 'Weave'],
  ['width', 'Width'],
  ['finish', 'Finish'],
  ['stretch', 'Stretch'],
  ['shrinkage', 'Shrinkage'],
  ['care', 'Care'],
];

// overrides: optional object from the 'fabrics' setting, same shape as FABRIC_SPECS.
export function fabricSpec(name, overrides = null) {
  const base = FABRIC_SPECS[name];
  const own = overrides && typeof overrides === 'object' ? overrides[name] : null;
  if (!base && !own) return null;
  return { ...(base || {}), ...(own || {}), confirmed: !!own };
}

// Collar and sleeve options for shirts.
export const COLLAR_STYLES = ['Classic (convertible)', 'Formal (point)', 'Mandarin (band)', 'Polo (rib knit)'];
export const SLEEVE_STYLES = ['Half', 'Full'];

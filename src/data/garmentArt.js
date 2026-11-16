// Conceptual garment drawings (flat-lay style, with shading, seams, buttons, pockets).
// Plain functions that return SVG markup, so they are easy to test.

export const BODY = {
  Shirt: 'M60 20 L80 12 Q100 28 120 12 L140 20 L180 55 L160 85 L142 72 L142 205 L58 205 L58 72 L40 85 L20 55 Z',
  Trousers: 'M55 15 L145 15 L152 205 L108 205 L100 85 L92 205 L48 205 Z',
  Apron: 'M75 10 L125 10 L128 55 L160 70 L150 205 L50 205 L40 70 L72 55 Z',
  Skirt: 'M65 20 L135 20 L170 205 L30 205 Z',
  Pinafore: 'M70 10 L85 10 L90 45 L110 45 L115 10 L130 10 L135 55 L170 205 L30 205 L65 55 Z',
  Blazer: 'M58 18 L85 10 L100 45 L115 10 L142 18 L182 55 L165 90 L146 76 L146 205 L54 205 L54 76 L35 90 L18 55 Z',
  'Scrub top': 'M62 18 L88 12 L100 40 L112 12 L138 18 L178 45 L162 72 L145 62 L145 190 L55 190 L55 62 L38 72 L22 45 Z',
  'Lab coat': 'M58 18 L82 10 L100 45 L118 10 L142 18 L182 55 L168 100 L150 88 L152 212 L48 212 L50 88 L32 100 L18 55 Z',
  'Chef coat': 'M62 22 L82 12 Q100 26 118 12 L138 22 L172 42 L188 150 L162 156 L150 92 L150 205 L50 205 L50 92 L38 156 L12 150 L28 42 Z',
  'Salon wear': 'M62 18 L84 10 L100 34 L116 10 L138 18 L170 42 L156 68 L144 58 L156 168 L44 168 L56 58 L44 68 L30 42 Z',
  Coverall: 'M62 14 L84 10 L100 24 L116 10 L138 14 L178 48 L162 78 L145 66 L146 112 L152 210 L108 210 L100 128 L92 210 L48 210 L54 112 L55 66 L38 78 L22 48 Z',
  'Hi-vis jacket': 'M56 18 L84 10 L100 24 L116 10 L144 18 L172 40 L186 150 L162 156 L148 80 L148 196 L52 196 L52 80 L38 156 L14 150 L28 40 Z',
  Gown: 'M64 14 L84 10 L100 26 L116 10 L136 14 L176 50 L160 82 L146 70 L162 210 L38 210 L54 70 L40 82 L24 50 Z',
};

export const GARMENT_NAMES = Object.keys(BODY);

function isLight(hex) {
  const n = parseInt(String(hex).slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

const ln = (d, o, w = 1.2) => `<path d="${d}" fill="none" stroke="${o.line}" stroke-width="${w}" stroke-linecap="round"/>`;
const btn = (x, y, o) => `<circle cx="${x}" cy="${y}" r="2.3" fill="${o.btn}"/><circle cx="${x}" cy="${y}" r="0.7" fill="${o.line}"/>`;
const patch = (d, o) => `<path d="${d}" fill="${o.dark}" stroke="${o.line}" stroke-width="1.2" stroke-linejoin="round"/>`;
const part = (d, o) => `<path d="${d}" fill="${o.c}" stroke="${o.stroke}" stroke-width="1.2" stroke-linejoin="round"/><path d="${d}" fill="${o.dark}"/>`;
const hole = d => `<path d="${d}" fill="rgba(0,0,0,0.5)"/>`;
const trim = (d, o) => `<path d="${d}" fill="none" stroke="${o.line}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>`;
const cuffs = (a, b, o) => ln(a, o) + ln(b, o);
const buttons = (x, ys, o) => ys.map(y => btn(x, y, o)).join('');

const DETAIL = {
  Shirt: {
    inside: o => ln('M100 34 V205', o) + buttons(100, [58, 88, 118, 148, 178], o)
      + patch('M112 68 H132 V88 L122 93 L112 88 Z', o) + ln('M58 198 H142', o)
      + cuffs('M24 52 L44 82', 'M176 52 L156 82', o)
      + ln('M64 84 Q68 130 64 170', o, 0.8) + ln('M136 84 Q132 130 136 170', o, 0.8),
    outside: o => part('M78 11 L100 36 L86 48 L64 24 Z', o) + part('M122 11 L100 36 L114 48 L136 24 Z', o),
  },
  Trousers: {
    inside: o => `<path d="M40 15 H160 V28 H40 Z" fill="${o.dark}"/>` + ln('M40 28 H160', o)
      + [64, 86, 112, 134].map(x => `<rect x="${x}" y="13" width="4" height="18" rx="1" fill="${o.dark}" stroke="${o.line}" stroke-width="0.9"/>`).join('')
      + btn(100, 21, o) + ln('M100 28 V62 Q100 68 94 68', o)
      + ln('M57 28 Q72 40 74 66', o) + ln('M143 28 Q128 40 126 66', o)
      + ln('M80 70 L70 205', o, 0.8) + ln('M120 70 L130 205', o, 0.8)
      + ln('M49 196 H92', o) + ln('M108 196 H151', o),
    outside: () => '',
  },
  Apron: {
    inside: o => ln('M42 72 Q100 82 158 72', o) + patch('M68 128 H132 V176 H68 Z', o) + ln('M100 128 V176', o)
      + ln('M52 196 H148', o),
    outside: o => `<path d="M75 11 Q100 -2 125 11" fill="none" stroke="${o.stroke}" stroke-width="7" stroke-linecap="round"/>`
      + `<path d="M75 11 Q100 -2 125 11" fill="none" stroke="${o.c}" stroke-width="5" stroke-linecap="round"/>`
      + part('M40 68 L12 80 L15 92 L43 79 Z', o) + part('M160 68 L188 80 L185 92 L157 79 Z', o),
  },
  Skirt: {
    inside: o => `<path d="M60 20 H140 V32 H60 Z" fill="${o.dark}"/>` + ln('M60 32 H140', o)
      + ln('M72 32 L44 205', o) + ln('M86 32 L70 205', o) + ln('M100 32 V205', o) + ln('M114 32 L130 205', o) + ln('M128 32 L156 205', o)
      + btn(100, 26, o) + ln('M32 196 H168', o),
    outside: () => '',
  },
  Pinafore: {
    inside: o => btn(78, 24, o) + btn(122, 24, o) + ln('M64 62 Q100 74 136 62', o) + ln('M60 86 Q100 96 140 86', o)
      + ln('M82 92 L60 205', o) + ln('M100 92 V205', o) + ln('M118 92 L140 205', o) + ln('M31 196 H169', o),
    outside: () => '',
  },
  Blazer: {
    inside: o => ln('M100 60 V205', o) + buttons(95, [104, 132], o)
      + patch('M62 148 H90 V156 H62 Z', o) + patch('M110 148 H138 V156 H110 Z', o) + ln('M112 88 H130', o)
      + ln('M55 196 H145', o) + ln('M54 76 Q56 40 62 22', o, 0.8) + ln('M146 76 Q144 40 138 22', o, 0.8)
      + cuffs('M23 52 L40 87', 'M177 52 L160 87', o),
    outside: o => hole('M85 10 L115 10 L100 60 Z') + `<path d="M90 10 L100 30 L110 10 Z" fill="#f2f2f2"/>`
      + part('M85 10 L68 32 L78 40 L66 56 L92 100 L100 60 Z', o) + part('M115 10 L132 32 L122 40 L134 56 L108 100 L100 60 Z', o),
  },
  'Scrub top': {
    inside: o => patch('M114 64 H134 V84 H114 Z', o) + patch('M59 138 H86 V166 H59 Z', o) + patch('M114 138 H141 V166 H114 Z', o)
      + ln('M55 183 H145', o) + cuffs('M27 42 L43 69', 'M173 42 L157 69', o),
    outside: o => hole('M88 12 L100 40 L112 12 Z') + trim('M88 12 L100 40 L112 12', o),
  },
  'Lab coat': {
    inside: o => ln('M100 100 V212', o) + buttons(106, [112, 140, 168, 196], o)
      + patch('M116 80 H136 V98 H116 Z', o) + patch('M58 150 H86 V176 H58 Z', o) + patch('M114 150 H142 V176 H114 Z', o)
      + ln('M50 204 H150', o) + cuffs('M24 53 L38 98', 'M176 53 L162 98', o),
    outside: o => hole('M82 10 L118 10 L100 45 Z') + part('M82 10 L66 34 L76 42 L68 56 L100 100 L100 45 Z', o) + part('M118 10 L134 34 L124 42 L132 56 L100 100 L100 45 Z', o),
  },
  'Chef coat': {
    inside: o => ln('M118 24 Q124 30 124 40 V205', o) + ln('M76 40 V205', o, 0.7)
      + buttons(88, [56, 84, 112, 140, 168], o) + buttons(112, [56, 84, 112, 140, 168], o)
      + ln('M50 196 H150', o) + cuffs('M14 136 L40 142', 'M186 136 L160 142', o),
    outside: o => part('M80 11 Q100 26 120 11 L121 25 Q100 40 79 25 Z', o),
  },
  'Salon wear': {
    inside: o => ln('M100 34 V168', o) + buttons(100, [48, 68, 88], o)
      + patch('M60 112 H86 V138 H60 Z', o) + patch('M114 112 H140 V138 H114 Z', o)
      + ln('M44 160 H156', o) + cuffs('M34 40 L48 66', 'M166 40 L152 66', o),
    outside: o => trim('M84 10 L100 34 L116 10', o),
  },
  Coverall: {
    inside: o => ln('M100 24 V128', o) + patch('M64 60 H88 V82 H64 Z', o) + patch('M112 60 H136 V82 H112 Z', o)
      + `<path d="M50 104 H150 V114 H50 Z" fill="${o.dark}" stroke="${o.line}" stroke-width="1"/>`
      + `<rect x="95" y="102" width="10" height="14" rx="1.5" fill="none" stroke="${o.line}" stroke-width="1.4"/>`
      + ln('M77 125 L70 205', o, 0.8) + ln('M123 125 L130 205', o, 0.8)
      + ln('M49 200 H92', o) + ln('M108 200 H151', o) + cuffs('M26 46 L42 76', 'M174 46 L158 76', o),
    outside: o => part('M84 9 L100 26 L88 36 L68 20 Z', o) + part('M116 9 L100 26 L112 36 L132 20 Z', o),
  },
  'Hi-vis jacket': {
    inside: o => ln('M100 24 V196', o) + patch('M58 148 H88 V178 H58 Z', o) + patch('M112 148 H142 V178 H112 Z', o)
      + `<rect x="0" y="118" width="200" height="9" fill="#e9e9e9" opacity="0.92"/><rect x="0" y="121" width="200" height="1" fill="#9a9a9a" opacity="0.7"/>`
      + `<rect x="66" y="10" width="8" height="108" fill="#e9e9e9" opacity="0.92"/><rect x="126" y="10" width="8" height="108" fill="#e9e9e9" opacity="0.92"/>`
      + ln('M52 188 H148', o),
    outside: o => part('M84 9 L100 24 L88 34 L68 20 Z', o) + part('M116 9 L100 24 L112 34 L132 20 Z', o),
  },
  Gown: {
    inside: o => ln('M100 26 L116 98', o) + ln('M72 108 L62 210', o) + ln('M100 108 V210', o) + ln('M128 108 L138 210', o)
      + `<path d="M40 98 H160 V108 H40 Z" fill="${o.dark}" stroke="${o.line}" stroke-width="1"/>`
      + `<path d="M100 103 L90 126 L96 123 L100 113 L104 123 L110 126 Z" fill="${o.dark}" stroke="${o.line}" stroke-width="1" stroke-linejoin="round"/>`
      + ln('M40 202 H160', o) + cuffs('M28 48 L44 80', 'M172 48 L156 80', o),
    outside: o => hole('M84 10 L100 26 L116 10 Z') + trim('M84 10 L100 26 L116 10', o),
  },
};

export function hasGarmentArt(name) { return Boolean(BODY[name]); }

// name: garment, opts: { colour, stroke, pattern: 'Plain' | 'Checks' | 'Stripes', id }
export function garmentSvg(name, opts = {}) {
  const body = BODY[name];
  if (!body) return '';
  const colour = opts.colour || '#0a1330';
  const id = String(opts.id || 'g').replace(/[^a-zA-Z0-9_-]/g, '');
  const light = isLight(colour);
  const o = {
    c: colour,
    stroke: opts.stroke || 'rgba(0,0,0,0.35)',
    line: light ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.30)',
    ink: light ? 'rgba(0,0,0,0.30)' : 'rgba(255,255,255,0.34)',
    btn: light ? 'rgba(0,0,0,0.38)' : 'rgba(255,255,255,0.55)',
    dark: 'rgba(0,0,0,0.10)',
  };
  const d = DETAIL[name];
  const pattern = opts.pattern === 'Checks' ? `<rect width="200" height="220" fill="url(#ck-${id})"/>`
    : opts.pattern === 'Stripes' ? `<rect width="200" height="220" fill="url(#st-${id})"/>` : '';
  return `<defs>
<clipPath id="cp-${id}"><path d="${body}"/></clipPath>
<linearGradient id="sh-${id}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.26"/><stop offset="0.22" stop-color="#000" stop-opacity="0"/><stop offset="0.72" stop-color="#fff" stop-opacity="0.07"/><stop offset="1" stop-color="#000" stop-opacity="0.30"/></linearGradient>
<linearGradient id="hl-${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.10"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.14"/></linearGradient>
<pattern id="ck-${id}" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="7" fill="${o.ink}" opacity="0.55"/><rect width="7" height="14" fill="${o.ink}" opacity="0.55"/></pattern>
<pattern id="st-${id}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="4" height="10" fill="${o.ink}"/></pattern>
</defs>
<path d="${body}" fill="${o.c}"/>
<g clip-path="url(#cp-${id})">${pattern}${d.inside(o)}<rect width="200" height="220" fill="url(#sh-${id})"/><rect width="200" height="220" fill="url(#hl-${id})"/></g>
<path d="${body}" fill="none" stroke="${o.stroke}" stroke-width="2" stroke-linejoin="round"/>
${d.outside(o)}`;
}
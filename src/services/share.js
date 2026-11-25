// Share a Design Studio design as a link. The design choices are packed into
// the URL itself, so nothing is stored on the server and no login is needed
// to open it. The logo is NOT included (it stays on the designer's device).

const HEX = /^#[0-9a-f]{6}$/i;
const TEX = /^\/images\/textures\/[a-z0-9-]+\.jpg$/;
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

const str = (v, max = 80) => (typeof v === 'string' ? v.slice(0, max) : '');
const hex = v => (typeof v === 'string' && HEX.test(v) ? v.toLowerCase() : '');
const tex = v => (typeof v === 'string' && TEX.test(v) ? v : '');
const qty = v => {
  const o = {};
  SIZES.forEach(s => { const n = Math.floor(Number(v && v[s]) || 0); o[s] = Math.min(1000000, Math.max(0, n)); });
  return o;
};

function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromBase64Url(code) {
  const b64 = code.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '==='.slice((b64.length + 3) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}

// Keep only known fields with safe values. Anything else is dropped.
export function cleanDesign(d, allowed = {}) {
  if (!d || typeof d !== 'object') return null;
  const e = d.extra && typeof d.extra === 'object' ? d.extra : {};
  const p = e.panels && typeof e.panels === 'object' ? e.panels : {};
  const st = e.style && typeof e.style === 'object' ? e.style : {};
  const pick = (v, list, dflt) => (list && list.includes(v) ? v : dflt);
  return {
    name: str(d.name),
    industry: str(d.industry, 60),
    garment: pick(d.garment, allowed.garments, 'Pair'),
    fabric: pick(d.fabric, allowed.fabrics, allowed.fabrics ? allowed.fabrics[0] : ''),
    colour: hex(d.colour) || '#0a1330',
    decoration: pick(d.decoration, allowed.decorations, 'None'),
    pattern: pick(d.pattern, ['Plain', 'Checks', 'Stripes'], 'Plain'),
    sizes: qty(d.sizes),
    extra: {
      shirtColour: hex(e.shirtColour) || '#7fb2e5',
      shirtTex: tex(e.shirtTex),
      pantColour: hex(e.pantColour) || '#0a1330',
      pantTex: tex(e.pantTex),
      panels: { collar: hex(p.collar), sleeves: hex(p.sleeves), cuffs: hex(p.cuffs) },
      style: {
        collar: pick(st.collar, allowed.collars, allowed.collars ? allowed.collars[0] : ''),
        sleeve: pick(st.sleeve, ['Half', 'Full'], 'Half'),
      },
    },
  };
}

export function shareCode(design) {
  return toBase64Url(JSON.stringify(design));
}

export function readShareCode(code, allowed) {
  if (!code || code.length > 4000) return null;
  try { return cleanDesign(JSON.parse(fromBase64Url(code)), allowed); } catch { return null; }
}

export function shareUrl(design, origin = window.location.origin) {
  return `${origin}/design-studio?share=${shareCode(design)}`;
}

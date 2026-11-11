import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { INDUSTRIES } from '../data/industries.js';
import usePageMeta from '../hooks/usePageMeta.js';

const GARMENTS = ['Shirt', 'Trousers', 'Apron', 'Skirt', 'Pinafore', 'Blazer', 'Scrub top', 'Lab coat', 'Chef coat', 'Salon wear', 'Coverall', 'Hi-vis jacket', 'Gown'];
const FABRICS = ['Cotton', 'Poly-cotton blend', 'Polyester', 'To be advised by sales team'];
const COLOURS = [
  ['Navy', '#0a1330'], ['White', '#ffffff'], ['Sky blue', '#7fb2e5'], ['Grey', '#8b8f98'],
  ['Maroon', '#7a1f2b'], ['Green', '#1f6b4a'], ['Black', '#1a1a1a'], ['Khaki', '#b8a77a'],
];
const DECORATION = ['None', 'Embroidery', 'Screen print', 'Heat transfer'];
const SIZES = ['S', 'M', 'L', 'XL', '2XL'];

const SHAPES = {
  Shirt: 'M60 20 L80 12 Q100 28 120 12 L140 20 L180 55 L160 85 L142 72 L142 205 L58 205 L58 72 L40 85 L20 55 Z',
  Trousers: 'M55 15 L145 15 L152 205 L108 205 L100 85 L92 205 L48 205 Z',
  Apron: 'M75 10 L125 10 L128 55 L160 70 L150 205 L50 205 L40 70 L72 55 Z',
  Skirt: 'M65 20 L135 20 L170 205 L30 205 Z',
  Pinafore: 'M70 10 L85 10 L90 45 L110 45 L115 10 L130 10 L135 55 L170 205 L30 205 L65 55 Z',
  Blazer: 'M58 18 L85 10 L100 45 L115 10 L142 18 L182 55 L165 90 L146 76 L146 205 L54 205 L54 76 L35 90 L18 55 Z',
  'Scrub top': 'M62 18 L88 12 L100 40 L112 12 L138 18 L178 45 L162 72 L145 62 L145 190 L55 190 L55 62 L38 72 L22 45 Z',
  'Lab coat': 'M58 18 L82 10 L100 45 L118 10 L142 18 L182 55 L168 100 L150 88 L152 212 L48 212 L50 88 L32 100 L18 55 Z',
  'Chef coat': 'M60 22 L80 12 L100 30 L120 12 L140 22 L182 58 L166 92 L146 78 L146 205 L54 205 L54 78 L34 92 L18 58 Z',
};
const LOGO_POS = {
  Shirt: [118, 50], Trousers: [108, 28], Apron: [85, 80], Skirt: [105, 40], Pinafore: [84, 75],
  Blazer: [120, 60], 'Scrub top': [116, 52], 'Lab coat': [118, 60], 'Chef coat': [118, 52],
};

// More garments (simple conceptual outlines)
Object.assign(SHAPES, {
  'Salon wear': 'M62 18 L84 10 L100 34 L116 10 L138 18 L170 42 L156 68 L144 58 L156 168 L44 168 L56 58 L44 68 L30 42 Z',
  Coverall: 'M62 14 L84 10 L100 24 L116 10 L138 14 L178 48 L162 78 L145 66 L146 112 L152 210 L108 210 L100 128 L92 210 L48 210 L54 112 L55 66 L38 78 L22 48 Z',
  'Hi-vis jacket': 'M56 18 L84 10 L100 24 L116 10 L144 18 L172 40 L186 150 L162 156 L148 80 L148 196 L52 196 L52 80 L38 156 L14 150 L28 40 Z',
  Gown: 'M64 14 L84 10 L100 26 L116 10 L136 14 L176 50 L160 82 L146 70 L162 210 L38 210 L54 70 L40 82 L24 50 Z',
});
Object.assign(LOGO_POS, {
  'Salon wear': [114, 48], Coverall: [116, 48], 'Hi-vis jacket': [118, 56], Gown: [116, 50],
});

export default function DesignStudio() {
  usePageMeta('Custom Design Studio', 'Create a conceptual uniform design with your colours and logo, then request a technical review and quotation.');
  const [industry, setIndustry] = useState(INDUSTRIES[0].slug);
  const [garment, setGarment] = useState('Shirt');
  const [fabric, setFabric] = useState(FABRICS[0]);
  const [colour, setColour] = useState(COLOURS[0][1]);
  const [decoration, setDecoration] = useState('None');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoOk, setLogoOk] = useState(false);
  const [qty, setQty] = useState({ S: 0, M: 0, L: 0, XL: 0, '2XL': 0 });

  const total = useMemo(() => Object.values(qty).reduce((a, b) => a + (Number(b) || 0), 0), [qty]);
  const colourName = (COLOURS.find(c => c[1] === colour) || ['Custom'])[0];
  const strokeColour = colour === '#ffffff' ? '#999' : 'rgba(0,0,0,0.35)';
  const [lx, ly] = LOGO_POS[garment];

  function onLogo(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoUrl(URL.createObjectURL(f));
  }

  return (
    <section className="ds">
      <div className="ds-head">
        <h1>Custom Design Studio</h1>
        <p className="ds-note"><strong>Conceptual preview only.</strong> This is not a manufacturing-ready pattern. Our team reviews every design before quoting. Fabric options are to be confirmed by the company.</p>
      </div>

      <div className="ds-grid">
        <div className="ds-form">
          <label>1. Industry
            <select value={industry} onChange={e => setIndustry(e.target.value)}>
              {INDUSTRIES.map(i => <option key={i.slug} value={i.slug}>{i.name}</option>)}
            </select>
          </label>

          <label>2. Garment
            <select value={garment} onChange={e => setGarment(e.target.value)}>
              {GARMENTS.map(g => <option key={g}>{g}</option>)}
            </select>
          </label>

          <label>3. Fabric
            <select value={fabric} onChange={e => setFabric(e.target.value)}>
              {FABRICS.map(f => <option key={f}>{f}</option>)}
            </select>
          </label>

          <div className="ds-field">
            <span>4. Colour: {colourName}</span>
            <div className="ds-swatches">
              {COLOURS.map(([n, c]) => (
                <button key={n} type="button" title={n} aria-label={n}
                  className={colour === c ? 'sw on' : 'sw'} style={{ background: c }}
                  onClick={() => setColour(c)} />
              ))}
            </div>
          </div>

          <label>5. Logo (only a logo you are authorised to use)
            <input type="file" accept="image/*" onChange={onLogo} />
          </label>

          <label>6. Decoration
            <select value={decoration} onChange={e => setDecoration(e.target.value)}>
              {DECORATION.map(d => <option key={d}>{d}</option>)}
            </select>
          </label>

          <div className="ds-field">
            <span>7. Sizes and quantities (total: {total})</span>
            <div className="ds-sizes">
              {SIZES.map(s => (
                <label key={s}>{s}
                  <input type="number" min="0" value={qty[s]}
                    onChange={e => setQty({ ...qty, [s]: Math.max(0, Number(e.target.value) || 0) })} />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="ds-preview">
          <svg viewBox="0 0 200 220" role="img" aria-label={`Conceptual preview of a ${colourName} ${garment}`}>
            <path d={SHAPES[garment]} fill={colour} stroke={strokeColour} strokeWidth="2" />
            {logoUrl && logoOk !== 'bad' && (
              <image href={logoUrl} x={lx} y={ly} width="32" height="32" preserveAspectRatio="xMidYMid meet" onError={() => setLogoOk('bad')} />
            )}
          </svg>
          <p className="ds-badge">CONCEPTUAL PREVIEW</p>
          <ul className="ds-summary">
            <li>Garment: {garment} ({colourName})</li>
            <li>Fabric: {fabric}</li>
            <li>Decoration: {decoration}</li>
            <li>Logo: {logoUrl ? 'added' : 'none'}</li>
            <li>Total quantity: {total}</li>
          </ul>
          <Link to="/quote" className="btn gold">Request review and quotation</Link>
          <p className="ds-note small">Saving designs needs a login. It will be added with the backend. Please copy these details into the quote request for now.</p>
        </div>
      </div>
    </section>
  );
}
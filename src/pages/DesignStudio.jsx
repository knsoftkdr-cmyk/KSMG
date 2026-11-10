import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { INDUSTRIES } from '../data/industries.js';

const GARMENTS = ['Shirt', 'Trousers', 'Apron'];
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
};
const LOGO_POS = { Shirt: [118, 50], Trousers: [108, 28], Apron: [85, 80] };

export default function DesignStudio() {
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
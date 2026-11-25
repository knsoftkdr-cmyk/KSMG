import { describe, it, expect } from 'vitest';
import { shareCode, readShareCode, cleanDesign } from '../services/share.js';
import { fabricSpec, COLLAR_STYLES } from '../data/fabrics.js';

const allowed = {
  garments: ['Pair', 'Apron'],
  fabrics: ['Cotton', 'Polyester'],
  decorations: ['None', 'Embroidery'],
  collars: COLLAR_STYLES,
};

const design = {
  name: 'Blue school set',
  industry: 'schools',
  garment: 'Pair',
  fabric: 'Polyester',
  colour: '#0A1330',
  decoration: 'Embroidery',
  pattern: 'Checks',
  sizes: { S: 10, M: 20 },
  extra: {
    shirtColour: '#7fb2e5', shirtTex: '/images/textures/oxford-001.jpg',
    pantColour: '#0a1330', pantTex: '',
    panels: { collar: '#7a1f2b', sleeves: '', cuffs: '#ffffff' },
    style: { collar: 'Mandarin (band)', sleeve: 'Full' },
  },
};

describe('share link', () => {
  it('round-trips a design', () => {
    const d = readShareCode(shareCode(design), allowed);
    expect(d.name).toBe('Blue school set');
    expect(d.garment).toBe('Pair');
    expect(d.fabric).toBe('Polyester');
    expect(d.colour).toBe('#0a1330');
    expect(d.sizes.M).toBe(20);
    expect(d.sizes.XS).toBe(0);
    expect(d.extra.panels).toEqual({ collar: '#7a1f2b', sleeves: '', cuffs: '#ffffff' });
    expect(d.extra.style).toEqual({ collar: 'Mandarin (band)', sleeve: 'Full' });
    expect(d.extra.shirtTex).toBe('/images/textures/oxford-001.jpg');
  });

  it('uses only URL-safe characters', () => {
    expect(shareCode({ ...design, name: 'Ünïcode ✓ / + =' })).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('drops unsafe or unknown values', () => {
    const d = cleanDesign({
      ...design,
      garment: 'Spaceship',
      colour: 'red;background:url(x)',
      sizes: { M: -5, L: 1e12, XL: 'abc' },
      extra: {
        shirtTex: 'https://evil.example/x.jpg',
        pantTex: '/images/textures/../../secret.jpg',
        panels: { collar: 'javascript:alert(1)' },
        style: { collar: '<script>', sleeve: 'Long' },
        other: 'ignored',
      },
    }, allowed);
    expect(d.garment).toBe('Pair');
    expect(d.colour).toBe('#0a1330');
    expect(d.sizes.M).toBe(0);
    expect(d.sizes.L).toBe(1000000);
    expect(d.sizes.XL).toBe(0);
    expect(d.extra.shirtTex).toBe('');
    expect(d.extra.pantTex).toBe('');
    expect(d.extra.panels.collar).toBe('');
    expect(d.extra.style).toEqual({ collar: COLLAR_STYLES[0], sleeve: 'Half' });
    expect(d.extra.other).toBeUndefined();
  });

  it('rejects broken or oversized codes', () => {
    expect(readShareCode('not-base64!!', allowed)).toBeNull();
    expect(readShareCode('a'.repeat(5000), allowed)).toBeNull();
    expect(readShareCode('', allowed)).toBeNull();
  });
});

describe('fabric details', () => {
  it('gives typical values when KSMG has not set its own', () => {
    const f = fabricSpec('Cotton');
    expect(f.composition).toMatch(/cotton/i);
    expect(f.confirmed).toBe(false);
  });

  it('lets the saved setting override values', () => {
    const f = fabricSpec('Cotton', { Cotton: { gsm: '135' } });
    expect(f.gsm).toBe('135');
    expect(f.composition).toMatch(/cotton/i);
    expect(f.confirmed).toBe(true);
  });

  it('returns null for an unknown fabric', () => {
    expect(fabricSpec('To be advised by sales team')).toBeNull();
  });
});

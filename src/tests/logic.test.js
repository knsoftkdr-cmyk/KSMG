import { describe, it, expect, afterEach } from 'vitest';
import { DEFAULT_RATES, estimate, setRates, getRates } from '../data/pricing.js';
import { SIZE_CHART } from '../data/sizeChart.js';
import { recommendSize } from '../services/sizeRecommend.js';

const base = { garment: 'Shirt', fabric: 'Poly-cotton blend', decoration: 'None', pattern: 'Plain' };

describe('pricing estimate', () => {
  afterEach(() => setRates(DEFAULT_RATES));

  it('returns null when quantity is 0', () => {
    expect(estimate({ ...base, total: 0 })).toBeNull();
  });

  it('adds fabric, decoration and pattern to the base rate', () => {
    const R = DEFAULT_RATES;
    const e = estimate({ garment: 'Shirt', fabric: 'Cotton', decoration: 'Embroidery', pattern: 'Checks', total: 1 });
    const expected = Math.round(R.base.Shirt * R.fabric.Cotton + R.decoration.Embroidery + R.pattern.Checks);
    expect(e.unit).toBe(expected);
    expect(e.discount).toBe(0);
    expect(e.unitNet).toBe(expected);
  });

  it('gives no discount below the first tier', () => {
    const lowest = Math.min(...DEFAULT_RATES.discounts.map(([q]) => q));
    expect(estimate({ ...base, total: lowest - 1 }).discount).toBe(0);
  });

  it('applies the right bulk discount at each tier', () => {
    for (const [q, d] of DEFAULT_RATES.discounts) {
      const at = estimate({ ...base, total: q });
      const below = estimate({ ...base, total: q - 1 });
      expect(at.discount).toBe(d);
      expect(below.discount).toBeLessThan(d);
    }
  });

  it('total equals price per piece times quantity', () => {
    const e = estimate({ ...base, total: 120 });
    expect(e.total).toBe(e.unitNet * 120);
    expect(e.unitNet).toBeLessThanOrEqual(e.unit);
  });

  it('uses new rates after setRates, and keeps the other defaults', () => {
    setRates({ base: { Shirt: 1000 } });
    expect(estimate({ ...base, total: 1 }).unit).toBe(1000);
    expect(getRates().discounts).toEqual(DEFAULT_RATES.discounts);
  });

  it('ignores empty or wrong rates', () => {
    setRates(null);
    setRates({});
    expect(getRates().base.Shirt).toBe(DEFAULT_RATES.base.Shirt);
  });
});

describe('size recommendation', () => {
  const last = SIZE_CHART.length - 1;

  it('gives the same size back for each size in the chart', () => {
    for (const s of SIZE_CHART) {
      const r = recommendSize({ height: (s.heightMin + s.heightMax) / 2, shoulder: s.shoulder, hipWidth: s.hipWidth });
      expect(r, s.size).toEqual({ top: s.size, bottom: s.size });
    }
  });

  it('gives the smallest size for a very short person and the largest for a very tall one', () => {
    const f = SIZE_CHART[0], l = SIZE_CHART[last];
    expect(recommendSize({ height: 100, shoulder: f.shoulder, hipWidth: f.hipWidth })).toEqual({ top: f.size, bottom: f.size });
    expect(recommendSize({ height: 250, shoulder: f.shoulder, hipWidth: f.hipWidth })).toEqual({ top: l.size, bottom: l.size });
  });

  it('loose fit goes one size up, but never above the largest', () => {
    SIZE_CHART.forEach((s, i) => {
      const r = recommendSize({ height: (s.heightMin + s.heightMax) / 2, shoulder: s.shoulder, hipWidth: s.hipWidth, fit: 'loose' });
      const want = SIZE_CHART[Math.min(i + 1, last)].size;
      expect(r, s.size).toEqual({ top: want, bottom: want });
    });
  });

  it('a typed chest size decides the top size', () => {
    const tall = SIZE_CHART[last];
    for (const s of SIZE_CHART) {
      const r = recommendSize({ height: (tall.heightMin + tall.heightMax) / 2, shoulder: tall.shoulder, hipWidth: tall.hipWidth, chest: s.chest });
      expect(r.top, s.size).toBe(s.size);
      expect(r.bottom).toBe(tall.size);
    }
  });
});
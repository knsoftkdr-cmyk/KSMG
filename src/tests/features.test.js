import { describe, it, expect, vi } from 'vitest';
vi.mock('../services/settings.js', () => ({ getSetting: async () => null }));
vi.mock('../services/auth.jsx', () => ({ useAuth: () => ({}) }));
import { normaliseFeatures, isFeatureOn, hashEmail, maskEmail, DEFAULT_FEATURES } from '../services/features.js';

const visitor = { user: null, role: null, emailHash: null };
const customer = { user: { id: 'c' }, role: 'customer', emailHash: 'abc' };
const staff = { user: { id: 's' }, role: 'sales', emailHash: 'zzz' };

describe('feature flags', () => {
  it('uses defaults when nothing is saved', () => {
    expect(normaliseFeatures(null)).toEqual(DEFAULT_FEATURES);
  });

  it('reads the old { threeD: false } setting', () => {
    const f = normaliseFeatures({ threeD: false });
    expect(f.threeD.audience).toBe('off');
    expect(f.classic.audience).toBe('all');
  });

  it('ignores an unknown audience', () => {
    expect(normaliseFeatures({ ai: { audience: 'bogus' } }).ai.audience).toBe('off');
  });

  it('applies each audience', () => {
    const on = (audience, who, emails = []) => isFeatureOn({ audience, emails }, who);
    expect(on('all', visitor)).toBe(true);
    expect(on('off', staff)).toBe(false);
    expect(on('users', visitor)).toBe(false);
    expect(on('users', customer)).toBe(true);
    expect(on('staff', customer)).toBe(false);
    expect(on('staff', staff)).toBe(true);
    expect(on('selected', customer)).toBe(false);
    expect(on('selected', customer, [{ hash: 'abc' }])).toBe(true);
    expect(on('selected', staff)).toBe(true);
    expect(on('selected', visitor, [{ hash: 'abc' }])).toBe(false);
  });

  it('hashes emails without case or space differences', async () => {
    expect(await hashEmail(' A@B.com ')).toBe(await hashEmail('a@b.com'));
    expect(await hashEmail('a@b.com')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('masks emails for display', () => {
    expect(maskEmail('principal@school.in')).toBe('pr*******@school.in');
  });
});

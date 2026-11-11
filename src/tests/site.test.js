import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { INDUSTRIES, industryName } from '../data/industries.js';
import { CONTENT } from '../data/content.js';
import { newId } from '../services/ids.js';
const sitemap = readFileSync('public/sitemap.xml', 'utf8');
const robots = readFileSync('public/robots.txt', 'utf8');

describe('industries', () => {
  it('has 15 industries with unique slugs', () => {
    expect(INDUSTRIES).toHaveLength(15);
    expect(new Set(INDUSTRIES.map(i => i.slug)).size).toBe(15);
  });
  it('finds an industry name from its slug', () => {
    expect(industryName('schools')).toBe('Schools & Education');
  });
});

describe('info pages', () => {
  it('every page has a title and an intro', () => {
    for (const [key, page] of Object.entries(CONTENT)) {
      expect(page.title, key).toBeTruthy();
      expect(page.intro, key).toBeTruthy();
    }
  });
});

describe('sitemap.xml', () => {
  it('lists every industry page', () => {
    for (const i of INDUSTRIES) expect(sitemap).toContain(`/industries/${i.slug}<`);
  });
  it('lists every info page', () => {
    for (const key of Object.keys(CONTENT)) expect(sitemap).toContain(`/${key}<`);
  });
  it('does not list admin pages', () => {
    expect(sitemap).not.toContain('/admin');
  });
});

describe('robots.txt', () => {
  it('blocks the admin pages', () => {
    expect(robots).toContain('Disallow: /admin/');
  });
});

describe('ids', () => {
  it('newId gives a different id each time', () => {
    expect(newId()).not.toBe(newId());
  });
});
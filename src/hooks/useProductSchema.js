import { useEffect } from 'react';
import { industryName } from '../data/industries.js';

// Adds Product structured data (JSON-LD) for Google. Sample products are skipped,
// and price is not included because pricing is not confirmed.
export default function useProductSchema(p) {
  useEffect(() => {
    if (!p || p.sample) return;
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: p.description,
      sku: p.sku,
      category: industryName(p.industry),
      material: p.fabric,
      color: p.colours,
      brand: { '@type': 'Brand', name: 'Prasanna Reddy Garments' },
    };
    Object.keys(data).forEach(k => { if (!data[k]) delete data[k]; });
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.id = 'product-jsonld';
    s.text = JSON.stringify(data);
    document.head.appendChild(s);
    return () => s.remove();
  }, [p]);
}
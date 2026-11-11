import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Change this one line when the company gives the final domain.
const SITE_URL = 'https://www.example.com';

// Sets the browser tab title, meta description and canonical URL for each page (basic SEO).
export default function usePageMeta(title, desc) {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = `${title} | Prasanna Reddy Garments`;
    const m = document.querySelector('meta[name=description]');
    if (m && desc) m.content = desc;

    let link = document.querySelector('link[rel=canonical]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = SITE_URL + (pathname === '/' ? '/' : pathname.replace(/\/$/, ''));
  }, [title, desc, pathname]);
}
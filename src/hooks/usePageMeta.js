import { useEffect } from 'react';
// Sets the browser tab title and meta description for each page (basic SEO).
export default function usePageMeta(title, desc) {
  useEffect(() => {
    document.title = `${title} | Prasanna Reddy Garments`;
    const m = document.querySelector('meta[name=description]');
    if (m && desc) m.content = desc;
  }, [title, desc]);
}

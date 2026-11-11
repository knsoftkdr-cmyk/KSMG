# KSMG Global - Prasanna Reddy Garments website

React 18 + Vite, multi-page (React Router, clean URLs). No backend yet: data (products, photos,
quote requests) is stored in the visitor's browser using IndexedDB.

## Folder structure
- `src/pages` one file per page | `src/components` reusable parts (Navbar, Footer, Photo, HomeSections, Settings)
- `src/services` storage code (`db.js`) | `src/data` static content (industries, company details, info pages)
- `src/hooks` page title, description, canonical URL and product structured data
- `src/styles` CSS | `public` static files (robots.txt, sitemap.xml, _redirects)

## Run it on your computer
1. Install Node.js (LTS) from https://nodejs.org
2. Open a terminal in the project folder
3. `npm install`
4. `npm run dev` then open http://localhost:5173

## What works
- Home, 15 industry pages with mega-menu, product catalogue (search, filter, add/edit/delete, multiple photos)
- Request a Quote as RFQ (IDs like RFQ-2026-0001, status), Quote requests page
- Custom Design Studio (9 garments, logo upload, conceptual preview only)
- Info pages (Manufacturing, Fabrics, Quality, Export, Tenders, Blog, FAQ, legal drafts), About, Contact
- Light/dark theme, mobile menu, skip-to-content link
- SEO: unique page titles, canonical URLs, robots.txt, sitemap.xml, product structured data (JSON-LD)

## Before going live (to do)
- Replace `https://www.example.com` with the real domain in `src/hooks/usePageMeta.js`,
  `public/robots.txt` and `public/sitemap.xml`
- Host setting: all paths must serve `index.html` (single-page app). `public/_redirects` is for Netlify;
  Vercel needs a `vercel.json` rewrite
- Fill real company details in `src/data/company.js` and `src/data/content.js`
- Privacy and Terms are drafts and need legal review

## Build
`npm run build` creates the `dist` folder. `npm run preview` serves it locally.

## Known limitations
- Data lives only in each visitor's own browser. Other visitors and devices do not see products or
  quote requests, so quote requests do not reach any sales team yet.
- No login or roles. Add product and Quote requests pages are open to everyone.
- Design Studio is conceptual only (simple shapes, not manufacturing patterns). Designs are not saved.
- Product structured data only works for real data once products are stored on a server.
- Automated accessibility checks (Lighthouse) pass on the main pages; manual and screen reader testing
  is not done. No automated tests yet.

## Next steps
1. Shared backend (Supabase): database, login, roles, photo storage
2. RFQ workflow for the sales team, institution accounts and portals
3. Remaining phases from the master document (operations, export, tenders, analytics)
# KSMG Global - Prasanna Reddy Garments website (Phase 1)

React + Vite, multi-page (React Router), no backend. Data (products, photos, quote requests)
is stored in the visitor's browser using IndexedDB.

## Folder structure
- `src/pages` one file per page | `src/components` reusable parts (Navbar, Footer, Photo)
- `src/services` storage/API code (`db.js`) | `src/data` static config (industries, company details)
- `src/styles` CSS | `public` logo and static images | `App.jsx` routes only

## Run it on your computer
1. Install Node.js (LTS) from https://nodejs.org
2. Unzip this folder, open a terminal inside it
3. `npm install`
4. `npm run dev` then open the link shown (usually http://localhost:5173)

## What works
- Pages: Home, Industries (15), Products (search + industry filter), Product detail, Add product (photo upload), Request a quote, Quote requests list, About, Contact
- New products and their photos are saved and still there after refresh
- Quote requests are saved and shown at "Enquiries"

## Put it live
`npm run build` creates a `dist` folder. Upload `dist` to Netlify, Vercel, GitHub Pages or any static host.
(Links use `#/` so no server settings are needed.)

## IMPORTANT limitation
Because there is no backend, data lives only in each visitor's own browser. The person who
adds a product sees it; other visitors and other devices do NOT. Quote requests also stay in the
browser that sent them. This is fine for the basic first version, but the next step is a shared backend
(for example Supabase or Node + PostgreSQL). All storage code is in `src/services/db.js`, so only that file
needs to change. Add-product and Enquiries pages also have no login yet.

## Next steps (suggested)
1. Replace sample text on About/Contact and the Sample products with real company data
2. Add a real logo and photos
3. Shared database + admin login
4. Product CMS, institution accounts, RFQ workflow (Phase 2)

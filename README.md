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
4. Create a `.env` file in the project folder (without it the site shows a blank white page):
   ```
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon public key>
   ```
   Both values are in Supabase Dashboard → Project Settings → API.
5. `npm run dev` then open http://localhost:5173

## Customer emails
Every sales/admin step sends a professional email to the customer: request received, quotation sent,
sample sent, invoice ready, dispatched, and every manual status change (except New). Emails are sent by
the Supabase Edge Function `supabase/functions/send-email` through [Resend](https://resend.com); the
templates are in `supabase/functions/_shared/emailTemplates.js`. Each attempt is saved in the
`email_log` table and shown to sales under **Manage request → Emails to customer**.

One-time setup (needs the Supabase CLI; on Windows run it with `npx supabase ...`, since a global
`npm i -g supabase` install is not supported. Run `npx supabase login`, then
`npx supabase link --project-ref <project-ref>`):
1. In the Supabase SQL editor run `supabase/migrations/20261127000000_email_log.sql` (log table), then
   `supabase/migrations/20261127000100_email_function_grants.sql` (lets the function read the order tables).
2. Choose how mail is sent and set the secrets (never put these in `.env`; `VITE_` values are visible in the browser).
   - **Own mailbox over SMTP (Hostinger Email, no Resend):** create a mailbox such as orders@ksmgtextiles.com in
     Hostinger, then:
     ```
     npx supabase secrets set SMTP_HOST=smtp.hostinger.com SMTP_PORT=465 SMTP_USER=orders@ksmgtextiles.com SMTP_PASS="<mailbox password>"
     npx supabase secrets set EMAIL_FROM="KSMG Global <orders@ksmgtextiles.com>" SITE_URL=https://www.ksmgtextiles.com
     ```
     Port must be 465; Supabase Edge Functions block 25 and 587.
   - **Resend:** verify the domain in Resend (adds DNS records), create an API key, then
     `npx supabase secrets set RESEND_API_KEY=re_xxx EMAIL_FROM="KSMG Global <orders@ksmgtextiles.com>" SITE_URL=https://www.ksmgtextiles.com`
   - Optional for both: `npx supabase secrets set EMAIL_REPLY_TO=info@ksmgtextiles.com EMAIL_BCC=info@ksmgtextiles.com`
3. Deploy: `npx supabase functions deploy send-email` (again after every template change)

Until the secrets are set the app keeps working; emails are logged as "Not sent" with the reason.
For a quick test before the domain is verified, Resend allows `EMAIL_FROM="KSMG <onboarding@resend.dev>"`,
but then it only delivers to the email address of the Resend account owner.

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
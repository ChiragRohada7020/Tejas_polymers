# AgriGrid Industries — Manufacturing Company Website

A fast, SEO-optimized website for an agricultural equipment manufacturer, built with
**Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + MongoDB (Mongoose)**.

## Features

- **Public site**: Home, Product Catalog (with category filter + search), Product Detail pages,
  About, Contact (inquiry form), Become a Distributor (application form)
- **Admin panel** at `/admin`: manage products & categories, view/track inquiries
  (login: password from `ADMIN_PASSWORD` env, default `admin123`)
- **SEO**: per-page metadata & Open Graph tags, JSON-LD structured data
  (Organization, Product, BreadcrumbList), auto `sitemap.xml`, `robots.txt`,
  semantic HTML, fast server-rendered pages
- **UI/UX**: clean corporate design, mobile-first responsive, scroll-reveal animations,
  accessible forms and navigation

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
#    .env.local is pre-filled for local development:
#      MONGODB_URI=mongodb://127.0.0.1:27017/agrigrid
#      ADMIN_PASSWORD=admin123
#    For production, use a MongoDB Atlas URI.

# 3. Seed the database with sample categories & products (requires running MongoDB)
npm run seed

# 4. Start the dev server
npm run dev
```

Open http://localhost:3000 for the site and http://localhost:3000/admin for the admin panel
(default password: `admin123` — change `ADMIN_PASSWORD` in `.env.local`).

> The site degrades gracefully if the database is unreachable, but the catalog and admin
> require MongoDB. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
> locally or point `MONGODB_URI` at a free MongoDB Atlas cluster.

## Production Build

```bash
npm run build
npm start
```

## Changing Company Info

All branding (name, description, contact details) lives in `src/lib/site.ts`.
Colors are defined in `src/app/globals.css` (`--color-brand-*`, `--color-accent-*`).
The favicon set lives in `public/` (`favicon.ico`, `icons/`, `apple-touch-icon.png`) and
is generated from the logo artwork by `npm run brand:favicons`. It is declared
explicitly in `src/lib/seo.ts` (`SITE_ICONS`) rather than via `app/icon.png`, because
Google Search needs a stable, unhashed icon URL. Replace the SVG product images in
`public/images/` with real photos (same filenames) whenever they are available.

## Guides

`/mr/blog` and `/en/blog` hold long-form articles that answer a question a grower
would actually search for — 12 mm or 16 mm, 30 cm or 40 cm spacing, screen or disc
filter — and each one links to the single product it recommends.

The article text is typed in `src/lib/blog.ts`, not stored in the database. Bodies
are structured (sections and FAQs) and referenced by JSON-LD, so a malformed row
would corrupt structured data rather than merely look wrong. Typing them also makes
a missing translation a compile error, exactly like `STRINGS` in `src/lib/strings.ts`.
One rule when adding a guide: **every figure quoted must already exist in the
product's own spec table** — the spec table, hero image and call to action are
pulled from the live product, so a guide cannot drift out of sync with the catalog.

The guides are deliberately **not** in the main navigation; they are reachable from
the footer, from each other, and from `sitemap.xml`. If you ever want them competing
with the catalog for attention, add them to the nav in `src/components/HeaderClient.tsx`.

## Project Structure

```
src/
  app/
    layout.tsx          # Root layout + global SEO defaults
    globals.css         # Tailwind v4 + brand color theme
    not-found.tsx       # 404 page
    sitemap.ts          # Auto-generated sitemap.xml
    robots.ts           # robots.txt (blocks /admin, /api)
    (site)/             # Public pages (share Header/Footer)
      page.tsx          # Home
      products/         # Catalog + [slug] detail page
      blog/             # Guides index + [slug] article (text in lib/blog.ts)
      about/ contact/ become-a-distributor/
    admin/
      login/            # Admin sign-in
      (dashboard)/      # Protected: dashboard, products, categories, inquiries
    api/
      inquiries/        # POST: public form submissions
      admin/            # login, logout, products CRUD, categories, inquiries
  components/           # Header, Footer, ProductCard, forms, Reveal, admin UI
  lib/
    db.ts               # MongoDB connection (cached)
    models/             # Mongoose schemas: Product, Category, Inquiry
    auth.ts             # Admin session (HMAC-signed cookie)
    site.ts             # Brand name, description, contact info
    seed*.ts            # Sample catalog data + seeding helper
scripts/seed.ts         # npm run seed
public/images/          # SVG product & category images (placeholders)
```

## Demo Without Hosting (Cloudflare Tunnel)

Share a live public link without deploying anything:

1. Double-click **`start-demo.ps1`** (or run `powershell -ExecutionPolicy Bypass -File start-demo.ps1`).
2. It starts the server + tunnel and prints a public URL like
   `https://random-words.trycloudflare.com` — send that to anyone.
3. The link is valid while the window stays open and gives a **new URL each run**.
   (`cloudflared` is downloaded to `cloudflared\` automatically if missing.)

> The demo URL expires when you stop the script. For a permanent link, deploy to Vercel.

## Deploying to Vercel

1. Push this folder to a Git repository.
2. Import the repo on [Vercel](https://vercel.com) (framework auto-detected).
3. Add environment variables:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `ADMIN_PASSWORD` — a strong admin password
   - `ADMIN_SESSION_SECRET` — a long random string
   - `NEXT_PUBLIC_SITE_URL` — e.g. `https://www.yourdomain.com`
4. Deploy, then submit `https://yourdomain.com/sitemap.xml` to Google Search Console.

## SEO Checklist for Launch

- [ ] Replace placeholder brand/contact info in `src/lib/site.ts`
- [ ] Replace SVG placeholders with real product photos
- [ ] Add a 1200x630 `og-image.png` in `/public` and reference it in `src/app/layout.tsx`
- [ ] Verify the site in Google Search Console & submit the sitemap
- [ ] Add your real domain to `NEXT_PUBLIC_SITE_URL` before deploying

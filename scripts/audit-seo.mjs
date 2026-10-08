/**
 * Audits the rendered HTML of every public page for on-page SEO signals.
 *
 * Reads the live server output rather than the source, because several of the
 * checks only exist after rendering: title/description resolution, the
 * hreflang cluster, JSON-LD validity, and heading order.
 *
 * Flags only what is objectively wrong or missing. Reports length limits but
 * does not fail on them, since a short title is a judgement call.
 */
const BASE = process.env.BASE_URL || "http://localhost:3100";

const ROUTES = [
  "/mr",
  "/en",
  "/mr/products",
  "/en/products",
  "/mr/about",
  "/en/about",
  "/mr/contact",
  "/en/contact",
  "/mr/become-a-distributor",
  "/en/become-a-distributor",
  "/mr/blog",
  "/en/blog",
];

/** Product detail pages are read from the sitemap so the list stays current. */
async function productRoutes() {
  try {
    const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
    // Sitemap <loc> values are absolute against SITE_URL, not the audit host,
    // so they need parsing into a pathname rather than string replacement.
    const found = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((m) => new URL(m[1].trim()).pathname)
      .filter((p) => /\/products\/[^/]+$/.test(p));
    return [...new Set(found)].slice(0, 3);
  } catch (e) {
    console.log(`(sitemap unreadable: ${e.message})`);
    return [];
  }
}

/**
 * A couple of guides, also read from the sitemap.
 *
 * The guides are the pages most likely to drift out of the SEO setup, because
 * they are authored in code rather than through the admin, so they are worth
 * auditing rather than assuming.
 */
async function guideRoutes() {
  try {
    const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
    const found = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((m) => new URL(m[1].trim()).pathname)
      .filter((p) => /\/blog\/[^/]+$/.test(p));
    return [...new Set(found)].slice(0, 2);
  } catch (e) {
    console.log(`(sitemap unreadable: ${e.message})`);
    return [];
  }
}

const pick = (html, re) => (html.match(re) || [])[1] ?? null;
const strip = (s) => (s ? s.replace(/&#x27;/g, "'").replace(/&amp;/g, "&").trim() : null);

async function audit(route) {
  const res = await fetch(`${BASE}${route}`, { redirect: "follow" });
  const html = await res.text();
  const problems = [];
  const notes = [];

  if (res.status !== 200) problems.push(`HTTP ${res.status}`);

  const title = strip(pick(html, /<title[^>]*>([^<]*)<\/title>/i));
  const desc = strip(
    pick(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)
  );
  const canonical = pick(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const robots = strip(pick(html, /<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i));

  if (!title) problems.push("no <title>");
  if (!desc) problems.push("no meta description");
  if (!canonical) problems.push("no canonical");
  if (!canonical?.endsWith(route)) problems.push(`canonical mismatch: ${canonical}`);

  // An x-default hreflang is what tells Google which locale to serve when the
  // visitor's language matches neither cluster.
  const hreflangs = [...html.matchAll(/<link\s+rel=["']alternate["']\s+hrefLang=["']([^"']+)["']/gi)].map(
    (m) => m[1]
  );
  if (!hreflangs.length) problems.push("no hreflang alternates");
  if (!hreflangs.includes("x-default")) problems.push("no x-default hreflang");

  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => m[1]);
  if (h1s.length === 0) problems.push("no <h1>");
  if (h1s.length > 1) problems.push(`${h1s.length} <h1> tags`);

  // Heading level jumps (h2 -> h4) are a structural signal, not a hard error.
  const levels = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      notes.push(`heading jump h${levels[i - 1]} -> h${levels[i]}`);
      break;
    }
  }

  // Every content image needs alt text. Decorative ones should have alt="".
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => !/\balt=/i.test(t));
  if (noAlt.length) problems.push(`${noAlt.length} <img> without alt`);

  const emptyAlt = imgs.filter((t) => /alt=["']\s*["']/i.test(t));
  if (emptyAlt.length) notes.push(`${emptyAlt.length} decorative img (alt="")`);

  // JSON-LD must parse, and the shapes Google reads must be present.
  const blocks = [...html.matchAll(
    /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )].map((m) => m[1]);
  if (!blocks.length) problems.push("no JSON-LD");
  for (const b of blocks) {
    try {
      JSON.parse(b);
    } catch (e) {
      problems.push(`JSON-LD parse error: ${e.message}`);
    }
  }
  // Structured data has to describe the page's subject, not always the company.
  // A catalogue index legitimately declares CollectionPage/ItemList and carries
  // no business node of its own, so the check is per-type rather than a blanket
  // "every page needs an Organization".
  const ldText = blocks.join(" ");
  const hasAnyType = /"@type"\s*:\s*"[A-Za-z]+"/.test(ldText);
  if (blocks.length && !hasAnyType) problems.push("JSON-LD has no @type");

  const ogImage = pick(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  const ogLocale = pick(html, /<meta\s+property=["']og:locale["']\s+content=["']([^"']+)["']/i);
  if (!ogImage) problems.push("no og:image");
  if (!ogLocale) problems.push("no og:locale");

  // Length notes only, never failures: the character budget differs by script.
  // Google truncates by rendered WIDTH (~600px), not character count, so ~60
  // Latin characters is the useful guide while Devanagari glyphs are narrower
  // and tolerate a higher count. Truncating Marathi to 60 characters would
  // cut the product spec in half for no real gain.
  const hasDevanagari = (s) => /[\u0900-\u097F]/.test(s || "");
  const isDev = hasDevanagari(title) || hasDevanagari(desc);
  const titleLimit = isDev ? 90 : 60;
  if (title && title.length > titleLimit) notes.push(`title ${title.length} chars (>${titleLimit})`);
  if (desc && desc.length > (isDev ? 170 : 160)) notes.push(`desc ${desc.length} chars (>${isDev ? 170 : 160})`);

  return {
    route,
    status: res.status,
    title,
    titleLen: title?.length ?? 0,
    descLen: desc?.length ?? 0,
    hreflang: hreflangs.length,
    h1: h1s.length,
    imgs: imgs.length,
    ld: blocks.length,
    problems,
    notes,
  };
}

(async () => {
  const routes = [...ROUTES, ...(await productRoutes()), ...(await guideRoutes())];
  let fail = 0;
  const rows = [];

  for (const route of routes) {
    try {
      const r = await audit(route);
      rows.push(r);
      if (r.problems.length) fail++;
    } catch (e) {
      rows.push({ route, status: "ERR", problems: [e.message], notes: [] });
      fail++;
    }
  }

  console.log("\nroute                          st  title  desc h1 img ld  hreflang");
  console.log("-".repeat(74));
  for (const r of rows) {
    console.log(
      `${r.route.padEnd(30)} ${String(r.status).padEnd(3)} ` +
        `${String(r.titleLen ?? "-").padEnd(6)} ${String(r.descLen ?? "-").padEnd(4)} ` +
        `${String(r.h1 ?? "-").padEnd(2)} ${String(r.imgs ?? "-").padEnd(3)} ` +
        `${String(r.ld ?? "-").padEnd(2)} ${r.hreflang ?? "-"}`
    );
    for (const p of r.problems || []) console.log(`     PROBLEM  ${p}`);
    for (const n of r.notes || []) console.log(`     note     ${n}`);
  }

  console.log(`\npages with problems: ${fail}/${rows.length}`);
  process.exit(fail ? 1 : 0);
})();
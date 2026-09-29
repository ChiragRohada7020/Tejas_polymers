import { connectDB } from "@/lib/db";
import { BRAND_NAME, CONTACT, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export type ContentKind = "text" | "rich" | "image" | "link";

export type ContentDef = {
  key: string;
  kind: ContentKind;
  maxLength: number;
  defaultValue: string;
};

const T = (key: string, defaultValue: string, maxLength = 300): ContentDef => ({
  key,
  kind: "text",
  maxLength,
  defaultValue,
});

const R = (key: string, defaultValue: string, maxLength = 2000): ContentDef => ({
  key,
  kind: "rich",
  maxLength,
  defaultValue,
});

const I = (key: string, defaultValue = "", maxLength = 500): ContentDef => ({
  key,
  kind: "image",
  maxLength,
  defaultValue,
});

const L = (key: string, defaultValue: string, maxLength = 500): ContentDef => ({
  key,
  kind: "link",
  maxLength,
  defaultValue,
});

export const CONTENT_DEFS: ContentDef[] = [
  I("brand.logoImage", ""),
  T("brand.logoAlt", `${BRAND_NAME} logo`, 160),
  T("brand.wordmarkStart", "Krushee", 40),
  T("brand.wordmarkEnd", "bindoo", 40),
  T("header.nav.home.label", "Home", 40),
  L("header.nav.home.href", "/"),
  T("header.nav.products.label", "Products", 40),
  L("header.nav.products.href", "/products"),
  T("header.nav.about.label", "About Us", 60),
  L("header.nav.about.href", "/about"),
  T("header.nav.distributor.label", "Become a Distributor", 60),
  L("header.nav.distributor.href", "/become-a-distributor"),
  T("header.nav.contact.label", "Contact", 40),
  L("header.nav.contact.href", "/contact"),
  T("header.cta.label", "Get a Quote", 60),
  L("header.cta.href", "/contact"),
  T("home.heroBadge", "Krusheebindoo - IS 13488 certified - Manufactured in Jalgaon, Maharashtra", 160),
  T("home.heroTitleMain", "Every Drop, Straight to", 160),
  T("home.heroTitleAccent", "The Root Zone", 80),
  R(
    "home.heroBody",
    "Krusheebindoo by Tejas Polymers manufactures the full range of inline and online drip irrigation products: flat inline laterals to IS 13488, on-line emitters, filters and fittings. Up to 60% less water, delivered exactly where the plant needs it."
  ),
  T("home.primaryCtaLabel", "Browse Products", 80),
  L("home.primaryCtaHref", "/products"),
  T("home.secondaryCtaLabel", "Become a Distributor", 80),
  L("home.secondaryCtaHref", "/become-a-distributor"),
  T("home.stats.0.value", "60%", 20),
  T("home.stats.0.label", "Up to Water Saved", 80),
  T("home.stats.1.value", "IS 13488", 20),
  T("home.stats.1.label", "Certified Standard", 80),
  T("home.stats.2.value", "5000m", 20),
  T("home.stats.2.label", "Roll Length", 80),
  T("home.stats.3.value", "4 LPH", 20),
  T("home.stats.3.label", "Uniform Discharge", 80),
  T("home.categoriesEyebrow", "Product Range", 80),
  T("home.categoriesTitle", "Everything a Drip System Needs", 120),
  R(
    "home.categoriesBody",
    "Four specialist ranges manufactured in-house: laterals, emitters, filters and the fittings that hold a system together."
  ),
  T("home.featuredEyebrow", "Featured Products", 80),
  T("home.featuredTitle", "Our Best Sellers", 120),
  R(
    "home.featuredBody",
    "The rolls and emitters our dealers reorder most, proven across grape, pomegranate, banana, sugarcane and cotton country."
  ),
  T("home.featuredEyebrow", "Featured Products", 80),
  T("home.featuredTitle", "Our Best Sellers", 120),
  R(
    "home.featuredBody",
    "Our most reordered equipment - proven in the field and stocked by dealers across the region."
  ),
  T("home.whyTitle", "Why Growers Choose Krusheebindoo", 140),
  T("home.why.0.title", "Up to 60% Less Water", 100),
  R("home.why.0.text", "Water goes to the root zone, not across the row. Less water drawn, less power spent pumping it, and nothing lost to evaporation between plants."),
  T("home.why.1.title", "IS 13488 Certified", 100),
  R("home.why.1.text", "Every lateral is made to IS 13488:2008 in Class 2 LDPE with UV stabilisation, so discharge stays true at 4 LPH season after season."),
  T("home.why.2.title", "Uniform Wetting", 100),
  R("home.why.2.text", "Factory-fixed emitters at 30, 40 or 60 cm give every plant the same measured dose. No wet patches and no dry corners along the row."),
  T("home.why.3.title", "Built for Indian Farms", 100),
  R("home.why.3.text", "Made for the soils, water quality and long sunny seasons of Maharashtra, and for the budgets of the farmers who work them."),
  R(
    "home.testimonialQuote",
    "Krusheebindoo changed how we irrigate. Water use came down, the yield is more even across the block, and a 5000 m roll goes a long way for the price."
  ),
  T("home.testimonialAttribution", "Grower, Jalgaon region", 160),
  T("home.ctaTitle", "Cut Your Water Bill This Season", 140),
  R(
    "home.ctaBody",
    "Tell us your crop, area and plant spacing, and we will recommend the right lateral, emitter spacing and filter, with distributor pricing for dealers."
  ),
  T("home.ctaButton", "Request a Recommendation", 80),
  R(
    "footer.aboutBlurb",
    "Krusheebindoo by Tejas Polymers manufactures inline and online drip irrigation products to IS 13488, from our works in Goradakheda, Pachora, Jalgaon."
  ),
  T("footer.contact.email", CONTACT.email, 160),
  T("footer.contact.phone", CONTACT.phone, 80),
  T("footer.contact.address", CONTACT.address, 300),
  T("contact.heroTitle", "Get in Touch", 120),
  R(
    "contact.heroBody",
    "Questions on product specs, bulk pricing or distributorship? Call us on 80803 37813 or send a message and we will reply within 1-2 business days."
  ),
  T("contact.infoTitle", "Contact Information", 120),
  T("contact.hours", "Mon - Sat, 9:00 AM - 6:00 PM IST", 120),
  T("contact.distributorTitle", "Looking to become a distributor?", 140),
  R("contact.distributorBody", "Use our dedicated application form for faster processing."),
  T("contact.distributorCta", "Become a Distributor", 80),
  T("contact.formTitle", "Send us a message", 120),
  R("contact.formBody", "Fill in the form with your crop, area and requirement, and our team will come back with pricing and availability."),

  // About Page
  T("about.heroTitle", "Manufacturers of Drip. Steward of Every Drop.", 140),
  R(
    "about.heroBody",
    "Krusheebindoo is the drip irrigation brand of Tejas Polymers — a manufacturer of the full range of inline and online drip products at Goradakheda, Pachora, in Jalgaon district, Maharashtra."
  ),
  T("about.storyTitle", "Our Story", 120),
  R(
    "about.storyBody",
    "<p>Tejas Polymers manufactures the Krusheebindoo range of inline and online drip irrigation products from our works at Survey No. 152/3, behind Sugaran Dairy, Goradakheda, Pachora. We produce flat inline drip laterals to IS 13488, on-line drippers and pressure-compensating emitters, screen and disc filters, and the fittings that complete a system.</p><p class=\"mt-4\">Maharashtra farms know the problem well: water is not always there when the crop needs it, and what is pumped is not always used by the plant. Our answer is simple engineering — a measured 4 litres per hour, delivered at the root zone, repeated evenly along the row. Done properly, that is where the water savings come from, and the savings show up in the power bill as much as in the yield.</p><p class=\"mt-4\">Every roll leaves our line checked and marked to standard, because a blocked emitter is the difference between a system that pays for itself and one that disappoints the farmer who bought it.</p>"
  ),
  T("about.stats.0.value", "IS 13488", 30),
  T("about.stats.0.label", "Certified standard", 60),
  T("about.stats.1.value", "60%", 30),
  T("about.stats.1.label", "Up to water saved", 60),
  T("about.stats.2.value", "5000m", 30),
  T("about.stats.2.label", "Roll length", 60),
  T("about.stats.3.value", "4 LPH", 30),
  T("about.stats.3.label", "Emitter discharge", 60),
  T("about.valuesTitle", "What We Stand For", 120),
  T("about.values.0.title", "Field-First Engineering", 100),
  R("about.values.0.text", "Our sizing follows what growers actually plant — grape and pomegranate at 30 cm, sugarcane and cotton at 40 to 60 cm. A spec that suits the crop beats a spec that is simply bigger."),
  T("about.values.1.title", "Built to IS 13488", 100),
  R("about.values.1.text", "Class 2 UV-stabilised LDPE, tested discharge and a controlled wall thickness, so a roll bought this season still delivers 4 LPH three seasons from now."),
  T("about.values.2.title", "Whole-System Supply", 100),
  R("about.values.2.text", "Laterals, emitters, filters and fittings from one manufacturer, so every part in the block shares one pressure regime and one point of accountability."),
  T("about.factoryCtaTitle", "Want to visit our works?", 120),
  R(
    "about.factoryCtaBody",
    "Dealer and distributor visits are welcome. Contact us to arrange a visit to our Goradakheda works and see the production line and finished rolls in person."
  ),
  T("about.factoryCtaButton", "Contact Us", 60),
  L("about.factoryCtaHref", "/contact"),

  // Become a Distributor Page
  T("distributor.heroTitle", "Carry Krusheebindoo in Your District", 140),
  R(
    "distributor.heroBody",
    "Drip is the fastest-growing segment in Indian agriculture, and growers are actively looking for a reliable local supplier. Stock Krusheebindoo at factory-direct pricing, with territory protection and full after-sales support. Free to apply, and we decide within 48 hours."
  ),
  T("distributor.benefits.0.title", "Factory-Direct Pricing", 100),
  R("distributor.benefits.0.text", "Buy at manufacturer rates straight from our works in Pachora, with margins designed for healthy resale profit."),
  T("distributor.benefits.1.title", "Territory Protection", 100),
  R("distributor.benefits.1.text", "Exclusive distribution rights for your region once approved, so you are not competing with another dealer down the road."),
  T("distributor.benefits.2.title", "A Product Line That Sells", 100),
  R("distributor.benefits.2.text", "Laterals, emitters, filters and fittings under one brand, so your customers buy a complete system from a single supplier."),
  T("distributor.benefits.3.title", "Marketing Support", 100),
  R("distributor.benefits.3.text", "Product photos, demo material, banners and sales training to help you explain the specs to growers."),
  T("distributor.lookingTitle", "Who We're Looking For", 120),
  R(
    "distributor.lookingList",
    "<ul class=\"space-y-4\"><li class=\"flex gap-3\"><span class=\"text-brand-600 font-bold\"></span> Existing agri-input, hardware or equipment business</li><li class=\"flex gap-3\"><span class=\"text-brand-600 font-bold\"></span> Warehouse or showroom space for stock</li><li class=\"flex gap-3\"><span class=\"text-brand-600 font-bold\"></span> Technical staff for assembly &amp; basic service</li><li class=\"flex gap-3\"><span class=\"text-brand-600 font-bold\"></span> Motivation to build long-term market presence</li></ul>"
  ),
  T("distributor.processTitle", "How it works", 120),
  R(
    "distributor.processList",
    "<ol class=\"space-y-3\"><li class=\"flex gap-2\"><span class=\"font-semibold text-brand-700\">1.</span> <span>Submit the application form</span></li><li class=\"flex gap-2\"><span class=\"font-semibold text-brand-700\">2.</span> <span>Our team reviews &amp; calls you within 48 hours</span></li><li class=\"flex gap-2\"><span class=\"font-semibold text-brand-700\">3.</span> <span>Receive price list, catalog &amp; territory terms</span></li><li class=\"flex gap-2\"><span class=\"font-semibold text-brand-700\">4.</span> <span>Place trial order &amp; start selling</span></li></ol>"
  ),
  T("distributor.formTitle", "Distributor Application", 120),
  R("distributor.formSubtitle", "Tell us about your business  no commitment, no fees."),

  // Products Catalog Page
  T("products.heroTitle", "Drip Irrigation Products", 140),
  R(
    "products.heroBody",
    "The full Krusheebindoo range: IS 13488 flat inline drip laterals in 12 mm and 16 mm, on-line drippers and pressure-compensating emitters, screen and disc filters, and the fittings that complete the layout. Bulk pricing available for dealers."
  ),
  T("products.ctaTitle", "Not sure which size fits your crop?", 140),
  R("products.ctaBody", "Tell us your crop, area and plant spacing. We will recommend the lateral diameter, emitter spacing and filter type, and quote the full system."),
  T("products.ctaButton", "Request Distributor Pricing", 80),
  L("products.ctaHref", "/become-a-distributor"),
];


import { SiteContent } from "@/lib/models/SiteContent";

export const CONTENT_DEF_MAP: Record<string, ContentDef> = Object.fromEntries(
  CONTENT_DEFS.map((d) => [d.key, d])
);

export type ContentMap = Record<string, string>;

/**
 * In-process cache for the site content.
 *
 * Content only changes when an admin saves, yet every page render used
 * to run a fresh MongoDB query. Caching it removes that round trip from
 * the hot path, which is the biggest single win on page load.
 *
 * The cache is short-lived AND explicitly invalidated by the save
 * endpoint, so an admin never sees their own edit go stale.
 */
const CACHE_TTL_MS = 60_000;

type ContentCache = { map: ContentMap; expiresAt: number };
const globalCache = globalThis as unknown as { siteContentCache?: ContentCache };

/** Drop the cache. Call after anything writes site content. */
export function invalidateSiteContentCache(): void {
  globalCache.siteContentCache = undefined;
}

export function content(map: ContentMap | undefined, key: string): string {
  if (!map) return CONTENT_DEF_MAP[key]?.defaultValue ?? "";
  return map[key] ?? CONTENT_DEF_MAP[key]?.defaultValue ?? "";
}

export async function getSiteContentMap(): Promise<ContentMap> {
  const cached = globalCache.siteContentCache;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.map;
  }

  await connectDB();
  const docs = await SiteContent.find().select("key value").lean();
  const map: ContentMap = {};
  for (const doc of docs) {
    map[(doc as unknown as { key: string }).key] = (doc as unknown as { value: string }).value;
  }

  globalCache.siteContentCache = { map, expiresAt: Date.now() + CACHE_TTL_MS };
  return map;
}

export function sanitizeText(raw: unknown, maxLength: number): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return cleaned.slice(0, maxLength);
}

export function sanitizeRich(raw: unknown, maxLength: number): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tag, attrs) => {
      const lower = tag.toLowerCase();
      if (!["b", "strong", "i", "em", "a", "ul", "ol", "li", "p", "br"].includes(lower)) {
        return "";
      }
      if (lower === "a") {
        const hrefMatch = attrs.match(/href=(["'])(.*?)\1/i);
        const href = hrefMatch ? hrefMatch[2] : "";
        if (
          href.startsWith("/") ||
          href.startsWith("https://") ||
          href.startsWith("http://") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:")
        ) {
          return `<a href="${href.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer">`;
        }
        return "<a>";
      }
      return `<${lower}>`;
    });
  return cleaned.trim().slice(0, maxLength);
}

export function sanitizeLink(raw: unknown, maxLength: number): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (
    !trimmed.startsWith("/") &&
    !trimmed.startsWith("https://") &&
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("mailto:") &&
    !trimmed.startsWith("tel:")
  ) {
    return null;
  }
  return trimmed.slice(0, maxLength);
}

export function sanitizeImagePath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed === "") return "";
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }
  return null;
}


import { connectDB } from "@/lib/db";
import { CONTACT, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

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
  T("brand.logoAlt", `${SITE_NAME} logo`, 160),
  T("brand.wordmarkStart", "Tejas", 40),
  T("brand.wordmarkEnd", "Polymers", 40),
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
  T("home.heroBadge", "Trusted irrigation equipment supplier · Maharashtra", 160),
  T("home.heroTitleMain", "Irrigation Equipment Built for", 160),
  T("home.heroTitleAccent", "Real Farms", 80),
  R(
    "home.heroBody",
    "From drip kits to sprayers, tillers and pumps - we supply dependable irrigation equipment and farm machinery to farmers and dealers at fair, direct prices."
  ),
  T("home.primaryCtaLabel", "Browse Products", 80),
  L("home.primaryCtaHref", "/products"),
  T("home.secondaryCtaLabel", "Become a Distributor", 80),
  L("home.secondaryCtaHref", "/become-a-distributor"),
  T("home.stats.0.value", "6+", 20),
  T("home.stats.0.label", "Product Categories", 80),
  T("home.stats.1.value", "120+", 20),
  T("home.stats.1.label", "Products in Stock", 80),
  T("home.stats.2.value", "50+", 20),
  T("home.stats.2.label", "Dealers & Distributors", 80),
  T("home.stats.3.value", "20+", 20),
  T("home.stats.3.label", "Districts Served", 80),
  T("home.categoriesEyebrow", "Product Categories", 80),
  T("home.categoriesTitle", "Equipment for Every Job", 120),
  R(
    "home.categoriesBody",
    "Six specialised lines covering spraying, tilling, harvesting, irrigation, hand tools and spare parts."
  ),
  T("home.featuredEyebrow", "Featured Products", 80),
  T("home.featuredTitle", "Our Best Sellers", 120),
  R(
    "home.featuredBody",
    "Our most reordered equipment - proven in the field and stocked by dealers across the region."
  ),
  T("home.whyTitle", "Why Distributors Choose Tejas Polymers", 140),
  T("home.why.0.title", "Direct-from-Source Pricing", 100),
  R("home.why.0.text", "No middlemen â€” you buy straight from us with margins designed for healthy resale profit."),
  T("home.why.1.title", "Quality Assured", 100),
  R("home.why.1.text", "Every irrigation unit and spare is checked before it leaves our workshop in Pachora."),
  T("home.why.2.title", "Spare Parts Support", 100),
  R("home.why.2.text", "Fast supply of replacement parts so your customers' equipment keeps running."),
  T("home.why.3.title", "Pan-Maharashtra Reach", 100),
  R("home.why.3.text", "Based in Jalgaon Road, Pachora â€” we understand the farms and soil conditions of this region."),
  R(
    "home.testimonialQuote",
    "â€œTejas Polymers has supplied our irrigation needs for the last few seasons. Parts are always available and the quality is consistent on every order. Our sales have grown steadily since we started dealing with them.â€"
  ),
  T("home.testimonialAttribution", "â€” Distributor, Jalgaon region", 160),
  T("home.ctaTitle", "Ready to grow with Tejas Polymers?", 140),
  R(
    "home.ctaBody",
    "Ask for the full product catalog, distributor pricing and territory details. We reply within 1-2 business days."
  ),
  T("home.ctaButton", "Apply Now â€” Itâ€™s Free", 80),
  R(
    "footer.aboutBlurb",
    "Manufacturer of reliable irrigation equipment and agricultural machinery. Serving farmers and distributors across Maharashtra and beyond."
  ),
  T("footer.contact.email", CONTACT.email, 160),
  T("footer.contact.phone", CONTACT.phone, 80),
  T("footer.contact.address", CONTACT.address, 300),
  T("contact.heroTitle", "Get in Touch", 120),
  R(
    "contact.heroBody",
    "Questions about products, pricing or distributorship? Our team replies within 1-2 business days."
  ),
  T("contact.infoTitle", "Contact Information", 120),
  T("contact.hours", "Mon - Sat, 9:00 AM - 6:00 PM IST", 120),
  T("contact.distributorTitle", "Looking to become a distributor?", 140),
  R("contact.distributorBody", "Use our dedicated application form for faster processing."),
  T("contact.distributorCta", "Become a Distributor", 80),
  T("contact.formTitle", "Send us a message", 120),
  R("contact.formBody", "Fill the form and our sales team will get back to you with pricing and availability."),

  // About Page
  T("about.heroTitle", "Built for Indian Farms. Backed by Service.", 140),
  R(
    "about.heroBody",
    "Tejas Polymers supplies irrigation equipment and farm machinery from Pachora, Maharashtra - helping farmers grow more with less water and less effort."
  ),
  T("about.storyTitle", "Our Story", 120),
  R(
    "about.storyBody",
    "<p>Tejas Polymers is an irrigation equipment supplier based at Survey No. 152/2, Jalgaon Road, Goradakheda, Pachora. We supply drip and irrigation systems, sprayers, pumps and the spare parts that keep them running.</p><p class=\"mt-4\">Our focus is straightforward: dependable equipment at a fair price, and being available when a farmer or distributor needs a part urgently. Everything we sell is checked before it leaves our workshop.</p>"
  ),
  T("about.stats.0.value", "6+", 30),
  T("about.stats.0.label", "Product categories", 60),
  T("about.stats.1.value", "120+", 30),
  T("about.stats.1.label", "Products supplied", 60),
  T("about.stats.2.value", "50+", 30),
  T("about.stats.2.label", "Dealer partners", 60),
  T("about.stats.3.value", "20+", 30),
  T("about.stats.3.label", "Districts served", 60),
  T("about.valuesTitle", "What We Stand For", 120),
  T("about.values.0.title", "Field-First Design", 100),
  R("about.values.0.text", "Products are prototyped and tested on real farms before launch. If it doesn't survive a full season, it doesn't ship."),
  T("about.values.1.title", "Partner, Not Vendor", 100),
  R("about.values.1.text", "We grow when our distributors grow. Territory protection, training and marketing support come standard."),
  T("about.values.2.title", "Built to Last", 100),
  R("about.values.2.text", "Repairable designs, available spares and industry-leading warranties keep equipment in fields, not landfills."),
  T("about.factoryCtaTitle", "Want to visit our workshop?", 120),
  R(
    "about.factoryCtaBody",
    "Dealer and distributor visits are welcome. Contact us to arrange a visit to our Jalgaon Road workshop and see the equipment in person."
  ),
  T("about.factoryCtaButton", "Contact Us", 60),
  L("about.factoryCtaHref", "/contact"),

  // Become a Distributor Page
  T("distributor.heroTitle", "Grow Your Business with Tejas Polymers", 140),
  R(
    "distributor.heroBody",
    "Sell in-demand agricultural equipment with factory-direct pricing, protected territory and full after-sales support. Free to apply — decisions within 48 hours."
  ),
  T("distributor.benefits.0.title", "Factory-Direct Pricing", 100),
  R("distributor.benefits.0.text", "Buy at manufacturer rates with margins designed for healthy resale profits."),
  T("distributor.benefits.1.title", "Territory Protection", 100),
  R("distributor.benefits.1.text", "Exclusive distribution rights for your region once approved."),
  T("distributor.benefits.2.title", "Low MOQs to Start", 100),
  R("distributor.benefits.2.text", "Start with a trial order and scale as your sales grow."),
  T("distributor.benefits.3.title", "Marketing Support", 100),
  R("distributor.benefits.3.text", "Product photos, demo videos, banners and sales training included."),
  T("distributor.lookingTitle", "Who We're Looking For", 120),
  R(
    "distributor.lookingList",
    "<ul class=\"space-y-4\"><li class=\"flex gap-3\"><span class=\"text-brand-600 font-bold\">✓</span> Existing agri-input, hardware or equipment business</li><li class=\"flex gap-3\"><span class=\"text-brand-600 font-bold\">✓</span> Warehouse or showroom space for stock</li><li class=\"flex gap-3\"><span class=\"text-brand-600 font-bold\">✓</span> Technical staff for assembly &amp; basic service</li><li class=\"flex gap-3\"><span class=\"text-brand-600 font-bold\">✓</span> Motivation to build long-term market presence</li></ul>"
  ),
  T("distributor.processTitle", "How it works", 120),
  R(
    "distributor.processList",
    "<ol class=\"space-y-3\"><li class=\"flex gap-2\"><span class=\"font-semibold text-brand-700\">1.</span> <span>Submit the application form</span></li><li class=\"flex gap-2\"><span class=\"font-semibold text-brand-700\">2.</span> <span>Our team reviews &amp; calls you within 48 hours</span></li><li class=\"flex gap-2\"><span class=\"font-semibold text-brand-700\">3.</span> <span>Receive price list, catalog &amp; territory terms</span></li><li class=\"flex gap-2\"><span class=\"font-semibold text-brand-700\">4.</span> <span>Place trial order &amp; start selling</span></li></ol>"
  ),
  T("distributor.formTitle", "Distributor Application", 120),
  R("distributor.formSubtitle", "Tell us about your business — no commitment, no fees."),

  // Products Catalog Page
  T("products.heroTitle", "Our Product Catalog", 140),
  R(
    "products.heroBody",
    "Factory-direct agricultural equipment for distributors. All products available for bulk order with export packaging."
  ),
  T("products.ctaTitle", "Need pricing for your territory?", 140),
  R("products.ctaBody", "Get our full distributor price list, MOQ details and shipping terms."),
  T("products.ctaButton", "Request Distributor Pricing", 80),
  L("products.ctaHref", "/become-a-distributor"),
];


import { SiteContent } from "@/lib/models/SiteContent";

export const CONTENT_DEF_MAP: Record<string, ContentDef> = Object.fromEntries(
  CONTENT_DEFS.map((d) => [d.key, d])
);

export type ContentMap = Record<string, string>;

export function content(map: ContentMap | undefined, key: string): string {
  if (!map) return CONTENT_DEF_MAP[key]?.defaultValue ?? "";
  return map[key] ?? CONTENT_DEF_MAP[key]?.defaultValue ?? "";
}

export async function getSiteContentMap(): Promise<ContentMap> {
  await connectDB();
  const docs = await SiteContent.find().select("key value").lean();
  const map: ContentMap = {};
  for (const doc of docs) {
    map[(doc as unknown as { key: string }).key] = (doc as unknown as { value: string }).value;
  }
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


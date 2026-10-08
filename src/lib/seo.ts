import type { Metadata } from "next";
import { AREA_SERVED, BRAND_NAME, CONTACT, SITE_NAME, SITE_URL } from "@/lib/site";
import { LOCALE_META, type Locale } from "@/lib/i18n";

/** Fallback share image, used whenever a page has no photo of its own. */
const DEFAULT_OG_IMAGE = "/images/og/tejas-polymers.jpg";

/**
 * The site's favicon set, declared explicitly instead of relying on the
 * `app/icon.png` file convention.
 *
 * Google Search shows one favicon per hostname next to the site name, and two
 * of its requirements are easy to miss:
 *
 *   - "The favicon URL must be stable (don't change the URL frequently)."
 *     The file convention emits `/icon.png?<build-hash>`, so the URL changed
 *     on every deploy.
 *   - The icon must be a square of at least 8x8px, "preferably larger than
 *     48x48px". The old icon.png was a 96x96 crop of the 240x120 wordmark
 *     lockup, which at the 16-32px Google renders was an unreadable smear of
 *     half a droplet and the letters "krushe".
 *
 * Absolute URLs also mean every route - /mr, /en, the redirect from / and the
 * admin - advertises the identical icon, which is what "one favicon per
 * hostname" asks for. The files are built by `npm run brand:favicons`, and
 * the shared constant exists because the site and the admin are separate root
 * layouts (there is no app/layout.tsx) and must not drift apart.
 */
export const SITE_ICONS: Metadata["icons"] = {
  icon: [
    { url: `${SITE_URL}/favicon.ico`, sizes: "any", type: "image/x-icon" },
    { url: `${SITE_URL}/icons/icon-48.png`, sizes: "48x48", type: "image/png" },
    { url: `${SITE_URL}/icons/icon-96.png`, sizes: "96x96", type: "image/png" },
    { url: `${SITE_URL}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
  ],
  shortcut: `${SITE_URL}/favicon.ico`,
  apple: `${SITE_URL}/apple-touch-icon.png`,
};

/**
 * Builds a complete `openGraph` block.
 *
 * Next.js merges metadata shallowly per top-level key, so a page that declares
 * `openGraph` REPLACES the layout's block rather than merging into it. That
 * silently dropped `images` from the home page, leaving shares of it with no
 * preview at all. Routing every page through this helper keeps the required
 * fields present whatever else a page overrides.
 */
export function buildOpenGraph({
  locale,
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
}: {
  locale: Locale;
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article" | "product";
}) {
  const url = `${SITE_URL}${path}`;
  const img = image ?? DEFAULT_OG_IMAGE;
  return {
    type,
    siteName: SITE_NAME,
    locale: LOCALE_META[locale].ogLocale,
    // Alternate locales, so Facebook/LinkedIn pick the right language.
    alternateLocale: (["mr", "en"] as Locale[])
      .filter((l) => l !== locale)
      .map((l) => LOCALE_META[l].ogLocale),
    url,
    title,
    description,
    images: [{ url: img, width: 1200, height: 630, alt: imageAlt ?? title }],
  };
}

/** Twitter card mirroring the Open Graph block. */
export function buildTwitter({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image?: string;
}) {
  return {
    card: "summary_large_image" as const,
    site: "@tejaspolymers",
    title,
    description,
    images: [image ?? DEFAULT_OG_IMAGE],
  };
}

/**
 * Organization + local-business node, reused on the pages that lack their own
 * structured data. Google reads this for local ranking and for the knowledge
 * panel, so it belongs wherever the business itself is the subject.
 */
export function organizationJsonLd(locale: Locale) {
  const isMr = locale === "mr";
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: BRAND_NAME,
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/images/brand/krusheebindoo-mark.png`,
    image: `${SITE_URL}/images/og/tejas-polymers.jpg`,
    description: isMr
      ? "पाचोरा, महाराष्ट्रातील ठिबक सिंचन उपकरण निर्माता व पुरवठादार."
      : "Drip irrigation equipment manufacturer and supplier based in Pachora, Maharashtra.",
    email: CONTACT.email,
    telephone: CONTACT.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.street,
      addressLocality: CONTACT.locality,
      addressRegion: CONTACT.region,
      postalCode: CONTACT.postalCode,
      addressCountry: CONTACT.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: CONTACT.latitude,
      longitude: CONTACT.longitude,
    },
    areaServed: AREA_SERVED.map((area) => ({ "@type": "City", name: area })),
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: CONTACT.phone,
        email: CONTACT.email,
        contactType: "sales",
        areaServed: "IN",
        availableLanguage: ["mr", "en"],
      },
    ],
  };
}

/** Breadcrumb trail matching the visible breadcrumb component. */
export function breadcrumbJsonLd(
  locale: Locale,
  trail: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** Wraps one or more nodes in the array form Google's parser expects. */
export function jsonLdScript(...nodes: unknown[]): string {
  return JSON.stringify(nodes.length === 1 ? nodes[0] : nodes);
}

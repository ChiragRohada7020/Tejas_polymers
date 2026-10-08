import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "../globals.css";
import { CONTACT, KEYWORDS, KEYWORDS_MR, SITE_DESCRIPTION, SITE_DESCRIPTION_MR, SITE_NAME, SITE_URL } from "@/lib/site";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, isKnownLocale, localeAlternates, type Locale } from "@/lib/i18n";
import { buildOpenGraph, buildTwitter, SITE_ICONS } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  display: "swap",
  variable: "--font-devanagari",
});

/**
 * Only these two locales exist. Combined with `dynamicParams = false` below,
 * any other first path segment (/fr, /xx) 404s instead of rendering an
 * English page under a bogus language - which is the failure mode that
 * quietly creates duplicate-content URLs.
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const dynamicParams = false;

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;
  const meta = LOCALE_META[locale];
  const isMr = locale === "mr";

  const description = isMr ? SITE_DESCRIPTION_MR : SITE_DESCRIPTION;
  const heading = isMr
    ? `${SITE_NAME} — पाचोरा, महाराष्ट्रातील सिंचन उपकरण पुरवठादार`
    : `${SITE_NAME} — Irrigation Equipment Supplier in Pachora, Maharashtra`;
  const ogHeading = isMr
    ? `${SITE_NAME} — पाचोरा, महाराष्ट्रातील ठिबक सिंचन निर्माता`
    : `${SITE_NAME} — Drip Irrigation Manufacturer in Pachora, Maharashtra`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: heading,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    keywords: isMr ? KEYWORDS_MR : KEYWORDS,
    category: "Drip Irrigation Equipment",
    icons: SITE_ICONS,
    // Canonical points at this locale's own home page, and the languages map
    // tells Google the two are translations of each other so it can serve
    // Marathi to Marathi searchers instead of picking one arbitrarily.
    alternates: {
      canonical: `/${locale}`,
      languages: localeAlternates("/", true, SITE_URL),
    },
    openGraph: buildOpenGraph({
      locale,
      title: ogHeading,
      description,
      path: `/${locale}`,
    }),
    twitter: buildTwitter({ title: ogHeading, description }),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    other: {
      "geo.region": "IN-MH",
      "geo.placename": "Pachora",
      "geo.position": `${CONTACT.latitude};${CONTACT.longitude}`,
      ICBM: `${CONTACT.latitude}, ${CONTACT.longitude}`,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;

  return (
    <html lang={LOCALE_META[locale].htmlLang}>
      {/*
        suppressHydrationWarning: browser extensions (e.g. ClickUp, Grammarly,
        password managers) inject attributes/classes into <body> before React
        hydrates, which would otherwise log a harmless hydration-mismatch error.
      */}
      <body className={`${inter.variable} ${notoDevanagari.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
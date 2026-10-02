import type { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Category";
import { Product } from "@/lib/models/Product";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import AnimatedStat from "@/components/AnimatedStat";
import { EditableLink, EditableRichText, EditableText } from "@/components/site/Editable";
import {
  AREA_SERVED,
  CONTACT,
  KEYWORDS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  SITE_DESCRIPTION_MR,
  KEYWORDS_MR,
} from "@/lib/site";
import { getSiteContentMap, translator } from "@/lib/site-content";
import { localizeProduct } from "@/lib/catalog";
import { ui, categoryBody } from "@/lib/strings";
import { categoryName } from "@/lib/models/Category";
import type { IProduct } from "@/lib/models/Product";
import {
  DEFAULT_LOCALE,
  isKnownLocale,
  localeAlternates,
  localePath,
  type Locale,
} from "@/lib/i18n";

export const revalidate = 60;
  // Edit state is resolved client-side (see EditModeContext).
  const editMode = false;

type HomeProps = { params: Promise<{ locale: string }> };

/**
 * Per-locale home page metadata.
 *
 * Title, description and keywords all switch with the locale, and every
 * locale advertises the other through hreflang. Google needs both halves:
 * the translated text to match the query, and the alternates to know the two
 * URLs are the same page rather than competing duplicates.
 */
export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;
  const isMr = locale === "mr";

  const description = isMr ? SITE_DESCRIPTION_MR : SITE_DESCRIPTION;
  const title = isMr
    ? `${SITE_NAME} — पाचोरा, महाराष्ट्रातील ठिबक सिंचन निर्माता`
    : `${SITE_NAME} — Drip Irrigation Manufacturer in Pachora, Maharashtra`;

  return {
    title,
    description,
    keywords: isMr ? KEYWORDS_MR : KEYWORDS,
    alternates: {
      canonical: `/${locale}`,
      languages: localeAlternates("/", true, SITE_URL),
    },
    openGraph: { title, description, url: `/${locale}`, locale: isMr ? "mr_IN" : "en_IN" },
  };
}

const WHY_ICONS = ["💧", "✅", "🎯", "🌾"];

export default async function HomePage({ params }: HomeProps) {
  const { locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;

  await connectDB();
  const [categories, featured, map] = await Promise.all([
    Category.find().lean(),
    Product.find({ featured: true }).sort({ rank: 1, name: 1 }).limit(3).lean(),
    getSiteContentMap(),
  ]);

  const t = translator(map, locale);
  const featuredLocalized = featured.map((p) =>
    localizeProduct(p as unknown as IProduct, locale)
  );
  const stats = [0, 1, 2, 3].map((i) => ({
    value: t(`home.stats.${i}.value`),
    label: t(`home.stats.${i}.label`),
  }));
  const why = [0, 1, 2, 3].map((i) => ({
    title: t(`home.why.${i}.title`),
    text: t(`home.why.${i}.text`),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    alternateName: "Tejas Polymers",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    slogan: SITE_TAGLINE,
    image: `${SITE_URL}/images/og/tejas-polymers.jpg`,
    telephone: CONTACT.phone,
    email: CONTACT.email,
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
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "09:00",
        closes: "13:00",
      },
    ],
    areaServed: AREA_SERVED.map((area) => ({ "@type": "City", name: area })),
    makesOffer: [
      "Flat inline drip lateral 12 mm - 4 LPH - 40 cm",
      "Flat inline drip lateral 16 mm - 4 LPH - 30 cm",
      "Flat inline drip lateral 16 mm - 4 LPH - 40 cm",
      "Flat inline drip lateral 20 mm - 4 LPH - 60 cm",
      "Online dripper 4 LPH",
      "Online dripper 8 LPH",
      "PC pressure-compensating online emitter 8 LPH",
      "Plain drip lateral 16 mm",
      "Inline screen filter 2 inch",
      "Disc filter 2 inch",
      "Take-off connector with valve 16 mm",
      "Drip lateral grommet, end cap, lateral cock",
      "Drip hole punch 16 mm",
    ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Product", name } })),
    knowsAbout: [
      "Drip irrigation",
      "Inline drip laterals",
      "Online drip emitters",
      "Pressure-compensating emitters",
      "Screen and disc filtration",
      "Fertigation",
    ],
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#business` },
    inLanguage: "en-IN",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <Reveal />

      {/* ---- Hero ---- */}
      <section className="wave-bg relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <p className="mb-4 inline-block rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-brand-700 backdrop-blur">
              🌾{" "}
              <EditableText contentKey="home.heroBadge" editMode={editMode} value={t("home.heroBadge")} as="span" />
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-brand-950 sm:text-5xl lg:text-6xl">
              <EditableText contentKey="home.heroTitleMain" editMode={editMode} value={t("home.heroTitleMain")} as="span" />{" "}
              <span className="text-accent-600">
                <EditableText contentKey="home.heroTitleAccent" editMode={editMode} value={t("home.heroTitleAccent")} as="span" />
              </span>
            </h1>
            <EditableRichText
              contentKey="home.heroBody"
              editMode={editMode}
              value={t("home.heroBody")}
              className="mt-6 text-lg leading-relaxed text-slate-700"
            />
            <div className="mt-10 flex flex-wrap gap-4">
              {editMode ? (
                <>
                  <span className="rounded-xl bg-accent-500 px-7 py-3.5 text-sm font-bold text-brand-950 shadow-lg">
                    <EditableLink
                      labelKey="home.primaryCtaLabel"
                      hrefKey="home.primaryCtaHref"
                      editMode
                      label={t("home.primaryCtaLabel")}
                      href={t("home.primaryCtaHref")}
                    />
                  </span>
                  <span className="rounded-xl border border-brand-300 bg-white/70 px-7 py-3.5 text-sm font-bold text-brand-800 backdrop-blur">
                    <EditableLink
                      labelKey="home.secondaryCtaLabel"
                      hrefKey="home.secondaryCtaHref"
                      editMode
                      label={t("home.secondaryCtaLabel")}
                      href={t("home.secondaryCtaHref")}
                    />
                  </span>
                </>
              ) : (
                <>
                  <Link
                    href={localePath(locale, t("home.primaryCtaHref"))}
                    className="rounded-xl bg-accent-500 px-7 py-3.5 text-sm font-bold text-brand-950 shadow-lg transition hover:bg-accent-400"
                  >
                    {t("home.primaryCtaLabel")} →
                  </Link>
                  <Link
                    href={localePath(locale, t("home.secondaryCtaHref"))}
                    className="rounded-xl border border-brand-300 bg-white/70 px-7 py-3.5 text-sm font-bold text-brand-800 backdrop-blur transition hover:bg-white"
                  >
                    {t("home.secondaryCtaLabel")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---- Stats ---- */}
      <section className="border-b border-brand-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 text-center sm:px-6 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="reveal text-center">
              <p className="text-3xl font-extrabold text-brand-700 sm:text-4xl">
                <AnimatedStat
                  contentKey={`home.stats.${i}.value`}
                  editMode={editMode}
                  value={s.value}
                  delay={i * 90}
                />
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                <EditableText contentKey={`home.stats.${i}.label`} editMode={editMode} value={s.label} as="span" />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Categories ---- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
            <EditableText contentKey="home.categoriesEyebrow" editMode={editMode} value={t("home.categoriesEyebrow")} as="span" />
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
            <EditableText contentKey="home.categoriesTitle" editMode={editMode} value={t("home.categoriesTitle")} as="span" />
          </h2>
          <div className="mt-4 text-slate-600">
            <EditableRichText contentKey="home.categoriesBody" editMode={editMode} value={t("home.categoriesBody")} />
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={String(cat._id)}
              href={localePath(locale, `/products?category=${cat.slug}`)}
              className="reveal group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-brand-900 group-hover:text-brand-600">
                {categoryName(cat, locale)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {categoryBody(cat.slug, locale, cat.description)}
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-brand-600">
                {ui("viewProducts", locale)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Featured Products ---- */}
      <section className="wave-bg-soft border-y border-brand-100">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="reveal mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
              <EditableText contentKey="home.featuredEyebrow" editMode={editMode} value={t("home.featuredEyebrow")} as="span" />
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
              <EditableText contentKey="home.featuredTitle" editMode={editMode} value={t("home.featuredTitle")} as="span" />
            </h2>
            <div className="mt-4 text-slate-600">
              <EditableRichText contentKey="home.featuredBody" editMode={editMode} value={t("home.featuredBody")} />
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link
              href={localePath(locale, "/products")}
              className="rounded-lg border border-brand-600 px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              {ui("allProducts", locale)}
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredLocalized.map((p) => (
              <ProductCard key={String(p._id)} product={p} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* ---- Why Us ---- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="reveal mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
            <EditableText contentKey="home.whyTitle" editMode={editMode} value={t("home.whyTitle")} as="span" />
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {why.map((f, i) => (
            <div key={i} className="reveal rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">{WHY_ICONS[i]}</div>
              <h3 className="mt-3 font-semibold text-brand-900">
                <EditableText contentKey={`home.why.${i}.title`} editMode={editMode} value={f.title} as="span" />
              </h3>
              <div className="mt-2 text-sm leading-relaxed text-slate-600">
                <EditableRichText contentKey={`home.why.${i}.text`} editMode={editMode} value={f.text} />
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* ---- Testimonial ---- */}
      <section className="wave-bg-deep">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <blockquote className="reveal">
            <div className="text-xl font-medium leading-relaxed text-white sm:text-2xl">
              <EditableRichText contentKey="home.testimonialQuote" editMode={editMode} value={t("home.testimonialQuote")} />
            </div>
            <footer className="mt-6 text-sm text-brand-100">
              <EditableText contentKey="home.testimonialAttribution" editMode={editMode} value={t("home.testimonialAttribution")} as="span" />
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="reveal rounded-2xl wave-bg-deep px-8 py-14 text-center sm:px-14">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            <EditableText contentKey="home.ctaTitle" editMode={editMode} value={t("home.ctaTitle")} as="span" />
          </h2>
          <div className="mx-auto mt-4 max-w-xl text-brand-50">
            <EditableRichText contentKey="home.ctaBody" editMode={editMode} value={t("home.ctaBody")} />
          </div>
          {editMode ? (
            <span className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-brand-800 shadow-lg">
              <EditableLink labelKey="home.ctaButton" hrefKey="home.secondaryCtaHref" editMode label={t("home.ctaButton")} href={t("home.secondaryCtaHref")} />
            </span>
          ) : (
            <Link
              href={localePath(locale, t("home.secondaryCtaHref"))}
              className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-brand-800 shadow-lg transition hover:bg-brand-50"
            >
              {t("home.ctaButton")} →
            </Link>
          )}
        </div>
      </section>
    </>
  );
}

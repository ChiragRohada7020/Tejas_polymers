import type { Metadata } from "next";
import Link from "next/link";
import { getCachedCategories, getCachedProducts } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { EditableLink, EditableRichText, EditableText } from "@/components/site/Editable";
import { getSiteContentMap, translator } from "@/lib/site-content";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";
import { localizeProduct } from "@/lib/catalog";
import { categoryName } from "@/lib/models/Category";
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  isKnownLocale,
  localeAlternates,
  localePath,
  type Locale,
} from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { productsFoundFor, ui, categoryBody } from "@/lib/strings";
import AdminChrome from "@/components/site/AdminChrome";

export const revalidate = 60;
  // Edit state is resolved client-side (see EditModeContext).
  const editMode = false;

type ProductsProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string }>;
};

export async function generateMetadata({ params }: ProductsProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;
  const isMr = locale === "mr";

  // Kept near 60 characters so the service and the place both survive the
  // search-result rewrite; the older phrasing was cut mid-phrase.
  const title = isMr
    ? "ठिबक सिंचन उत्पादने | तेजा पॉलिमर्स"
    : "Drip Irrigation Products | Tejas Polymers";
  const description = isMr
    ? "IS 13488 फ्लॅट इनलाइन ठिबक लेटरल १२ व १६ मिमी, ४ व ८ LPH ऑनलाइन ड्रिपर्स, स्क्रीन व डिस्क फिल्टर, ग्रोमेट व फिटिंग्ज."
    : "IS 13488 flat inline drip laterals in 12 mm and 16 mm, 4 and 8 LPH online drippers, screen and disc filters, grommets and fittings.";

  return {
    title,
    description,
    keywords: isMr
      ? [
          "फ्लॅट इनलाइन ठिबक १२ मिमी",
          "फ्लॅट इनलाइन ठिबक १६ मिमी",
          "ऑनलाइन ड्रिपर ४ LPH",
          "दाब-भरित एमिटर",
          "स्क्रीन फिल्टर २ इंच",
          "डिस्क फिल्टर",
          "टेक-ऑफ कनेक्टर",
          "ठिबक लेटरल ग्रोमेट",
          "ठिबक सिंचन फिटिंग्ज",
        ]
      : [
          "flat inline drip 12mm",
          "flat inline drip 16mm",
          "online drip emitter 4 LPH",
          "online drip emitter 8 LPH",
          "PC pressure compensating emitter",
          "drip screen filter 2 inch",
          "drip disc filter",
          "drip take off connector",
          "drip lateral grommet",
          "drip irrigation fittings",
        ],
    alternates: {
      canonical: `/${locale}/products`,
      languages: localeAlternates("/products", true),
    },
  };
}

export default async function ProductsPage({ params, searchParams }: ProductsProps) {
  const { locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;

  const { category = "", q = "" } = await searchParams;

  const [categories, allProducts, map] = await Promise.all([
    getCachedCategories(),
    getCachedProducts(),
    getSiteContentMap(),
  ]);

  /*
   * Filter and search in JS against the cached list - far cheaper than a
   * database round trip per request. Fifteen products is small enough
   * that this is the right trade.
   *
   * The haystack deliberately spans BOTH languages even on a Marathi page:
   * a dealer may well type "emitter" or "16mm" in Latin, and the category
   * slugs are English. Matching only the rendered language would return
   * nothing for those.
   */
  const needle = q.trim().toLowerCase();
  const products = allProducts
    .filter((p) => {
      if (category && p.category !== category) return false;
      if (!needle) return true;
      return [p.name, p.shortDescription, p.category, p.mr?.name, p.mr?.shortDescription]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle));
    })
    .map((p) => localizeProduct(p, locale));

  const t = translator(map, locale);
  const activeCat = categories.find((c) => c.slug === category);

  const isMr = locale === "mr";
  const pagePath = category
    ? `/${locale}/products?category=${category}`
    : `/${locale}/products`;

  /*
   * ItemList + CollectionPage: this is the catalogue's main index, so telling
   * Google what it actually lists (and in what order) helps it understand the
   * page rather than treating it as a thin shell. Built from the same
   * filtered/localised array that renders, so the markup cannot drift from
   * the visible cards.
   */
  const listLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: activeCat
      ? categoryName(activeCat, locale)
      : isMr
        ? "ठिबक सिंचन उत्पादने"
        : "Drip Irrigation Products",
    url: `${SITE_URL}${pagePath}`,
    inLanguage: LOCALE_META[locale].htmlLang,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 100).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.name,
        url: `${SITE_URL}${localePath(locale, `/products/${p.slug}`)}`,
      })),
    },
  };
  const breadcrumbLd = breadcrumbJsonLd(locale, [
    { name: ui("breadcrumbHome", locale), path: `/${locale}` },
    { name: ui("breadcrumbProducts", locale), path: `/${locale}/products` },
    ...(activeCat
      ? [{ name: categoryName(activeCat, locale), path: pagePath }]
      : []),
  ]);

  return (
    <>
      <Reveal />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(listLd, breadcrumbLd) }}
      />
      {/* Page header */}
      <section className="wave-bg border-b border-brand-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-600">
            <Link href={localePath(locale, "/")} className="hover:text-brand-800">{ui("breadcrumbHome", locale)}</Link>
            <span className="mx-2">/</span>
            <span className="text-brand-900">{ui("breadcrumbProducts", locale)}</span>
            {activeCat && (
              <>
                <span className="mx-2">/</span>
                <span className="text-brand-900">{categoryName(activeCat, locale)}</span>
              </>
            )}
          </nav>
          <h1 className="text-3xl font-extrabold text-brand-950 sm:text-4xl">
            {activeCat ? (
              categoryName(activeCat, locale)
            ) : (
              <EditableText contentKey="products.heroTitle" editMode={editMode} value={t("products.heroTitle")} as="span" />
            )}
          </h1>
          <div className="mt-3 max-w-2xl text-slate-700">
            {activeCat ? categoryBody(activeCat.slug, locale, activeCat.description) : (
              <EditableRichText contentKey="products.heroBody" editMode={editMode} value={t("products.heroBody")} />
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <Link
              href={localePath(locale, "/products")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                !category
                  ? "bg-brand-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              {ui("allProducts", locale)}
            </Link>
            {categories.map((c) => (
              <Link
                key={String(c._id)}
                href={localePath(locale, `/products?category=${c.slug}`)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === c.slug
                    ? "bg-brand-700 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                {categoryName(c, locale)}
              </Link>
            ))}
          </div>

          <form action={localePath(locale, "/products")} method="get" className="flex gap-2">
            {category && <input type="hidden" name="category" value={category} />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={ui("searchPlaceholder", locale)}
              aria-label={ui("searchPlaceholder", locale)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 lg:w-64"
            />
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {ui("search", locale)}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-slate-500" role="status">
            {productsFoundFor(products.length, q, locale)}
          </p>
          <AdminChrome>
            <Link
              href="/admin/products/new"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700"
            >
              + Add New Product
            </Link>
          </AdminChrome>
        </div>

        {products.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-16 text-center">
            <p className="text-lg font-medium text-slate-700">{ui("noProductsMatch", locale)}</p>
            <p className="mt-2 text-sm text-slate-500">
              {locale === "mr" ? "वेगळा शब्द वापरून पहा किंवा " : "Try a different keyword or "}
              <Link href={localePath(locale, "/products")} className="font-semibold text-brand-700 underline">
                {ui("browseAllProducts", locale)}
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard
                key={String(p._id)}
                product={p}
                locale={locale}
                editMode={editMode}
                headingLevel="h2"
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-brand-50 px-8 py-10 text-center">
          <h2 className="text-2xl font-bold text-brand-900">
            <EditableText contentKey="products.ctaTitle" editMode={editMode} value={t("products.ctaTitle")} as="span" />
          </h2>
          <div className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
            <EditableRichText contentKey="products.ctaBody" editMode={editMode} value={t("products.ctaBody")} />
          </div>
          {editMode ? (
            <span className="mt-6 inline-block rounded-xl bg-brand-600 px-7 py-3 text-sm font-bold text-white shadow">
              <EditableLink
                labelKey="products.ctaButton"
                hrefKey="products.ctaHref"
                editMode
                label={t("products.ctaButton")}
                href={t("products.ctaHref")}
              />
            </span>
          ) : (
            <Link
              href={localePath(locale, t("products.ctaHref"))}
              className="mt-6 inline-block rounded-xl bg-brand-600 px-7 py-3 text-sm font-bold text-white shadow transition hover:bg-brand-700"
            >
              {t("products.ctaButton")}
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

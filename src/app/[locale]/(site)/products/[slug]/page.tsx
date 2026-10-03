import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCachedProductBySlug, getCachedProducts, localizeProduct } from "@/lib/catalog";
import InquiryForm from "@/components/InquiryForm";
import ProductCard from "@/components/ProductCard";
import SafeImage from "@/components/SafeImage";
import Reveal from "@/components/Reveal";
import { BRAND_NAME, SITE_NAME, SITE_URL } from "@/lib/site";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";
import { categoryName } from "@/lib/models/Category";
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  isKnownLocale,
  localeAlternates,
  localePath,
  type Locale,
} from "@/lib/i18n";
import { ui, specLabel, priceLabel, minOrderLabel } from "@/lib/strings";
import AdminChrome from "@/components/site/AdminChrome";

export const revalidate = 60;
  // Edit state is resolved client-side (see EditModeContext).
  const editMode = false;

type Props = { params: Promise<{ slug: string; locale: string }> };

async function getProduct(slug: string) {
  return getCachedProductBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;

  const data = await getProduct(slug);
  if (!data) return { title: ui("productNotFound", locale) };

  // Metadata follows the page's language, so the search snippet a Marathi
  // query returns is the Marathi description rather than the English one.
  const { product, category } = data;
  const localized = localizeProduct(product, locale);
  const path = `/products/${product.slug}`;

  // Product names are already long and specific ("Krusheebindoo Flat Inline
  // Drip 16 mm - 4 LPH - 30 cm"), so appending the category and brand pushed
  // these titles past 110 characters and Google truncated away the
  // distinguishing spec. The brand is now folded into the name only when the
  // stored name does not already carry it, and the category is dropped from
  // the title since it repeats in the breadcrumb and the H1.
  const name = localized.name;
  const brand = BRAND_NAME;
  const withBrand = name.toLowerCase().includes(brand.toLowerCase())
    ? name
    : `${name} | ${brand}`;
  const title = withBrand.length > 95 ? withBrand.slice(0, 92).trim() : withBrand;

  // Clamp the description too: Google cuts around 155-160 characters, so
  // anything past that is only feeding the snippet's ellipsis.
  const rawDesc = (localized.shortDescription || "").trim();
  const description =
    rawDesc.length > 158 ? `${rawDesc.slice(0, 155).trimEnd()}…` : rawDesc;

  return {
    title,
    description,
    alternates: {
      canonical: localePath(locale, path),
      languages: localeAlternates(path, true, SITE_URL),
    },
    openGraph: buildOpenGraph({
      locale,
      title,
      description,
      path: localePath(locale, path),
      image: product.imageUrl || undefined,
      imageAlt: localized.name,
    }),
    twitter: buildTwitter({
      title,
      description,
      image: product.imageUrl || undefined,
    }),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug, locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;

  const data = await getProduct(slug);
  if (!data) notFound();

  const { product: rawProduct, category } = data;
  const product = localizeProduct(rawProduct, locale);
  const all = await getCachedProducts();
  const related = all
    .filter((p) => p.category === rawProduct.category && p.slug !== rawProduct.slug)
    .slice(0, 3)
    .map((p) => localizeProduct(p, locale));

  /*
   * JSON-LD is rebuilt per locale.
   *
   * The absolute URLs must include the locale segment or every language
   * emits the same @id, and Google treats identical structured data across
   * different URLs as conflicting rather than as translations. Names come
   * from the localized product so the rich result matches the visible page.
   */
  const productPath = localePath(locale, `/products/${product.slug}`);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}${productPath}#product`,
    name: product.name,
    description: product.shortDescription,
    image: product.imageUrl ? `${SITE_URL}${product.imageUrl}` : `${SITE_URL}/images/og/tejas-polymers.jpg`,
    category: categoryName(category, locale) || undefined,
    sku: product.slug,
    inLanguage: LOCALE_META[locale].htmlLang,
    brand: { "@type": "Brand", name: BRAND_NAME },
    manufacturer: {
      "@type": "Organization",
      "@id": `${SITE_URL}/${locale}#business`,
      name: SITE_NAME,
      alternateName: BRAND_NAME,
      url: `${SITE_URL}/${locale}`,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}${productPath}`,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/${locale}#business` },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: ui("breadcrumbHome", locale),
        item: `${SITE_URL}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: ui("breadcrumbProducts", locale),
        item: `${SITE_URL}${localePath(locale, "/products")}`,
      },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: categoryName(category, locale),
              item: `${SITE_URL}${localePath(locale, `/products?category=${category.slug}`)}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: category ? 4 : 3,
        name: product.name,
        item: `${SITE_URL}${productPath}`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Reveal />


      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <AdminChrome>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold">Edit Mode:</span>
                <span>This is dynamic product catalog data (images, specs, descriptions).</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/products/${product._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-brand-600 px-3 py-1.5 font-semibold text-white shadow-sm hover:bg-brand-700"
                >
                  ✏️ Edit This Product in Admin
                </Link>
                <Link
                  href="/admin/products/new"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  + Add Another Product
                </Link>
              </div>
            </div>
        </AdminChrome>

        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-500">
          <Link href={localePath(locale, "/")} className="hover:text-brand-700">{ui("breadcrumbHome", locale)}</Link>
          <span className="mx-2">/</span>
          <Link href={localePath(locale, "/products")} className="hover:text-brand-700">{ui("breadcrumbProducts", locale)}</Link>
          {category && (
            <>
              <span className="mx-2">/</span>
              <Link href={localePath(locale, `/products?category=${category.slug}`)} className="hover:text-brand-700">
                {categoryName(category, locale)}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="font-medium text-slate-700">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="reveal flex items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-brand-50 p-4 shadow-sm">
            <SafeImage
              src={product.imageUrl}
              alt={`${product.name} - drip irrigation product by ${SITE_NAME}`}
              className="block h-auto w-full object-contain"
            />
          </div>

          <div className="reveal">
            {category && (
              <Link
                href={localePath(locale, `/products?category=${category.slug}`)}
                className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
              >
                {categoryName(category, locale)}
              </Link>
            )}
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 leading-relaxed text-slate-600">{product.shortDescription}</p>

            <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50 p-4">
              <p className="text-sm text-slate-600">
                {product.price && /₹/.test(product.price)
                  ? ui("mrpExWorks", locale)
                  : ui("price", locale)}
              </p>
              <p className="mt-1 text-xl font-bold text-brand-800">
                {priceLabel(product.price, locale)}
              </p>
              {product.minOrderQty && (
                <p className="mt-1 text-sm text-slate-500">
                  {ui("minimumOrder", locale)}: {minOrderLabel(product.minOrderQty, locale)}
                </p>
              )}
            </div>

            {product.specs && Object.keys(product.specs).length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {Object.entries(product.specs)
                  .slice(0, 6)
                  .map(([key, value]) => (
                    <div key={key} className="border-b border-slate-100 pb-2">
                      {/*
                        * slate-400 on white is only 2.6:1, which fails WCAG AA
                        * for text this small. slate-600 clears 4.5:1 with room
                        * to spare, and the uppercase/letter-spacing still
                        * carries the "label" reading.
                        */}
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-600">
                        {specLabel(key, locale)}
                      </dt>
                      <dd className="mt-0.5 font-medium text-slate-800">{String(value)}</dd>
                    </div>
                  ))}
              </dl>
            )}
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-brand-900">{ui("productDescription", locale)}</h2>
            <p className="mt-4 leading-relaxed text-slate-600">{product.description}</p>
          </div>
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-brand-900">{ui("fullSpecifications", locale)}</h2>
              <table className="mt-4 w-full text-sm">
                <tbody>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <tr key={key} className="border-b border-slate-100">
                      <th scope="row" className="py-3 pr-4 text-left font-medium text-slate-500">
                        {specLabel(key, locale)}
                      </th>
                      <td className="py-3 text-right font-medium text-slate-800">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-16 grid gap-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-brand-900">
              {locale === "mr"
                ? `${product.name} मध्ये रुची आहे?`
                : `Interested in ${product.name}?`}
            </h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              {locale === "mr"
                ? "या उत्पादनासाठी भाव किंवा डिस्ट्रिब्यूटर नियम जाणून घ्या. आमची निर्यात संघ १ कार्यदिवसात किंमत, किमान ऑर्डर व शिपिंग पर्यायांसह उत्तर देते."
                : "Request a quote or distributor terms for this product. Our export team responds within 1 business day with pricing, MOQ and shipping options for your region."}
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              <li>{locale === "mr" ? "कारखान्यातून थेट किंमत" : "Factory-direct pricing"}</li>
              <li>
                {locale === "mr"
                  ? "निर्यात पॅकिंग व कागदपत्रे"
                  : "Export packaging & documentation"}
              </li>
              <li>
                {locale === "mr"
                  ? "वॉरंटी व स्पेअर पार्ट्स सहाय्य"
                  : "Warranty & spare parts support"}
              </li>
            </ul>
          </div>
          <InquiryForm productId={String(product._id)} productName={product.name} variant="product" />
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-bold text-brand-900">{ui("relatedProducts", locale)}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={String(p._id)} product={p} locale={locale} editMode={editMode} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

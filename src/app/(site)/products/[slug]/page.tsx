import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCachedProductBySlug, getCachedProducts } from "@/lib/catalog";
import InquiryForm from "@/components/InquiryForm";
import ProductCard from "@/components/ProductCard";
import SafeImage from "@/components/SafeImage";
import Reveal from "@/components/Reveal";
import { BRAND_NAME, SITE_NAME, SITE_URL } from "@/lib/site";
import AdminChrome from "@/components/site/AdminChrome";

export const revalidate = 60;
  // Edit state is resolved client-side (see EditModeContext).
  const editMode = false;

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  return getCachedProductBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) return { title: "Product not found" };
  const { product, category } = data;
  const title = `${product.name} - ${category?.name ?? "Drip Irrigation Product"} | ${BRAND_NAME}`;
  return {
    title,
    description: product.shortDescription,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description: product.shortDescription,
      url: `/products/${product.slug}`,
      type: "website",
      images: product.imageUrl
        ? [{ url: product.imageUrl, alt: product.name }]
        : [{ url: "/images/og/tejas-polymers.jpg", alt: product.name }],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) notFound();

  const { product, category } = data;
  const all = await getCachedProducts();
  const related = all
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 3);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/products/${product.slug}#product`,
    name: product.name,
    description: product.shortDescription,
    image: product.imageUrl ? `${SITE_URL}${product.imageUrl}` : `${SITE_URL}/images/og/tejas-polymers.jpg`,
    category: category?.name,
    sku: product.slug,
    brand: { "@type": "Brand", name: BRAND_NAME },
    manufacturer: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#business`,
      name: SITE_NAME,
      alternateName: BRAND_NAME,
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#business` },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Products", item: `${SITE_URL}/products` },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: category.name,
              item: `${SITE_URL}/products?category=${category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: category ? 4 : 3,
        name: product.name,
        item: `${SITE_URL}/products/${product.slug}`,
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
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-brand-700">Products</Link>
          {category && (
            <>
              <span className="mx-2">/</span>
              <Link href={`/products?category=${category.slug}`} className="hover:text-brand-700">
                {category.name}
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
                href={`/products?category=${category.slug}`}
                className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
              >
                {category.name}
              </Link>
            )}
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 leading-relaxed text-slate-600">{product.shortDescription}</p>

            <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50 p-4">
              <p className="text-sm text-slate-600">
                {product.price && /₹/.test(product.price) ? "M.R.P. (ex-works)" : "Price"}
              </p>
              <p className="mt-1 text-xl font-bold text-brand-800">
                {product.price || "Contact us for pricing"}
              </p>
              {product.minOrderQty && (
                <p className="mt-1 text-sm text-slate-500">Minimum order: {product.minOrderQty}</p>
              )}
            </div>

            {product.specs && Object.keys(product.specs).length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {Object.entries(product.specs)
                  .slice(0, 6)
                  .map(([key, value]) => (
                    <div key={key} className="border-b border-slate-100 pb-2">
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {key}
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
            <h2 className="text-2xl font-bold text-brand-900">Product Description</h2>
            <p className="mt-4 leading-relaxed text-slate-600">{product.description}</p>
          </div>
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-brand-900">Full Specifications</h2>
              <table className="mt-4 w-full text-sm">
                <tbody>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <tr key={key} className="border-b border-slate-100">
                      <th scope="row" className="py-3 pr-4 text-left font-medium text-slate-500">
                        {key}
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
            <h2 className="text-2xl font-bold text-brand-900">Interested in {product.name}?</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Request a quote or distributor terms for this product. Our export team responds
              within 1 business day with pricing, MOQ and shipping options for your region.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              <li>Factory-direct pricing</li>
              <li>Export packaging &amp; documentation</li>
              <li>Warranty &amp; spare parts support</li>
            </ul>
          </div>
          <InquiryForm productId={String(product._id)} productName={product.name} variant="product" />
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-bold text-brand-900">Related Products</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={String(p._id)} product={p} editMode={editMode} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

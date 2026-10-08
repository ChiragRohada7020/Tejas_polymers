import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SafeImage from "@/components/SafeImage";
import { getCachedProductBySlug, localizeProduct } from "@/lib/catalog";
import { BLOG_POSTS, blogPost, relatedBlogPosts } from "@/lib/blog";
import { breadcrumbJsonLd, buildOpenGraph, buildTwitter, jsonLdScript } from "@/lib/seo";
import { BRAND_NAME, SITE_URL } from "@/lib/site";
import type { IProduct } from "@/lib/models/Product";
import {
  DEFAULT_LOCALE,
  LOCALES,
  isKnownLocale,
  localeAlternates,
  localePath,
  type Locale,
} from "@/lib/i18n";
import { specLabel, ui } from "@/lib/strings";

export const revalidate = 60;
export const dynamicParams = false;

const INDEX_PATH = "/blog";

type Props = { params: Promise<{ slug: string; locale: string }> };

/**
 * Looks up the guide's product, tolerating a database outage.
 *
 * The guide's own text lives in code, so the product is supplementary: it
 * supplies the hero image, the spec table and the call to action. A database
 * hiccup should cost the reader those blocks, not the whole article - and it
 * must not fail the build, which is exactly what happened when the connection
 * to the Atlas cluster went briefly flaky.
 */
async function findProduct(slug: string, locale: Locale): Promise<IProduct | null> {
  try {
    const data = await getCachedProductBySlug(slug);
    return data ? localizeProduct(data.product, locale) : null;
  } catch {
    return null;
  }
}

async function productImage(slug: string): Promise<string | undefined> {
  try {
    const data = await getCachedProductBySlug(slug);
    return data?.product.imageUrl || undefined;
  } catch {
    return undefined;
  }
}

/**
 * One page per guide per language, prerendered.
 *
 * Guides are authored in code (src/lib/blog.ts) rather than stored in the
 * database, so the full set is known at build time and there is no reason to
 * render them on demand.
 */
export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    BLOG_POSTS.map((post) => ({ locale, slug: post.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;

  const post = blogPost(slug);
  if (!post) return { title: ui("blogNotFound", locale) };

  const copy = post.copy[locale];
  const path = `${INDEX_PATH}/${post.slug}`;
  const image = await productImage(post.productSlug);

  return {
    // The [locale] layout's title template appends the site name, so the guide
    // title is passed through bare. Suffixing it here as well produced a
    // 96-character title ending "... | Krusheebindoo | Tejas Polymers".
    title: copy.title,
    description: copy.metaDescription,
    alternates: {
      canonical: localePath(locale, path),
      languages: localeAlternates(path, true, SITE_URL),
    },
    openGraph: buildOpenGraph({
      locale,
      title: copy.title,
      description: copy.metaDescription,
      path: localePath(locale, path),
      image,
      imageAlt: copy.title,
      type: "article",
    }),
    twitter: buildTwitter({
      title: copy.title,
      description: copy.metaDescription,
      image,
    }),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug, locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;

  const post = blogPost(slug);
  if (!post) notFound();

  const copy = post.copy[locale];
  const product = await findProduct(post.productSlug, locale);
  const related = relatedBlogPosts(post.slug);

  const path = `${INDEX_PATH}/${post.slug}`;
  const url = `${SITE_URL}${localePath(locale, path)}`;
  const breadcrumbLd = breadcrumbJsonLd(locale, [
    { name: ui("breadcrumbHome", locale), path: `/${locale}` },
    { name: ui("breadcrumbBlog", locale), path: `/${locale}${INDEX_PATH}` },
    { name: copy.title, path: `${localePath(locale, INDEX_PATH)}/${post.slug}` },
  ]);
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: copy.title,
    description: copy.metaDescription,
    url,
    inLanguage: locale,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: BRAND_NAME },
    publisher: { "@type": "Organization", name: BRAND_NAME },
    ...(product?.imageUrl ? { image: `${SITE_URL}${product.imageUrl}` } : {}),
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd, articleLd, faqLd) }}
      />

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-600">
          <Link href={localePath(locale, "/")} className="hover:text-brand-800">
            {ui("breadcrumbHome", locale)}
          </Link>
          <span className="mx-2">/</span>
          <Link href={localePath(locale, INDEX_PATH)} className="hover:text-brand-800">
            {ui("breadcrumbBlog", locale)}
          </Link>
        </nav>

        <h1 className="text-3xl font-extrabold leading-tight text-brand-950 sm:text-4xl">
          {copy.title}
        </h1>

        {product?.imageUrl ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-brand-50">
            <SafeImage
              src={product.imageUrl}
              alt={copy.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <p className="mt-6 text-lg leading-relaxed text-slate-700">{copy.excerpt}</p>

        {copy.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="text-2xl font-bold text-brand-900">{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="mt-4 leading-relaxed text-slate-700">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        {product && product.specs && Object.keys(product.specs).length > 0 ? (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-brand-900">{ui("blogSpecsTitle", locale)}</h2>
            <table className="mt-4 w-full text-sm">
              <tbody>
                {Object.entries(product.specs).map(([key, value]) => (
                  <tr key={key} className="border-b border-slate-100">
                    <th scope="row" className="py-3 pr-4 text-left font-medium text-slate-600">
                      {specLabel(key, locale)}
                    </th>
                    <td className="py-3 text-right font-medium text-slate-800">{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {product ? (
          <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-brand-900">{ui("blogProductCtaTitle", locale)}</h2>
            <p className="mt-2 leading-relaxed text-slate-600">{ui("blogProductCtaBody", locale)}</p>
            <p className="mt-3 font-semibold text-brand-900">{product.name}</p>
            <Link
              href={localePath(locale, `/products/${product.slug}`)}
              className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              {ui("blogProductCtaButton", locale)}
            </Link>
          </section>
        ) : null}

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-brand-900">{ui("blogFaqTitle", locale)}</h2>
          <dl className="mt-4 space-y-6">
            {copy.faq.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold text-brand-900">{item.question}</dt>
                <dd className="mt-1 leading-relaxed text-slate-700">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        {related.length > 0 ? (
          <section className="mt-16 border-t border-slate-200 pt-8">
            <h2 className="text-xl font-bold text-brand-900">{ui("blogRelatedTitle", locale)}</h2>
            <ul className="mt-4 space-y-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={localePath(locale, `${INDEX_PATH}/${item.slug}`)}
                    className="font-medium text-brand-600 hover:text-brand-800"
                  >
                    {item.copy[locale].title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={localePath(locale, INDEX_PATH)}
              className="mt-6 inline-block text-sm font-semibold text-slate-600 hover:text-brand-800"
            >
              ← {ui("blogBackToIndex", locale)}
            </Link>
          </section>
        ) : null}
      </article>
    </div>
  );
}

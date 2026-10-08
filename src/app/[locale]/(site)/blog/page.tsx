import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import SafeImage from "@/components/SafeImage";
import { EditableRichText, EditableText } from "@/components/site/Editable";
import { getSiteContentMap, translator } from "@/lib/site-content";
import { getCachedProducts, localizeProduct } from "@/lib/catalog";
import { allBlogPosts, readingMinutes } from "@/lib/blog";
import { breadcrumbJsonLd, buildOpenGraph, buildTwitter, jsonLdScript } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import {
  DEFAULT_LOCALE,
  isKnownLocale,
  localeAlternates,
  localePath,
  type Locale,
} from "@/lib/i18n";
import { ui } from "@/lib/strings";
import type { IProduct } from "@/lib/models/Product";

export const revalidate = 60;

const INDEX_PATH = "/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;
  const isMr = locale === "mr";

  // No brand suffix here: the [locale] layout's title template already appends
  // the site name, and adding it in both places produced "... | Krusheebindoo
  // | Tejas Polymers" - a 96-character title Google would truncate mid-phrase.
  const title = isMr ? "ठिबक सिंचन मार्गदर्शक" : "Drip Irrigation Guides";
  const description = isMr
    ? "लेटरल व्यास, एमिटर अंतर, फिल्टर निवड व दाब-भरित एमिटर यांविषयी उपयुक्त मार्गदर्शक — महाराष्ट्रातील शेतकऱ्यांसाठी."
    : "Practical guides on lateral diameter, emitter spacing, filter selection and pressure-compensating emitters, written for growers in Maharashtra.";

  return {
    title,
    description,
    alternates: {
      canonical: localePath(locale, INDEX_PATH),
      languages: localeAlternates(INDEX_PATH, true, SITE_URL),
    },
    openGraph: buildOpenGraph({
      locale,
      title,
      description,
      path: localePath(locale, INDEX_PATH),
    }),
    twitter: buildTwitter({ title, description }),
  };
}

function formatDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(locale === "mr" ? "mr-IN" : "en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;

  const [map, products] = await Promise.all([
    getSiteContentMap(),
    // The guides carry their own text; the product lookup only supplies the
    // card photo. A database hiccup should cost the photos, not the index.
    getCachedProducts().catch(() => [] as IProduct[]),
  ]);
  const t = translator(map, locale);
  const bySlug = new Map<string, IProduct>(
    products.map((p) => [p.slug, localizeProduct(p, locale)])
  );

  const posts = allBlogPosts();
  const breadcrumbLd = breadcrumbJsonLd(locale, [
    { name: ui("breadcrumbHome", locale), path: `/${locale}` },
    { name: ui("breadcrumbBlog", locale), path: `/${locale}${INDEX_PATH}` },
  ]);
  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: t("blog.heroTitle"),
    description: t("blog.heroBody"),
    url: `${SITE_URL}${localePath(locale, INDEX_PATH)}`,
    inLanguage: locale,
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.copy[locale].title,
      url: `${SITE_URL}${localePath(locale, `${INDEX_PATH}/${post.slug}`)}`,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
    })),
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd, blogLd) }}
      />
      <section className="border-b border-slate-200 bg-brand-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-600">
            <Link href={localePath(locale, "/")} className="hover:text-brand-800">
              {ui("breadcrumbHome", locale)}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-brand-900">{ui("breadcrumbBlog", locale)}</span>
          </nav>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            <EditableText contentKey="blog.eyebrow" value={t("blog.eyebrow")} as="span" />
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-extrabold text-brand-950 sm:text-4xl">
            <EditableText contentKey="blog.heroTitle" value={t("blog.heroTitle")} as="span" />
          </h1>
          <EditableRichText
            contentKey="blog.heroBody"
            value={t("blog.heroBody")}
            className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-700"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {posts.length === 0 ? (
          <p className="text-slate-600">{ui("blogNoPosts", locale)}</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const copy = post.copy[locale];
              const product = bySlug.get(post.productSlug);
              const href = localePath(locale, `${INDEX_PATH}/${post.slug}`);
              return (
                <article
                  key={post.slug}
                  className="reveal group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                    <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-brand-50">
                      {product?.imageUrl ? (
                        <SafeImage
                          src={product.imageUrl}
                          alt={copy.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : null}
                    </Link>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {formatDate(post.publishedAt, locale)} · {readingMinutes(copy)}{" "}
                        {locale === "mr" ? "मिनिटे वाचन" : "min read"}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-brand-900">
                        <Link href={href} className="hover:text-brand-600">
                          {copy.title}
                        </Link>
                      </h2>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                        {copy.excerpt}
                      </p>
                      <Link
                        href={href}
                        className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-800"
                      >
                        {locale === "mr" ? "मार्गदर्शक वाचा →" : "Read the guide →"}
                      </Link>
                    </div>
                  </article>
              );
            })}
          </div>
        )}
      </section>
      {/* Adds .is-visible to the .reveal cards above as they scroll in. */}
      <Reveal />
    </div>
  );
}

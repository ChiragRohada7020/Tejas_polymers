import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Category";
import { Product } from "@/lib/models/Product";
import { SITE_URL } from "@/lib/site";
import { LOCALES, localeAlternates, localePath } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type StaticEntry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

/** Marketing pages, identical in both languages apart from their copy. */
const STATIC_PATHS: StaticEntry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/products", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/become-a-distributor", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
];

function entry(
  path: string,
  lastModified: Date | undefined,
  changeFrequency: StaticEntry["changeFrequency"],
  priority: number
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${localePath("mr", path)}`,
    lastModified,
    changeFrequency,
    priority,
    // Repeats the hreflang map on every URL so Google can pair the two
    // languages even when it discovers them through the sitemap rather than
    // by crawling the links.
    alternates: { languages: localeAlternates(path, true, SITE_URL) },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // One entry per locale per page. `entry()` anchors each at the Marathi URL
  // because that is the default, with the English counterpart attached via
  // hreflang - emitting two unrelated top-level entries would tell Google
  // they are different pages.
  for (const { path, changeFrequency, priority } of STATIC_PATHS) {
    for (const locale of LOCALES) {
      const base = entry(path, now, changeFrequency, priority);
      entries.push({
        ...base,
        url: `${SITE_URL}${localePath(locale, path)}`,
      });
    }
  }

  try {
    await connectDB();
    const [products, categories] = await Promise.all([
      Product.find().select("slug updatedAt").lean(),
      Category.find().select("slug updatedAt").lean(),
    ]);

    for (const c of categories) {
      const path = `/products?category=${c.slug}`;
      for (const locale of LOCALES) {
        const base = entry(path, undefined, "weekly", 0.7);
        entries.push({
          ...base,
          url: `${SITE_URL}${localePath(locale, path)}`,
        });
      }
    }

    for (const p of products) {
      const path = `/products/${p.slug}`;
      const modified = p.updatedAt ? new Date(p.updatedAt) : undefined;
      for (const locale of LOCALES) {
        const base = entry(path, modified, "weekly", 0.8);
        entries.push({
          ...base,
          url: `${SITE_URL}${localePath(locale, path)}`,
        });
      }
    }
  } catch {
    // DB unavailable — return static entries only
  }

  return entries;
}

import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Category";
import { Product } from "@/lib/models/Product";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/become-a-distributor`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  try {
    await connectDB();
    const [products, categories] = await Promise.all([
      Product.find().select("slug updatedAt").lean(),
      Category.find().select("slug updatedAt").lean(),
    ]);

    for (const c of categories) {
      entries.push({
        url: `${SITE_URL}/products?category=${c.slug}`,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
    for (const p of products) {
      entries.push({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // DB unavailable — return static entries only
  }

  return entries;
}

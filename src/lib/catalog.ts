import { connectDB } from "@/lib/db";
import { Category, type Category as CategoryDoc } from "@/lib/models/Category";
import { Product, type IProduct } from "@/lib/models/Product";

/**
 * Cached catalogue reads.
 *
 * The catalogue changes only when an admin edits a product, but these
 * queries ran on every catalogue page view. Caching them for a minute
 * takes the database round trip off the hot path for the pages that
 * cannot be statically rendered (the ones reading searchParams).
 *
 * Deliberately simple: a TTL cache per instance. If the site grows
 * traffic this is the place to reach for a real cache, not before.
 */

const TTL_MS = 60_000;

type Cache = { expiresAt: number; value: unknown };
const globalCache = globalThis as unknown as {
  catalogCategories?: Cache;
  catalogProducts?: Cache;
  catalogBySlug?: Map<string, { expiresAt: number; value: ProductWithCategory | null }>;
};

export type ProductWithCategory = { product: IProduct; category: CategoryDoc | null };

/** Category documents as consumed by the UI (the model type omits _id). */
export type CategoryWithId = CategoryDoc & { _id: string };

/** Drop all cached catalogue reads. Call after admin product edits. */
export function invalidateCatalogCache(): void {
  globalCache.catalogCategories = undefined;
  globalCache.catalogProducts = undefined;
  globalCache.catalogBySlug?.clear();
}

export async function getCachedCategories(): Promise<CategoryWithId[]> {
  const hit = globalCache.catalogCategories;
  if (hit && hit.expiresAt > Date.now()) return hit.value as CategoryWithId[];

  await connectDB();
  const value = await Category.find().lean();
  globalCache.catalogCategories = { expiresAt: Date.now() + TTL_MS, value };
  return value as unknown as CategoryWithId[];
}

/**
 * All products, cached. Filtering and search happen in JS on the
 * returned array, which is far cheaper than a round trip per request.
 */
export async function getCachedProducts(): Promise<IProduct[]> {
  const hit = globalCache.catalogProducts;
  if (hit && hit.expiresAt > Date.now()) return hit.value as IProduct[];

  await connectDB();
  const value = await Product.find().sort({ rank: 1, featured: -1, name: 1 }).lean();
  globalCache.catalogProducts = { expiresAt: Date.now() + TTL_MS, value };
  return value as unknown as IProduct[];
}

export async function getCachedProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  if (!globalCache.catalogBySlug) globalCache.catalogBySlug = new Map();

  const hit = globalCache.catalogBySlug.get(slug);
  if (hit && hit.expiresAt > Date.now()) return hit.value;

  await connectDB();
  const product = (await Product.findOne({ slug }).lean()) as unknown as IProduct | null;
  if (!product) {
    // Short-lived negative cache so a bad slug cannot hammer the DB.
    globalCache.catalogBySlug.set(slug, { expiresAt: Date.now() + 10_000, value: null });
    return null;
  }
  const category = product.category
    ? ((await Category.findOne({ slug: product.category }).lean()) as unknown as CategoryDoc | null)
    : null;

  const value: ProductWithCategory = { product, category };
  globalCache.catalogBySlug.set(slug, { expiresAt: Date.now() + TTL_MS, value });
  return value;
}
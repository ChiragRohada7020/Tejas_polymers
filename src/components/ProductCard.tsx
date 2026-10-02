import Link from "next/link";
import type { IProduct } from "@/lib/models/Product";
import AdminChrome from "@/components/site/AdminChrome";
import SafeImage from "@/components/SafeImage";
import { localePath, type Locale } from "@/lib/i18n";
import { ui, minOrderLabel } from "@/lib/strings";

export default function ProductCard({
  product,
  locale,
  editMode = false,
}: {
  /** Must already have been passed through localizeProduct() by the caller. */
  product: IProduct;
  locale: Locale;
  editMode?: boolean;
}) {
  const detailHref = localePath(locale, `/products/${product.slug}`);
  return (
    <article className="reveal group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
        <SafeImage
          src={product.imageUrl}
          alt={`${product.name} - drip irrigation product by Tejas Polymers`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-bold text-brand-950">
            {ui("featured", locale)}
          </span>
        )}
        <AdminChrome>
          <div className="absolute right-2 top-2 z-10 flex gap-1.5">
            <Link
              href={`/admin/products/${product._id}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-800 shadow backdrop-blur transition hover:bg-brand-600 hover:text-white"
              title="Edit product details, image & specs in admin"
            >
              Edit Product
            </Link>
          </div>
        </AdminChrome>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-brand-900">
          <Link href={detailHref} className="hover:text-brand-600">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-600">{product.shortDescription}</p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-500">
            {product.minOrderQty
              ? `${ui("moq", locale)}: ${minOrderLabel(product.minOrderQty, locale)}`
              : ui("bulkOrdersWelcome", locale)}
          </span>
          <div className="flex items-center gap-2">
            <AdminChrome>
              <Link
                href={`/admin/products/${product._id}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Admin Edit
              </Link>
            </AdminChrome>
            <Link
              href={detailHref}
              className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
            >
              {ui("viewDetails", locale)}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

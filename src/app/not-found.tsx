import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-32 text-center sm:px-6">
      <p className="text-7xl font-black text-brand-200">404</p>
      <h1 className="mt-4 text-3xl font-bold text-brand-900">Page not found</h1>
      <p className="mt-3 max-w-md text-slate-600">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-brand-700"
        >
          Go Home
        </Link>
        <Link
          href="/products"
          className="rounded-xl border border-brand-600 px-6 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}

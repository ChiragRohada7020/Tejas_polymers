"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localePath, resolveLocale, type Locale } from "@/lib/i18n";
import { ui } from "@/lib/strings";

/**
 * Locale-aware 404.
 *
 * A client component because not-found.tsx receives no params, so it cannot
 * read the locale server-side. The pathname is the same authority the editor
 * uses (see VisualEditorShell.currentLocale), and resolveLocale falls back to
 * Marathi rather than rendering an English string with Marathi links.
 */
export default function NotFound() {
  const pathname = usePathname();
  const locale: Locale = resolveLocale(pathname?.split("/").filter(Boolean)[0]);
  const isMr = locale === "mr";

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-32 text-center sm:px-6">
      <p className="text-7xl font-black text-brand-200">404</p>
      <h1 className="mt-4 text-3xl font-bold text-brand-900">{ui("notFoundTitle", locale)}</h1>
      <p className="mt-3 max-w-md text-slate-600">
        {isMr
          ? "तुम्ही शोधत असलेले पृष्ठ अस्तित्वात नाही किंवा हलवले गेले आहे."
          : "The page you\u2019re looking for doesn\u2019t exist or has been moved."}
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href={localePath(locale, "/")}
          className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-brand-700"
        >
          {ui("backToHome", locale)}
        </Link>
        <Link
          href={localePath(locale, "/products")}
          className="rounded-xl border border-brand-600 px-6 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
        >
          {ui("allProducts", locale)}
        </Link>
      </div>
    </div>
  );
}

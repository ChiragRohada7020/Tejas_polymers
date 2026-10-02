"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_META, swapLocalePath, type Locale } from "@/lib/i18n";

/**
 * Marathi / English toggle.
 *
 * Renders as real links to real URLs rather than a client-side state swap.
 * That is deliberate: the two languages are genuinely different pages, and
 * only a URL lets the browser history, deep links and Google's crawler treat
 * them that way. `swapLocalePath` keeps the visitor on the same page in the
 * other language rather than dumping them at that language's home page.
 */
export default function LanguageSwitcher({
  locale,
  className = "",
}: {
  locale: Locale;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-lg border border-slate-300 bg-white py-0.5 pl-1.5 pr-0.5 shadow-sm sm:gap-1 sm:py-1 sm:pl-2 sm:pr-1 ${className}`}
      role="group"
      aria-label={locale === "mr" ? "भाषा निवडा" : "Choose language"}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-3.5 w-3.5 shrink-0 text-slate-500 sm:h-4 sm:w-4"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
      </svg>

      {LOCALES.map((candidate) => {
        const active = candidate === locale;
        return (
          <Link
            key={candidate}
            href={swapLocalePath(pathname, candidate)}
            hrefLang={LOCALE_META[candidate].htmlLang}
            lang={LOCALE_META[candidate].htmlLang}
            aria-current={active ? "true" : undefined}
            // The active language is filled rather than outlined. Both options
            // stay visible and legible at once, so a visitor can see the other
            // language exists without hunting for a subtle toggle.
            className={`rounded-md px-1.5 py-1 text-xs font-semibold transition-colors sm:px-2.5 sm:text-sm ${
              active
                ? "bg-brand-700 text-white"
                : "text-slate-600 hover:bg-brand-50 hover:text-brand-800"
            }`}
          >
            {LOCALE_META[candidate].label}
          </Link>
        );
      })}
    </div>
  );
}
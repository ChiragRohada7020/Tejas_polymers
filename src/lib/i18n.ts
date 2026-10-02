/**
 * Bilingual (Marathi + English) routing for the public site.
 *
 * Locales are URL-prefixed rather than cookie-based on purpose. The site
 * already carries a serious SEO setup - sitemap, canonicals, JSON-LD - and
 * a cookie toggle would mean Google could only ever index one language.
 * Prefixed URLs plus hreflang let both languages rank, in the language the
 * searcher actually typed.
 *
 * Marathi is the default: Pachora/Jalgaon is a Marathi-speaking market and
 * the dealers are the audience, so `/mr` is the canonical entry point and
 * bare `/` redirects here.
 *
 * The admin area is deliberately NOT localised and keeps its flat `/admin`
 * URL - it is behind a login and operated by one person, so translating it
 * would be cost without benefit. That is why this file also has to describe
 * "no locale" for callers that sit outside [locale].
 */

export const LOCALES = ["mr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** Marathi is what an unqualified visitor sees. */
export const DEFAULT_LOCALE: Locale = "mr";

/**
 * Endonyms, not English names. A Marathi reader scanning the switcher
 * recognises "मराठी" but has to translate "Marathi" first; an English
 * reader does the reverse.
 */
export const LOCALE_META: Record<Locale, { label: string; htmlLang: string; ogLocale: string }> = {
  mr: { label: "मराठी", htmlLang: "mr", ogLocale: "mr_IN" },
  en: { label: "English", htmlLang: "en", ogLocale: "en_IN" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Coerces anything to a valid locale, defaulting to Marathi. Used at the
 * edge of the app (route params, search params) where an unknown value must
 * never throw - an invalid locale should render the site, not 500 it.
 */
export function resolveLocale(value: unknown): Locale {
  const raw = typeof value === "string" ? value.toLowerCase().split("-")[0] : "";
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

/** True when the value is a real, routable locale segment. */
export function isKnownLocale(value: string): boolean {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Prefixes an internal path with its locale.
 *
 * Already-prefixed paths are returned untouched rather than double-prefixed
 * - `localePath("mr", "/mr/contact")` is "/mr/contact", not "/mr/mr/contact".
 * External URLs, anchors, mailto: and tel: pass straight through, because
 * prefixing them would produce a broken link.
 */
export function localePath(locale: Locale, path: string): string {
  if (!path) return `/${locale}`;
  if (!path.startsWith("/")) return path;
  if (path.startsWith("//")) return path;
  if (/^(#|mailto:|tel:|javascript:)/i.test(path)) return path;
  if (/^https?:\/\//i.test(path)) return path;

  const [pathname, query = ""] = path.split("?");
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isKnownLocale(segments[0])) {
    return query ? `${pathname}?${query}` : pathname;
  }
  const rest = segments.length ? `/${segments.join("/")}` : "";
  return query ? `/${locale}${rest}?${query}` : `/${locale}${rest}`;
}

/**
 * Swaps the locale segment of a current URL path, preserving the rest of
 * the path and any query string. Powers the language switcher.
 */
export function swapLocalePath(pathname: string, next: Locale): string {
  const [path, query = ""] = pathname.split("?");
  const segments = path.split("/").filter(Boolean);
  if (segments.length && isKnownLocale(segments[0])) {
    segments[0] = next;
  } else {
    segments.unshift(next);
  }
  const joined = `/${segments.join("/")}`;
  return query ? `${joined}?${query}` : joined;
}

/**
 * hreflang map for a given path, e.g.
 *   { "mr-IN": "/mr/contact", "en-IN": "/en/contact", "x-default": "/mr/contact" }
 *
 * x-default points at Marathi because it is the default locale. Google uses
 * it for visitors whose language matches none of the alternates.
 */
export function localeAlternates(
  path: string,
  absolute = false,
  siteUrl = ""
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const locale of LOCALES) {
    const href = localePath(locale, path);
    out[LOCALE_META[locale].ogLocale] = absolute ? `${siteUrl}${href}` : href;
  }
  out["x-default"] = absolute
    ? `${siteUrl}${localePath(DEFAULT_LOCALE, path)}`
    : localePath(DEFAULT_LOCALE, path);
  return out;
}
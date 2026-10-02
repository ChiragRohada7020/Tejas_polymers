"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

/**
 * Makes the current page's locale ambient.
 *
 * The visual-editor components (EditableLink and friends) need the locale to
 * prefix the hrefs they render, but they are rendered from a dozen different
 * pages. Passing locale as a prop to every call site would be easy to forget
 * - and a forgotten prop does not fail loudly, it silently emits an unprefixed
 * link that 404s. Context removes the failure mode entirely.
 *
 * Defaults to the default locale so a component rendered outside a provider
 * (an admin preview, say) still produces a valid Marathi link rather than
 * throwing.
 */
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}
import HeaderClient from "@/components/HeaderClient";
import Footer from "@/components/Footer";
import VisualEditorShell from "@/components/site/VisualEditorShell";
import { EditModeProvider } from "@/components/site/EditModeContext";
import { LocaleProvider } from "@/components/site/LocaleContext";
import { getSiteContentMap, translator } from "@/lib/site-content";
import { CONTACT } from "@/lib/site";
import { DEFAULT_LOCALE, isKnownLocale, type Locale } from "@/lib/i18n";

/**
 * Revalidated every 60s rather than rendered per request.
 *
 * This layout used to call isAdminAuthenticated() -> cookies(). Reading a
 * cookie during render opts the whole route out of static rendering, so
 * every page came back as `private, no-store` and every navigation paid
 * for a fresh server render plus a database round trip. Admin status is now
 * resolved in the browser via /api/admin/session instead.
 */
export const revalidate = 60;

export type NavItem = { labelKey: string; hrefKey: string; label: string; href: string };

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isKnownLocale(raw) ? (raw as Locale) : DEFAULT_LOCALE;

  const map = await getSiteContentMap();
  const t = translator(map, locale);

  const nav: NavItem[] = [
    { labelKey: "header.nav.home.label", hrefKey: "header.nav.home.href" },
    { labelKey: "header.nav.products.label", hrefKey: "header.nav.products.href" },
    { labelKey: "header.nav.about.label", hrefKey: "header.nav.about.href" },
    { labelKey: "header.nav.distributor.label", hrefKey: "header.nav.distributor.href" },
    { labelKey: "header.nav.contact.label", hrefKey: "header.nav.contact.href" },
  ].map((item) => ({
    ...item,
    label: t(item.labelKey),
    // Stays locale-neutral ("/products"). HeaderClient prefixes it at render
    // time; prefixing here too would make the visual editor persist
    // "/mr/products" as the stored value and leak the prefix into the
    // English site on the next save.
    href: t(item.hrefKey),
  }));

  return (
    <EditModeProvider>
    <LocaleProvider locale={locale}>
    <div className="flex min-h-screen flex-col">
      <HeaderClient
        locale={locale}
        logoImage={t("brand.logoImage")}
        logoAlt={t("brand.logoAlt")}
        wordmarkStart={t("brand.wordmarkStart")}
        wordmarkEnd={t("brand.wordmarkEnd")}
        nav={nav}
        ctaLabel={t("header.cta.label")}
        ctaHref={t("header.cta.href")}
      />
      <main className="flex-1">{children}</main>
      <Footer
        locale={locale}
        logoImage={t("brand.logoImage")}
        logoAlt={t("brand.logoAlt")}
        wordmarkStart={t("brand.wordmarkStart")}
        wordmarkEnd={t("brand.wordmarkEnd")}
        aboutBlurb={t("footer.aboutBlurb")}
        email={t("footer.contact.email") || CONTACT.email}
        phone={t("footer.contact.phone") || CONTACT.phone}
        address={t("footer.contact.address") || CONTACT.address}
      />
      {/* Renders null unless edit mode is actually switched on. */}
      <VisualEditorShell />
    </div>
    </LocaleProvider>
    </EditModeProvider>
  );
}



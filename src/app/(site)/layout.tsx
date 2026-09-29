import HeaderClient from "@/components/HeaderClient";
import Footer from "@/components/Footer";
import VisualEditorShell from "@/components/site/VisualEditorShell";
import { EditModeProvider } from "@/components/site/EditModeContext";
import { content, getSiteContentMap } from "@/lib/site-content";
import { CONTACT } from "@/lib/site";

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

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const map = await getSiteContentMap();
  const nav: NavItem[] = [
    { labelKey: "header.nav.home.label", hrefKey: "header.nav.home.href", href: "" },
    { labelKey: "header.nav.products.label", hrefKey: "header.nav.products.href", href: "" },
    { labelKey: "header.nav.about.label", hrefKey: "header.nav.about.href", href: "" },
    { labelKey: "header.nav.distributor.label", hrefKey: "header.nav.distributor.href", href: "" },
    { labelKey: "header.nav.contact.label", hrefKey: "header.nav.contact.href", href: "" },
  ].map((item) => ({ ...item, label: content(map, item.labelKey), href: content(map, item.hrefKey) }));

  return (
    <EditModeProvider>
    <div className="flex min-h-screen flex-col">
      <HeaderClient
        logoImage={content(map, "brand.logoImage")}
        logoAlt={content(map, "brand.logoAlt")}
        wordmarkStart={content(map, "brand.wordmarkStart")}
        wordmarkEnd={content(map, "brand.wordmarkEnd")}
        nav={nav}
        ctaLabel={content(map, "header.cta.label")}
        ctaHref={content(map, "header.cta.href")}
      />
      <main className="flex-1">{children}</main>
      <Footer
        logoImage={content(map, "brand.logoImage")}
        logoAlt={content(map, "brand.logoAlt")}
        wordmarkStart={content(map, "brand.wordmarkStart")}
        wordmarkEnd={content(map, "brand.wordmarkEnd")}
        aboutBlurb={content(map, "footer.aboutBlurb")}
        email={content(map, "footer.contact.email") || CONTACT.email}
        phone={content(map, "footer.contact.phone") || CONTACT.phone}
        address={content(map, "footer.contact.address") || CONTACT.address}
      />
      {/* Renders null unless edit mode is actually switched on. */}
      <VisualEditorShell />
    </div>
    </EditModeProvider>
  );
}



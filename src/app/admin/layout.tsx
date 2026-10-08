import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "../globals.css";
import { SITE_ICONS } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
// Declared here too so the admin inherits the same --font-sans stack that
// globals.css defines. Without it the var() would resolve to nothing and
// fall through to the browser default.
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  display: "swap",
  variable: "--font-devanagari",
});

export const metadata: Metadata = {
  title: { default: "Admin — Krusheebindoo", template: "%s | Admin" },
  robots: { index: false, follow: false },
  // Same icon set as the public site, so the admin tab is recognisable.
  icons: SITE_ICONS,
};

/**
 * The admin deliberately sits OUTSIDE [locale] and stays English-only.
 *
 * With no app/layout.tsx, Next treats each top-level segment as its own root
 * layout, so the public site can own <html lang> per locale while the admin
 * keeps a flat /admin URL. One trade-off: navigating between the site and the
 * admin is a full page load rather than a client transition. That is the
 * right way round - the admin is a separate tool, not part of the customer's
 * navigation.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${notoDevanagari.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
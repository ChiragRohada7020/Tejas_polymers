import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CONTACT, KEYWORDS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Irrigation Equipment Supplier in Pachora, Maharashtra`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  keywords: KEYWORDS,
  category: "Drip Irrigation Equipment",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    url: SITE_URL,
    title: `${SITE_NAME} — Drip Irrigation Manufacturer in Pachora, Maharashtra`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/og/tejas-polymers.jpg",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — drip irrigation manufacturer in Pachora, Maharashtra`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Drip Irrigation Manufacturer`,
    description: SITE_DESCRIPTION,
    images: ["/images/og/tejas-polymers.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "geo.region": "IN-MH",
    "geo.placename": "Pachora",
    "geo.position": `${CONTACT.latitude};${CONTACT.longitude}`,
    ICBM: `${CONTACT.latitude}, ${CONTACT.longitude}`,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/*
        suppressHydrationWarning: browser extensions (e.g. ClickUp, Grammarly,
        password managers) inject attributes/classes into <body> before React
        hydrates, which would otherwise log a harmless hydration-mismatch error.
      */}
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  );
}

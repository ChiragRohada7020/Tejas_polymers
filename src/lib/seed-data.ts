import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Category";
import { Product } from "@/lib/models/Product";

/**
 * Krusheebindoo by Tejas Polymers — manufacturer of inline & online
 * drip irrigation products. Category slugs are referenced by:
 *   - products (`.category`)
 *   - Footer.tsx product links
 *   - /products?category=... filtering
 * Keep them in sync when renaming.
 */
const categories = [
  {
    name: "Flat Inline Drip",
    slug: "flat-inline-drip",
    description:
      "IS 13488 flat inline drip laterals with factory-fixed emitters. 12 mm and 16 mm, Class 2, 4 LPH, in 30/40/60 cm spacing — delivered in 5000 m rolls.",
    imageUrl: "/images/categories/flat-inline-drip.jpg",
  },
  {
    name: "Online Drip & Emitters",
    slug: "online-drip-emitters",
    description:
      "On-line drippers and pressure-compensating (PC) emitters to IS 13487, plus plain laterals without emitters. Ideal for orchards, polyhouses and widely spaced crops.",
    imageUrl: "/images/categories/online-drip-emitters.jpg",
  },
  {
    name: "Filters",
    slug: "filters",
    description:
      "Screen and disc filters that protect your emitters from silt, algae and chemical residue. The single most important component for a clogging-free drip system.",
    imageUrl: "/images/categories/filters.jpg",
  },
  {
    name: "Fittings & Accessories",
    slug: "fittings-accessories",
    description:
      "Take-off connectors with valves, grommets, end caps, lateral cocks, ball valves and drip hole punchers to complete any layout.",
    imageUrl: "/images/categories/fittings-accessories.jpg",
  },
];

export { categories };

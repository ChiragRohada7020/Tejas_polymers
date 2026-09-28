import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Category";
import { Product } from "@/lib/models/Product";

const categories = [
  {
    name: "Sprayers & Dusters",
    slug: "sprayers-dusters",
    description: "Manual, battery and tractor-mounted sprayers for every field size.",
    imageUrl: "/images/categories/sprayers.svg",
  },
  {
    name: "Tillers & Cultivators",
    slug: "tillers-cultivators",
    description: "Power tillers, rotary tillers and cultivators for soil preparation.",
    imageUrl: "/images/categories/tillers.svg",
  },
  {
    name: "Harvesting Machinery",
    slug: "harvesting-machinery",
    description: "Reapers, threshers and harvesters engineered for clean, fast harvests.",
    imageUrl: "/images/categories/harvesters.svg",
  },
  {
    name: "Irrigation Equipment",
    slug: "irrigation-equipment",
    description: "Pumps, drip kits and sprinkler systems for efficient water use.",
    imageUrl: "/images/categories/irrigation.svg",
  },
  {
    name: "Hand Tools",
    slug: "hand-tools",
    description: "Premium-grade hoes, sickles, pruners and spades built to last.",
    imageUrl: "/images/categories/hand-tools.svg",
  },
  {
    name: "Spare Parts",
    slug: "spare-parts",
    description: "Genuine spare parts and accessories for all Tejas Polymers equipment.",
    imageUrl: "/images/categories/spare-parts.svg",
  },
];

export { categories };

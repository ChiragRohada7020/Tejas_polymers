import { config } from "dotenv";
import mongoose from "mongoose";
config({ path: ".env.local", quiet: true });

/** Lists every distinct specs key and price value in the catalogue. */

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/agrigrid";

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 20_000 });
  const products = await mongoose.connection
    .db!.collection("products")
    .find({}, { projection: { slug: 1, specs: 1, price: 1, minOrderQty: 1 } })
    .toArray();

  const keys = new Map<string, number>();
  const prices = new Map<string, number>();
  const moqs = new Map<string, number>();

  for (const p of products) {
    for (const k of Object.keys(p.specs ?? {})) {
      keys.set(k, (keys.get(k) ?? 0) + 1);
    }
    if (p.price) prices.set(p.price, (prices.get(p.price) ?? 0) + 1);
    if (p.minOrderQty) moqs.set(p.minOrderQty, (moqs.get(p.minOrderQty) ?? 0) + 1);
  }

  console.log(`\n=== DISTINCT SPEC KEYS (${keys.size}) ===`);
  for (const [k, n] of [...keys].sort()) console.log(`${n}\t${k}`);

  console.log(`\n=== DISTINCT PRICE VALUES (${prices.size}) ===`);
  for (const [k, n] of [...prices].sort()) console.log(`${n}\t${k}`);

  console.log(`\n=== DISTINCT MIN ORDER VALUES (${moqs.size}) ===`);
  for (const [k, n] of [...moqs].sort()) console.log(`${n}\t${k}`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
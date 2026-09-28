/* One-time migration: give every existing product a rank (default 999). */
const mongoose = require("mongoose");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/agrigrid");
  const col = mongoose.connection.db.collection("products");
  const r = await col.updateMany({ rank: { $exists: false } }, { $set: { rank: 999 } });
  console.log("Backfilled rank on", r.modifiedCount, "products.");
  const all = await col.find({}, { projection: { name: 1, rank: 1, _id: 0 } }).toArray();
  console.log(all.map((p) => `${p.rank}  ${p.name}`).join("\n"));
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

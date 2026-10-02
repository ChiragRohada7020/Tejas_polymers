import { config } from "dotenv";
import mongoose from "mongoose";
config({ path: ".env.local", quiet: true });

/**
 * Seeds Marathi copy for categories and products.
 *
 * SCOPE: name + shortDescription only.
 *
 * The long `description` field is deliberately left untranslated, so it keeps
 * falling back to the English text the owner already wrote. Overwriting it
 * with a newly written Marathi paragraph would silently discard real product
 * copy the site has been selling with for months, and nothing in this file
 * knows what that copy says. The long descriptions should be translated by
 * the owner and entered through the admin UI, which now saves them per
 * language.
 *
 * Product NAMES keep the Krusheebindoo brand in Latin and translate only the
 * descriptive part, because that is how dealers search and how the trade
 * writes the product on paper. Specs keep their Latin notation (4 LPH,
 * Class 2, 120 mesh) for the same reason.
 *
 * Idempotent: re-running overwrites the mr fields with the same values.
 */

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/agrigrid";

const CATEGORIES: { slug: string; nameMr: string }[] = [
  { slug: "flat-inline-drip", nameMr: "फ्लॅट इनलाइन ठिबक" },
  { slug: "online-drip-emitters", nameMr: "ऑनलाइन ठिबक व एमिटर" },
  { slug: "filters", nameMr: "फिल्टर" },
  { slug: "fittings-accessories", nameMr: "फिटिंग्ज व उपकरणे" },
];

const PRODUCTS: { slug: string; name: string; shortDescription: string }[] = [
  {
    slug: "krusheebindoo-flat-inline-drip-12mm-4lph-40cm",
    name: "कृष्हीबिंडू फ्लॅट इनलाइन ठिबक १२ मिमी - ४ LPH - ४० सें.मी.",
    shortDescription:
      "१२ मिमी IS 13488 फ्लॅट इनलाइन ठिबक लेटरल, Class 2, ४० सें.मी. अंतरावर ४ LPH एमिटर. ५००० मीटर रोल.",
  },
  {
    slug: "krusheebindoo-flat-inline-drip-16mm-4lph-30cm",
    name: "कृष्हीबिंडू फ्लॅट इनलाइन ठिबक १६ मिमी - ४ LPH - ३० सें.मी.",
    shortDescription:
      "१६ मिमी IS 13488 फ्लॅट इनलाइन ठिबक लेटरल, Class 2, ३० सें.मी. अंतरावर ४ LPH एमिटर. ५००० मीटर रोल.",
  },
  {
    slug: "krusheebindoo-flat-inline-drip-16mm-4lph-40cm",
    name: "कृष्हीबिंडू फ्लॅट इनलाइन ठिबक १६ मिमी - ४ LPH - ४० सें.मी.",
    shortDescription:
      "सर्वाधिक वापरले जाणारे १६ मिमी इनलाइन लेटरल: ४० सें.मी. अंतरावर ४ LPH, Class 2, ५००० मीटर रोल.",
  },
  {
    slug: "krusheebindoo-flat-inline-drip-20mm-4lph-60cm",
    name: "कृष्हीबिंडू फ्लॅट इनलाइन ठिबक २० मिमी - ४ LPH - ६० सें.मी.",
    shortDescription:
      "जडदार २० मिमी फ्लॅट इनलाइन लेटरल, मोठ्या ओळींच्या पिकांसाठी व लांव पावल्यांसाठी ६० सें.मी. अंतरावर ४ LPH.",
  },
  {
    slug: "krusheebindoo-online-dripper-4lph-16mm",
    name: "कृष्हीबिंडू ऑनलाइन ड्रिपर ४ LPH - १६ मिमी",
    shortDescription:
      "IS 13487 प्रमाणित ऑनलाइन ड्रिपर, १६ मिमी बार्बवर ४ LPH. काळा किंवा निळा, एकच नळी.",
  },
  {
    slug: "krusheebindoo-online-dripper-8lph-16mm",
    name: "कृष्हीबिंडू ऑनलाइन ड्रिपर ८ LPH - १६ मिमी",
    shortDescription:
      "IS 13487 प्रमाणित ऑनलाइन ड्रिपर, १६ मिमी बार्बवर ८ LPH. पक्व झालेल्या व मोठ्या अंतरावरील पिकांसाठी.",
  },
  {
    slug: "krusheebindoo-pc-online-emitter-8lph",
    name: "कृष्हीबिंडू पीसी ऑनलाइन एमिटर ८ LPH - दाब-भरित",
    shortDescription:
      "दाब-भरित ऑनलाइन एमिटर, ८ LPH. उतारावर व लांब पावल्यांवरही स्थिर प्रवाह.",
  },
  {
    slug: "krusheebindoo-inline-screen-filter-2-inch",
    name: "कृष्हीबिंडू इनलाइन स्क्रीन फिल्टर - २ इंच निळा",
    shortDescription:
      "२ इंच निळा इनलाइन स्क्रीन फिल्टर, १२० मेश. बंद होण्यापासून सुरक्षेची पहिली ओळ.",
  },
  {
    slug: "krusheebindoo-disc-filter-2-inch",
    name: "कृष्हीबिंडू डिस्क फिल्टर - २ इंच काळा",
    shortDescription:
      "२ इंच काळा डिस्क फिल्टर, स्वयं-स्वच्छ होणारा स्टॅक. अल्गी व जड सेंद्रिय पदार्थांचा भार सहन करतो.",
  },
  {
    slug: "krusheebindoo-plain-drip-lateral-16mm",
    name: "कृष्हीबिंडू साधा ठिबक लेटरल १६ मिमी (एमिटरशिवाय)",
    shortDescription:
      "IS 12786 प्रमाणित १६ मिमी साधा लेटरल पाइप, Class 2, १.१-१.३ मिमी भिंत. ऑनलाइन ड्रिपर्ससोबत वापरा.",
  },
  {
    slug: "krusheebindoo-take-off-connector-valve-16mm",
    name: "कृष्हीबिंडू टेक-ऑफ कनेक्टर व्हाव्हसह - १६ मिमी",
    shortDescription:
      "१६ मिमी टेक-ऑफ कनेक्टर, ३/४ इंच पुरुष स्क्रू व एकात्म बॉल व्हाव्हसह. हेडरसाठीनेहमीचा फिटिंग.",
  },
  {
    slug: "krusheebindoo-lateral-cock-ball-valve-half-inch",
    name: "कृष्हीबिंडू लेटरल कॉक / बॉल व्हाव्ह - १/२ इंच",
    shortDescription:
      "१/२ इंच स्क्रू बॉल व्हाव्ह, सब-मेन व मॅनिफोल्डसाठी. फुल बोअर, चतुर्थांश फिरतीली बंद करणे.",
  },
  {
    slug: "krusheebindoo-lateral-grommet-16mm",
    name: "कृष्हीबिंडू लेटरल ग्रोमेट - १६ मिमी",
    shortDescription:
      "पॉली किंवा HDPE मेनमध्ये १६ मिमी टेक-ऑफ बसवणारे रबर ग्रोमेट. गळती टाळते व ओघळणे थांबवते.",
  },
  {
    slug: "krusheebindoo-end-cap-16mm",
    name: "कृष्हीबिंडू एंड कॅप - १६ मिमी",
    shortDescription:
      "१६ मिमी एंड कॅप, बार्ब प्लगसह. लेटरलच्या टोकाला बंद करते; गळती व मातीची घुसणे थांबवते.",
  },
  {
    slug: "krusheebindoo-drip-hole-punch-16mm",
    name: "कृष्हीबिंडू ड्रिप होल पंच - १६ मिमी",
    shortDescription:
      "साध्या लेटरलमध्ये ऑनलाइन ड्रिपर्स स्वच्छ बसवण्यासाठी अचूक १६ मिमी होल पंच.",
  },
];

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 20_000 });
  const db = mongoose.connection.db!;

  let updatedCategories = 0;
  for (const c of CATEGORIES) {
    const r = await db
      .collection("categories")
      .updateOne({ slug: c.slug }, { $set: { nameMr: c.nameMr } });
    if (r.matchedCount === 0) console.warn(`  ! no category matched slug "${c.slug}"`);
    else updatedCategories += 1;
  }
  console.log(`categories translated: ${updatedCategories}/${CATEGORIES.length}`);

  let updatedProducts = 0;
  const missing: string[] = [];
  for (const p of PRODUCTS) {
    const r = await db.collection("products").updateOne(
      { slug: p.slug },
      {
        $set: {
          mr: {
            name: p.name,
            shortDescription: p.shortDescription,
            // Left empty on purpose: falls back to the English long
            // description rather than replacing real copy with new text.
            description: "",
          },
        },
      }
    );
    if (r.matchedCount === 0) missing.push(p.slug);
    else updatedProducts += 1;
  }
  console.log(`products translated: ${updatedProducts}/${PRODUCTS.length}`);
  if (missing.length) {
    console.warn(`  ! slugs not found in database: ${missing.join(", ")}`);
  }

  // Report anything still untranslated, so the remaining gap is visible
  // rather than assumed to be zero.
  const untranslated = await db
    .collection("products")
    .find({ "mr.name": { $in: [null, ""] } })
    .project({ slug: 1 })
    .toArray();
  console.log(`\nproducts still without a Marathi name: ${untranslated.length}`);
  for (const p of untranslated) console.log(`  - ${p.slug}`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});

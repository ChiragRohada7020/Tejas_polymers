export const SITE_NAME = "Tejas Polymers";
/** Consumer-facing brand shown in the header/wordmark and product names. */
export const BRAND_NAME = "Krusheebindoo";
export const SITE_TAGLINE = "Smart Irrigation… Better Tomorrow…";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tejaspolymers.co.in";

export const SITE_DESCRIPTION =
  "Krusheebindoo by Tejas Polymers manufactures the full range of inline and online drip irrigation products from Pachora, Jalgaon, Maharashtra. IS 13488 certified flat inline drip laterals, on-line emitters, filters and fittings that cut irrigation water use by up to 60%.";

/**
 * Marathi equivalents of the above, for the default locale.
 *
 * These feed <title>/description/hreflang, so they are part of the SEO
 * surface rather than decoration: a Marathi searcher searching in Marathi
 * should get a Marathi result snippet. Transliterated product names are
 * deliberately kept in Latin where that is how the trade actually writes them.
 */
export const SITE_DESCRIPTION_MR =
  "तेजा पॉलिमर्सचे कृष्हीबिंडू हे पाचोरा, जळगाव, महाराष्ट्रातीन इनलाइन व ऑनलाइन ठिबक सिंचन उत्पादनांची संपूर्ण श्रृंखला तयार करते. IS 13488 प्रमाणित फ्लॅट इनलाइन ठिबक लेटरल (12 मिमी व 16 मिमी), ऑनलाइन एमिटर, फिल्टर व फिटिंग्ज — सिंचनाच्या पाण्याची ६०% पर्यंत बचत करणारे.";

export const CONTACT = {
  email: "tejaspolymers0101@gmail.com",
  /** Used in email templates for the "Browse our products" CTA. */
  website: "https://www.tejaspolymers.co.in",
  phone: "+91 80803 37813",
  address:
    "Survey No. 152/3, Behind Sugaran Dairy, Goradakheda, Tal. Pachora, Dist. Jalgaon, Maharashtra 424201",
  street: "Survey No. 152/3, Behind Sugaran Dairy, Goradakheda",
  locality: "Pachora",
  region: "Maharashtra",
  postalCode: "424201",
  country: "IN",
  // Approximate coordinates for Goradakheda, Pachora, Jalgaon district, Maharashtra.
  latitude: 20.2589,
  longitude: 75.3556,
};

/** Local-SEO: areas served around Pachora / Jalgaon district. */
export const AREA_SERVED = [
  "Pachora",
  "Jalgaon",
  "Jalgaon district",
  "Dhule",
  "Nandurbar",
  "Maharashtra",
];

export const OPENING_HOURS = [
  "Mo-Sa 09:00-18:00",
  "Su 09:00-13:00",
];

/** Primary local-SEO keywords for the home page. */
export const KEYWORDS = [
  "drip irrigation manufacturer",
  "drip irrigation manufacturer in Maharashtra",
  "inline drip suppliers",
  "flat inline drip 16mm",
  "online drip emitter supplier",
  "IS 13488 certified drip pipe",
  "drip irrigation products Pachora",
  "drip irrigation supplier Jalgaon",
  "agriculture drip pipe manufacturer",
  "Krusheebindoo drip irrigation",
  "Tejas Polymers",
  "disc filter and screen filter supplier",
  "drip irrigation fittings and accessories",
  "water saving irrigation equipment",
  "farm irrigation equipment distributor",
];

/**
 * Marathi keyword set for the default locale.
 *
 * Mixes Marathi and Latin product terms deliberately: an actual Marathi
 * dealer types "फ्लॅट इनलाइन ठिबक" but also "IS 13488" and brand names, so
 * covering both is what real query logs look like. Kept separate from
 * KEYWORDS rather than merged, because mixing both languages into one tag
 * list on a single URL would tell Google the page targets both at once.
 */
export const KEYWORDS_MR = [
  "ठिबक सिंचन निर्माता",
  "ठिबक सिंचन उपकरण पुरवठादार महाराष्ट्र",
  "फ्लॅट इनलाइन ठिबक 16 मिमी",
  "फ्लॅट इनलाइन ठिबक 12 मिमी",
  "ऑनलाइन एमिटर पुरवठा",
  "IS 13488 प्रमाणित ठिबक पाइप",
  "पाचोरा ठिबक सिंचन उत्पादने",
  "जळगाव ठिबक सिंचन पुरवठादार",
  "कृष्हीबिंडू ठिबक सिंचन",
  "तेजा पॉलिमर्स",
  "डिस्क फिल्टर आणि स्क्रीन फिल्टर",
  "ठिबक सिंचण फिटिंग्ज",
  "पाणी वाचवणारे सिंचन उपकरण",
  "शेती सिंचन उपकरण वितरक",
];

import type { Locale } from "@/lib/i18n";

/**
 * Fixed UI chrome, in code rather than in the SiteContent store.
 *
 * The editable content store is for marketing copy an admin might reasonably
 * want to reword. Strings like "View Details" or "Search" are structural
 * labels that nobody will ever edit, and putting 40 of them in the database
 * would mean 40 more rows to translate, review and keep in sync for no
 * benefit. They live here, fully typed, so a missing translation is a
 * compile-time concern instead of a runtime blank.
 */
const STRINGS = {
  // Footer
  footerProducts: { en: "Products", mr: "उत्पादने" },
  footerCompany: { en: "Company", mr: "कंपनी" },
  footerContact: { en: "Contact", mr: "संपर्क" },
  footerAbout: { en: "About Us", mr: "आमच्याबद्दल" },
  footerBecomeDistributor: {
    en: "Become a Distributor",
    mr: "डिस्ट्रिब्यूटर व्हा",
  },
  footerBlog: { en: "Guides & Articles", mr: "मार्गदर्शक व लेख" },
  allRightsReserved: { en: "All rights reserved.", mr: "सर्व हक्क राखीव." },

  // Footer catalogue shortcuts. Duplicated from the Category collection on
  // purpose: the footer is a static shortcut list that must render even if a
  // category is renamed or archived, and it has no category data to hand.
  catFlatInlineDrip: { en: "Flat Inline Drip", mr: "फ्लॅट इनलाइन ठिबक" },
  catOnlineDrip: { en: "Online Drip & Emitters", mr: "ऑनलाइन ठिबक व एमिटर" },
  catFilters: { en: "Filters", mr: "फिल्टर" },
  catFittings: { en: "Fittings & Accessories", mr: "फिटिंग्ज व उपकरणे" },

  // Breadcrumbs / nav
  breadcrumbHome: { en: "Home", mr: "मुख्यपृष्ठ" },
  breadcrumbProducts: { en: "Products", mr: "उत्पादने" },

  // Product card
  // "निवडक" (selected/chosen) rather than "वैशिष्ट्यपूर्ण" (distinctive): the
  // badge and the section heading it sits under should use the same word.
  featured: { en: "Featured", mr: "निवडक" },
  bulkOrdersWelcome: { en: "Bulk orders welcome", mr: "मोठ्या ऑर्डरचे स्वागत" },
  viewDetails: { en: "View Details", mr: "तपशील पहा" },
  moq: { en: "MOQ", mr: "किमान ऑर्डर" },

  // Product list
  allProducts: { en: "All Products", mr: "सर्व उत्पादने" },
  searchPlaceholder: { en: "Search products...", mr: "उत्पादने शोधा..." },
  search: { en: "Search", mr: "शोधा" },
  noProductsMatch: {
    en: "No products match your search.",
    mr: "तुमच्या शोधाशी जुळणारे उत्पादन नाही.",
  },
  browseAllProducts: { en: "browse all products", mr: "सर्व उत्पादने पहा" },
  productNotFound: { en: "Product not found", mr: "उत्पादन सापडले नाही" },
  dripIrrigationProduct: { en: "Drip Irrigation Product", mr: "ठिबक सिंचन उत्पादन" },

  // Product detail
  productDescription: { en: "Product Description", mr: "उत्पादन वर्णन" },
  fullSpecifications: { en: "Full Specifications", mr: "संपूर्ण तपशील" },
  relatedProducts: { en: "Related Products", mr: "संबंधित उत्पादने" },
  price: { en: "Price", mr: "किंमत" },
  mrpExWorks: { en: "M.R.P. (ex-works)", mr: "एम.आर.पी. (एक्स-वर्क्स)" },
  contactForPricing: {
    en: "Contact us for pricing",
    mr: "किंमतीसाठी आमच्याशी संपर्क साधा",
  },
  minimumOrder: { en: "Minimum order", mr: "किमान ऑर्डर" },
  specifications: { en: "Specifications", mr: "तपशील" },

  // Shared
  notFoundTitle: { en: "Page not found", mr: "पृष्ठ सापडले नाही" },
  backToHome: { en: "Back to home", mr: "मुख्यपृष्ठावर जा" },
  viewProducts: { en: "View products →", mr: "उत्पादने पहा →" },

  // Category cards on the home page
  catFlatInlineDripBody: {
    en: "IS 13488 flat inline drip laterals with factory-fixed emitters. 12 mm and 16 mm, Class 2, 4 LPH, in 30/40/60 cm spacing — delivered in 5000 m rolls.",
    mr: "कारखान्यातच बसवलेल्या एमिटरसह IS 13488 प्रमाणित फ्लॅट इनलाइन ठिबक लेटरल. १२ मिमी व १६ मिमी, Class 2, ४ LPH, ३०/४०/६० सें.मी. अंतरावर — ५००० मीटर रोलमध्ये.",
  },
  catOnlineDripBody: {
    en: "On-line drippers and pressure-compensating (PC) emitters to IS 13487, plus plain laterals without emitters. Ideal for orchards, polyhouses and widely spaced crops.",
    mr: "IS 13487 प्रमाणित ऑनलाइन ड्रिपर्स व दाब-भरित (PC) एमिटर, तसेच एमिटरशिवाय साधे लेटरल. फळपिकांच्या बागांसाठी, पॉलीहाउसमध्ये व मोठ्या अंतरावरील पिकांसाठी आदर्श.",
  },
  catFiltersBody: {
    en: "Screen and disc filters that protect your emitters from silt, algae and chemical residue. The single most important component for a clogging-free drip system.",
    mr: "गाळ, अल्गी व रासायनिक अवशेषांपासून तुमच्या एमिटरचे रक्षण करणारे स्क्रीन व डिस्क फिल्टर. बंद होऊ नये या ठिबक सिस्टमसाठी सर्वात महत्त्वाचा भाग.",
  },
  catFittingsBody: {
    en: "Take-off connectors with valves, grommets, end caps, lateral cocks, ball valves and drip hole punchers to complete any layout.",
    mr: "कोणतीही रचना पूर्ण करण्यासाठी व्हाव्हसह टेक-ऑफ कनेक्टर, ग्रोमेट, एंड कॅप, लेटरल कॉक, बॉल व्हाव्ह व ड्रिप होल पंच.",
  },

  // Contact block
  labelEmail: { en: "Email", mr: "ईमेल" },
  labelPhoneWhatsApp: { en: "Phone / WhatsApp", mr: "फोन / व्हॉट्सॅप" },
  labelFactoryAddress: { en: "Factory Address", mr: "कारखान्याचा पत्ता" },
  labelWorkingHours: { en: "Working Hours", mr: "कामाची वेळ" },

  // Inquiry / distributor form
  formFullName: { en: "Full Name *", mr: "पूर्ण नाव *" },
  formYourName: { en: "Your name", mr: "तुमचे नाव" },
  formCompanyFirm: { en: "Company / Firm Name", mr: "कंपनी / फर्मचे नाव" },
  formCompanyOptional: { en: "Company (optional)", mr: "कंपनी (ऐच्छिक)" },
  formCompanyName: { en: "Company name", mr: "कंपनीचे नाव" },
  formDistributeIn: {
    en: "Country / Region you want to distribute in *",
    mr: "तुम्हाला वितरण करायचा देश / विभाग *",
  },
  formDistributeExample: {
    en: "e.g. Kenya, Punjab (India), Brazil",
    mr: "उदा. केनिया, पंजाब (भारत), ब्राझील",
  },
  formCountryOptional: { en: "Country (optional)", mr: "देश (ऐच्छिक)" },
  formYourCountry: { en: "Your country", mr: "तुमचा देश" },
  formTellBusiness: { en: "Tell us about your business *", mr: "तुमच्या व्यवसायाबद्दल सांगा *" },
  formMessage: { en: "Message *", mr: "संदेश *" },
  formBusinessPlaceholder: {
    en: "Existing business, customer network, years in agri trade, brands you carry...",
    mr: "सध्याचा व्यवसाय, ग्राहकांचे जाळे, कृषी व्यापारातील अनुभव, तुमच्याकडील ब्रँड...",
  },
  formMessagePlaceholder: {
    en: "Tell us what you need — quantities, product models, delivery location...",
    mr: "तुम्हाला काय हवे आहे ते सांगा — प्रमाण, उत्पादन मॉडेल, पत्त्याची जागा...",
  },
  formSending: { en: "Sending...", mr: "पाठवत आहे..." },
  formApplyDistributor: {
    en: "Apply to Become a Distributor",
    mr: "डिस्ट्रिब्यूटर व्हायचे अर्ज करा",
  },
  formSendInquiry: { en: "Send Inquiry", mr: "चौकशी पाठवा" },
  formThankYou: { en: "Thank you!", mr: "धन्यवाद!" },
  formSuccessDistributor: {
    en: "Your distributor application has been received. Our sales team will get back to you within 1–2 business days.",
    mr: "तुमचा डिस्ट्रिब्यूटर अर्ज मिळाला आहे. आमची विक्री टीम १–२ कार्यदिवसांत तुमच्याशी संपर्क साधेल.",
  },
  formSuccessGeneral: {
    en: "Your inquiry has been received. Our sales team will get back to you within 1–2 business days.",
    mr: "तुमची चौकशी मिळाली आहे. आमची विक्री टीम १–२ कार्यदिवसांत तुमच्याशी संपर्क साधेल.",
  },
  formSendAnother: { en: "Send another message", mr: "दुसरा संदेश पाठवा" },
  formError: {
    en: "Something went wrong. Please try again.",
    mr: "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
  },
  openMenu: { en: "Open navigation menu", mr: "नेव्हिगेशन मेनू उघडा" },
  closeMenu: { en: "Close navigation menu", mr: "नेव्हिगेशन मेनू बंद करा" },
  labelVideoPlay: { en: "Play", mr: "चालवा" },
  labelVideoPause: { en: "Pause", mr: "थांबवा" },
  labelVideoUnmute: { en: "Unmute", mr: "आवाज चालू करा" },
  labelVideoMute: { en: "Mute", mr: "आवाज बंद करा" },
  labelBackgroundVideo: { en: "Background video", mr: "पार्श्वभूमीचा व्हिडिओ" },
  labelCompanyVideo: { en: "Company video", mr: "कंपनीचा व्हिडिओ" },

  // Blog / guides. Structural chrome only - the article copy itself lives in
  // src/lib/blog.ts, because it is content, not a UI label.
  breadcrumbBlog: { en: "Guides", mr: "मार्गदर्शक" },
  blogAllPosts: { en: "All guides", mr: "सर्व मार्गदर्शक" },
  blogBackToIndex: { en: "Back to all guides", mr: "सर्व मार्गदर्शकांकडे परत" },
  blogFaqTitle: { en: "Common questions", mr: "वारंवार विचारले जाणारे प्रश्न" },
  blogSpecsTitle: { en: "Specifications at a glance", mr: "एका दृष्टीक्षेपात तपशील" },
  blogRelatedTitle: { en: "Related guides", mr: "संबंधित मार्गदर्शक" },
  blogProductCtaTitle: { en: "See the product", mr: "उत्पादन पहा" },
  blogProductCtaBody: {
    en: "Full specifications, minimum order quantity and pricing for this product.",
    mr: "या उत्पादनाचे संपूर्ण तपशील, किमान ऑर्डर व किंमत.",
  },
  blogProductCtaButton: { en: "View product", mr: "उत्पादन पहा" },
  blogNotFound: { en: "Guide not found", mr: "मार्गदर्शक सापडला नाही" },
  blogNoPosts: { en: "No guides published yet.", mr: "अजून कोणताही मार्गदर्शक प्रकाशित नाही." },
} as const;

export type StringKey = keyof typeof STRINGS;

export function ui(key: StringKey, locale: Locale): string {
  return STRINGS[key][locale] ?? STRINGS[key].en;
}

/**
 * Home-page category blurbs, keyed by category slug.
 *
 * These are the four range descriptions shown on the home page. They live in
 * code as the Marathi default for the same reason MARATHI_DEFAULTS does: the
 * English text still comes from the Category collection, and this only
 * supplies the translation. `fallback` is the English description from the
 * database, so a category that is added later without an entry here still
 * renders its English copy instead of an empty card.
 */
const CATEGORY_BODY_KEY: Record<string, StringKey> = {
  "flat-inline-drip": "catFlatInlineDripBody",
  "online-drip-emitters": "catOnlineDripBody",
  filters: "catFiltersBody",
  "fittings-accessories": "catFittingsBody",
};

export function categoryBody(
  slug: string,
  locale: Locale,
  fallback: string
): string {
  const key = CATEGORY_BODY_KEY[slug];
  if (key && locale === "mr") return ui(key, locale);
  return fallback;
}

/**
 * Spec row LABELS, translated.
 *
 * Spec VALUES ("10 bar", "1.1 - 1.3 mm", "Class 2") are numbers, units and
 * standards - identical in both languages, so they are left alone. Spec KEYS
 * are prose ("Max Working Pressure") and would otherwise leave a product
 * detail page half in English.
 *
 * They are admin-authored free text stored in `product.specs`, so an unknown
 * key falls through to the original English rather than disappearing.
 */
const SPEC_LABELS: Record<string, string> = {
  Action: "कृती",
  "Best For": "सर्वोत्तम वापर",
  Body: "बॉडी",
  Class: "वर्ग",
  Colours: "रंग",
  "Compensation Range": "क्षतिपूर्ती क्षेत्र",
  Diameter: "व्यास",
  "Diameter (outer)": "बाह्य व्यास",
  Discharge: "प्रवाह",
  Element: "घटक",
  Elements: "घटक",
  "Emitter Discharge": "एमिटर प्रवाह",
  "Emitter Spacing": "एमिटर अंतर",
  Ends: "टोके",
  Filtration: "गाळ-निवारण",
  Fits: "बसते",
  "Flow Rate": "प्रवाह दर",
  "Hole Size": "छिद्राचा आकार",
  Inlet: "इनलेट",
  "Lateral Size": "लेटरल आकार",
  "M.R.P. (per roll)": "एम.आर.पी. (प्रति रोल)",
  Markings: "चिन्हांकन",
  Material: "साहित्य",
  "Max Working Pressure": "कमाल कार्य दाब",
  "Mesh Rating": "मेश रेटिंग",
  "Operating Pressure": "कार्य दाब",
  Operation: "कार्यपद्धती",
  Outlets: "आउटलेट",
  Packing: "पॅकिंग",
  "Roll Length": "रोलची लांबी",
  Seal: "सील",
  Size: "आकार",
  "Size (inlet/outlet)": "आकार (इनलेट/आउटलेट)",
  Standard: "मानक",
  "Sub-main Thread": "सब-मेन स्क्रू",
  Type: "प्रकार",
  Use: "वापर",
  Valve: "व्हाव्ह",
  "Wall Thickness": "भिंतीची जाडी",
  "Working Pressure": "कार्य दाब",
};

export function specLabel(key: string, locale: Locale): string {
  if (locale === "mr") return SPEC_LABELS[key] ?? key;
  return key;
}

/**
 * The price column holds a real string per product, and 13 of the 15 are the
 * English sentinel "Contact for pricing" rather than a number.
 *
 * Translating it at render time beats adding a `priceMr` field: the sentinel
 * carries no information a second field could hold, and a genuine price like
 * "Rs.4,585 per 5000 m roll" still passes through untouched.
 */
const PRICE_SENTINEL = "Contact for pricing";

export function priceLabel(price: string | undefined, locale: Locale): string {
  if (price && price.trim() === PRICE_SENTINEL) {
    return locale === "mr" ? "किंमतीसाठी संपर्क साधा" : price;
  }
  return price || ui("contactForPricing", locale);
}

/**
 * Minimum-order quantities ("1000 pieces", "1 roll (5000 m)").
 *
 * Only the unit words are swapped; the digits are left alone, since
 * transliterating numerals would make the quantity harder to scan against
 * a price list than it helps.
 */
const UNIT_REPLACEMENTS: [RegExp, string][] = [
  [/\broll\b/g, "रोल"],
  [/\brolls\b/g, "रोल"],
  [/\bpieces\b/g, "नग"],
  [/\bpacks\b/g, "पॅक"],
  [/\bpack\b/g, "पॅक"],
];

export function minOrderLabel(value: string, locale: Locale): string {
  if (locale !== "mr") return value;
  let out = value;
  for (const [pattern, replacement] of UNIT_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

/**
 * "{n} products found" with the count interpolated.
 *
 * Marathi pluralisation is not a simple suffix rule the way English's
 * -/+ "s" is, and a hand-rolled singular/plural split would be wrong for
 * every n that is not 1. "N उत्पादने सापडली" is the idiomatic form used by
 * real Marathi e-commerce sites across the full range, so one form is both
 * simpler and more correct than a broken two-case rule.
 */
export function productsFound(count: number, locale: Locale): string {
  if (locale === "mr") {
    return `${count} उत्पादने सापडली`;
  }
  return `${count} product${count === 1 ? "" : "s"} found`;
}

/** `for "query"` suffix on the results count. */
export function productsFoundFor(count: number, query: string, locale: Locale): string {
  if (!query) return productsFound(count, locale);
  return locale === "mr"
    ? `${productsFound(count, locale)} — “${query}” साठी`
    : `${productsFound(count, locale)} for “${query}”`;
}
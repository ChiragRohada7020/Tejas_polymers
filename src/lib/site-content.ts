import { connectDB } from "@/lib/db";
import { BRAND_NAME, CONTACT, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { LOCALES, type Locale } from "@/lib/i18n";

export type ContentKind = "text" | "rich" | "image" | "link";

export type ContentDef = {
  key: string;
  kind: ContentKind;
  maxLength: number;
  defaultValue: string;
};

const T = (key: string, defaultValue: string, maxLength = 300): ContentDef => ({
  key,
  kind: "text",
  maxLength,
  defaultValue,
});

const R = (key: string, defaultValue: string, maxLength = 2000): ContentDef => ({
  key,
  kind: "rich",
  maxLength,
  defaultValue,
});

const I = (key: string, defaultValue = "", maxLength = 500): ContentDef => ({
  key,
  kind: "image",
  maxLength,
  defaultValue,
});

const L = (key: string, defaultValue: string, maxLength = 500): ContentDef => ({
  key,
  kind: "link",
  maxLength,
  defaultValue,
});

export const CONTENT_DEFS: ContentDef[] = [
  I("brand.logoImage", ""),
  T("brand.logoAlt", `${BRAND_NAME} logo`, 160),
  T("brand.wordmarkStart", "Krushee", 40),
  T("brand.wordmarkEnd", "bindoo", 40),
  T("header.nav.home.label", "Home", 40),
  L("header.nav.home.href", "/"),
  T("header.nav.products.label", "Products", 40),
  L("header.nav.products.href", "/products"),
  T("header.nav.about.label", "About Us", 60),
  L("header.nav.about.href", "/about"),
  T("header.nav.distributor.label", "Become a Distributor", 60),
  L("header.nav.distributor.href", "/become-a-distributor"),
  T("header.nav.contact.label", "Contact", 40),
  L("header.nav.contact.href", "/contact"),
  T("header.cta.label", "Get a Quote", 60),
  L("header.cta.href", "/contact"),
  T("home.heroBadge", "Krusheebindoo - IS 13488 certified - Manufactured in Jalgaon, Maharashtra", 160),
  T("home.heroTitleMain", "Every Drop, Straight to", 160),
  T("home.heroTitleAccent", "The Root Zone", 80),
  R(
    "home.heroBody",
    "Krusheebindoo by Tejas Polymers manufactures the full range of inline and online drip irrigation products: flat inline laterals to IS 13488, on-line emitters, filters and fittings. Up to 60% less water, delivered exactly where the plant needs it."
  ),
  T("home.primaryCtaLabel", "Browse Products", 80),
  L("home.primaryCtaHref", "/products"),
  T("home.secondaryCtaLabel", "Become a Distributor", 80),
  L("home.secondaryCtaHref", "/become-a-distributor"),
  T("home.stats.0.value", "60%", 20),
  T("home.stats.0.label", "Up to Water Saved", 80),
  T("home.stats.1.value", "IS 13488", 20),
  T("home.stats.1.label", "Certified Standard", 80),
  T("home.stats.2.value", "5000m", 20),
  T("home.stats.2.label", "Roll Length", 80),
  T("home.stats.3.value", "4 LPH", 20),
  T("home.stats.3.label", "Uniform Discharge", 80),
  T("home.categoriesEyebrow", "Product Range", 80),
  T("home.categoriesTitle", "Everything a Drip System Needs", 120),
  R(
    "home.categoriesBody",
    "Four specialist ranges manufactured in-house: laterals, emitters, filters and the fittings that hold a system together."
  ),
  T("home.featuredEyebrow", "Featured Products", 80),
  T("home.featuredTitle", "Our Best Sellers", 120),
  R(
    "home.featuredBody",
    "Our most reordered equipment - proven in the field and stocked by dealers across the region."
  ),
  T("home.whyTitle", "Why Growers Choose Krusheebindoo", 140),
  T("home.why.0.title", "Up to 60% Less Water", 100),
  R("home.why.0.text", "Water goes to the root zone, not across the row. Less water drawn, less power spent pumping it, and nothing lost to evaporation between plants."),
  T("home.why.1.title", "IS 13488 Certified", 100),
  R("home.why.1.text", "Every lateral is made to IS 13488:2008 in Class 2 LDPE with UV stabilisation, so discharge stays true at 4 LPH season after season."),
  T("home.why.2.title", "Uniform Wetting", 100),
  R("home.why.2.text", "Factory-fixed emitters at 30, 40 or 60 cm give every plant the same measured dose. No wet patches and no dry corners along the row."),
  T("home.why.3.title", "Built for Indian Farms", 100),
  R("home.why.3.text", "Made for the soils, water quality and long sunny seasons of Maharashtra, and for the budgets of the farmers who work them."),
  R(
    "home.testimonialQuote",
    "Krusheebindoo changed how we irrigate. Water use came down, the yield is more even across the block, and a 5000 m roll goes a long way for the price."
  ),
  T("home.testimonialAttribution", "Grower, Jalgaon region", 160),
  T("home.ctaTitle", "Cut Your Water Bill This Season", 140),
  R(
    "home.ctaBody",
    "Tell us your crop, area and plant spacing, and we will recommend the right lateral, emitter spacing and filter, with distributor pricing for dealers."
  ),
  T("home.ctaButton", "Request a Recommendation", 80),
  R(
    "footer.aboutBlurb",
    "Krusheebindoo by Tejas Polymers manufactures inline and online drip irrigation products to IS 13488, from our works in Goradakheda, Pachora, Jalgaon."
  ),
  T("footer.contact.email", CONTACT.email, 160),
  T("footer.contact.phone", CONTACT.phone, 80),
  T("footer.contact.address", CONTACT.address, 300),
  T("contact.heroTitle", "Get in Touch", 120),
  R(
    "contact.heroBody",
    "Questions on product specs, bulk pricing or distributorship? Call us on 80803 37813 or send a message and we will reply within 1-2 business days."
  ),
  T("contact.infoTitle", "Contact Information", 120),
  T("contact.hours", "Mon - Sat, 9:00 AM - 6:00 PM IST", 120),
  T("contact.distributorTitle", "Looking to become a distributor?", 140),
  R("contact.distributorBody", "Use our dedicated application form for faster processing."),
  T("contact.distributorCta", "Become a Distributor", 80),
  T("contact.formTitle", "Send us a message", 120),
  R("contact.formBody", "Fill in the form with your crop, area and requirement, and our team will come back with pricing and availability."),

  // About Page
  T("about.heroTitle", "Manufacturers of Drip. Steward of Every Drop.", 140),
  R(
    "about.heroBody",
    "Krusheebindoo is the drip irrigation brand of Tejas Polymers — a manufacturer of the full range of inline and online drip products at Goradakheda, Pachora, in Jalgaon district, Maharashtra."
  ),
  T("about.storyTitle", "Our Story", 120),
  R(
    "about.storyBody",
    "<p>Tejas Polymers manufactures the Krusheebindoo range of inline and online drip irrigation products from our works at Survey No. 152/3, behind Sugaran Dairy, Goradakheda, Pachora. We produce flat inline drip laterals to IS 13488, on-line drippers and pressure-compensating emitters, screen and disc filters, and the fittings that complete a system.</p><p class=\"mt-4\">Maharashtra farms know the problem well: water is not always there when the crop needs it, and what is pumped is not always used by the plant. Our answer is simple engineering — a measured 4 litres per hour, delivered at the root zone, repeated evenly along the row. Done properly, that is where the water savings come from, and the savings show up in the power bill as much as in the yield.</p><p class=\"mt-4\">Every roll leaves our line checked and marked to standard, because a blocked emitter is the difference between a system that pays for itself and one that disappoints the farmer who bought it.</p>"
  ),
  T("about.stats.0.value", "IS 13488", 30),
  T("about.stats.0.label", "Certified standard", 60),
  T("about.stats.1.value", "60%", 30),
  T("about.stats.1.label", "Up to water saved", 60),
  T("about.stats.2.value", "5000m", 30),
  T("about.stats.2.label", "Roll length", 60),
  T("about.stats.3.value", "4 LPH", 30),
  T("about.stats.3.label", "Emitter discharge", 60),
  T("about.valuesTitle", "What We Stand For", 120),
  T("about.values.0.title", "Field-First Engineering", 100),
  R("about.values.0.text", "Our sizing follows what growers actually plant — grape and pomegranate at 30 cm, sugarcane and cotton at 40 to 60 cm. A spec that suits the crop beats a spec that is simply bigger."),
  T("about.values.1.title", "Built to IS 13488", 100),
  R("about.values.1.text", "Class 2 UV-stabilised LDPE, tested discharge and a controlled wall thickness, so a roll bought this season still delivers 4 LPH three seasons from now."),
  T("about.values.2.title", "Whole-System Supply", 100),
  R("about.values.2.text", "Laterals, emitters, filters and fittings from one manufacturer, so every part in the block shares one pressure regime and one point of accountability."),
  T("about.factoryCtaTitle", "Want to visit our works?", 120),
  R(
    "about.factoryCtaBody",
    "Dealer and distributor visits are welcome. Contact us to arrange a visit to our Goradakheda works and see the production line and finished rolls in person."
  ),
  T("about.factoryCtaButton", "Contact Us", 60),
  L("about.factoryCtaHref", "/contact"),

  // Become a Distributor Page
  T("distributor.heroTitle", "Carry Krusheebindoo in Your District", 140),
  R(
    "distributor.heroBody",
    "Drip is the fastest-growing segment in Indian agriculture, and growers are actively looking for a reliable local supplier. Stock Krusheebindoo at factory-direct pricing, with territory protection and full after-sales support. Free to apply, and we decide within 48 hours."
  ),
  T("distributor.benefits.0.title", "Factory-Direct Pricing", 100),
  R("distributor.benefits.0.text", "Buy at manufacturer rates straight from our works in Pachora, with margins designed for healthy resale profit."),
  T("distributor.benefits.1.title", "Territory Protection", 100),
  R("distributor.benefits.1.text", "Exclusive distribution rights for your region once approved, so you are not competing with another dealer down the road."),
  T("distributor.benefits.2.title", "A Product Line That Sells", 100),
  R("distributor.benefits.2.text", "Laterals, emitters, filters and fittings under one brand, so your customers buy a complete system from a single supplier."),
  T("distributor.benefits.3.title", "Marketing Support", 100),
  R("distributor.benefits.3.text", "Product photos, demo material, banners and sales training to help you explain the specs to growers."),
  T("distributor.lookingTitle", "Who We're Looking For", 120),
  R(
    "distributor.lookingList",
    "<ul class=\"space-y-4\"><li class=\"flex gap-3\"><span class=\"text-brand-600 font-bold\"></span> Existing agri-input, hardware or equipment business</li><li class=\"flex gap-3\"><span class=\"text-brand-600 font-bold\"></span> Warehouse or showroom space for stock</li><li class=\"flex gap-3\"><span class=\"text-brand-600 font-bold\"></span> Technical staff for assembly &amp; basic service</li><li class=\"flex gap-3\"><span class=\"text-brand-600 font-bold\"></span> Motivation to build long-term market presence</li></ul>"
  ),
  T("distributor.processTitle", "How it works", 120),
  R(
    "distributor.processList",
    "<ol class=\"space-y-3\"><li class=\"flex gap-2\"><span class=\"font-semibold text-brand-700\">1.</span> <span>Submit the application form</span></li><li class=\"flex gap-2\"><span class=\"font-semibold text-brand-700\">2.</span> <span>Our team reviews &amp; calls you within 48 hours</span></li><li class=\"flex gap-2\"><span class=\"font-semibold text-brand-700\">3.</span> <span>Receive price list, catalog &amp; territory terms</span></li><li class=\"flex gap-2\"><span class=\"font-semibold text-brand-700\">4.</span> <span>Place trial order &amp; start selling</span></li></ol>"
  ),
  T("distributor.formTitle", "Distributor Application", 120),
  R("distributor.formSubtitle", "Tell us about your business  no commitment, no fees."),

  // Products Catalog Page
  T("products.heroTitle", "Drip Irrigation Products", 140),
  R(
    "products.heroBody",
    "The full Krusheebindoo range: IS 13488 flat inline drip laterals in 12 mm and 16 mm, on-line drippers and pressure-compensating emitters, screen and disc filters, and the fittings that complete the layout. Bulk pricing available for dealers."
  ),
  T("products.ctaTitle", "Not sure which size fits your crop?", 140),
  R("products.ctaBody", "Tell us your crop, area and plant spacing. We will recommend the lateral diameter, emitter spacing and filter type, and quote the full system."),
  T("products.ctaButton", "Request Distributor Pricing", 80),
  L("products.ctaHref", "/become-a-distributor"),
];


import { SiteContent } from "@/lib/models/SiteContent";

export const CONTENT_DEF_MAP: Record<string, ContentDef> = Object.fromEntries(
  CONTENT_DEFS.map((d) => [d.key, d])
);

/**
 * Marathi defaults for every editable string.
 *
 * Kept separate from CONTENT_DEFS rather than widening ContentDef with a
 * second field, for two reasons: the English defaults stay readable as the
 * single source of truth for the English site, and the Marathi block becomes
 * one obviously-delimited region that is trivial to review with a translator
 * or to hand to the client.
 *
 * A key missing from this map falls back to its English default - it renders
 * in English rather than blank, so an incomplete translation degrades
 * gracefully instead of producing an empty page.
 */
export const MARATHI_DEFAULTS: Record<string, string> = {
  // Brand & navigation. The wordmark (brand.wordmarkStart/End) is the trade
  // name and is deliberately left in Latin - transliterating a brand is how
  // shoppers end up unable to search for it.
  "brand.logoAlt": "कृष्हीबिंडू लोगो",
  "header.nav.home.label": "मुख्यपृष्ठ",
  "header.nav.products.label": "उत्पादने",
  "header.nav.about.label": "आमच्याबद्दल",
  "header.nav.distributor.label": "डिस्ट्रिब्यूटर व्हा",
  "header.nav.contact.label": "संपर्क",
  "header.cta.label": "भाव मिळवा",

  // Home
  "home.heroBadge": "कृष्हीबिंडू - IS 13488 प्रमाणित - महाराष्ट्रातील जळगाव येथे निर्मित",
  "home.heroTitleMain": "प्रत्येक थेंब, थेट",
  "home.heroTitleAccent": "मुळांच्या क्षेत्रापर्यंत",
  "home.heroBody": "तेजा पॉलिमर्सचे कृष्हीबिंडू हे इनलाइन व ऑनलाइन ठिबक सिंचन उत्पादनांची संपूर्ण श्रृंखला तयार करते: IS 13488 प्रमाणित फ्लॅट इनलाइन लेटरल, ऑनलाइन एमिटर, फिल्टर व फिटिंग्ज. ६०% पर्यंत कमी पाणी, झाडाला नेमलेल्या ठिकाणी.",
  "home.primaryCtaLabel": "उत्पादने पहा",
  "home.secondaryCtaLabel": "डिस्ट्रिब्यूटर व्हा",
  // Stat VALUES (60%, IS 13488, 5000m, 4 LPH) are intentionally absent -
  // they are numerals and units and are identical in both languages.
  "home.stats.0.label": "पर्यंत पाणी बचत",
  "home.stats.1.label": "प्रमाणित मानक",
  "home.stats.2.label": "रोलची लांबी",
  "home.stats.3.label": "एमिटर प्रवाह",
  "home.categoriesEyebrow": "उत्पादन श्रेणी",
  "home.categoriesTitle": "ठिबक सिस्टमला लागणारे सर्व काही",
  "home.categoriesBody": "कारखानातच तयार केलेल्या चार विशेष श्रेणी: लेटरल, एमिटर, फिल्टर आणि सिस्टम जुळवणारी फिटिंग्ज.",
  "home.featuredEyebrow": "निवडक उत्पादने",
  "home.featuredTitle": "आमची सर्वाधिक विक्री",
  "home.featuredBody": "सर्वाधिक पुन्हा मागणी होणारी उपकरणे - शेतात सिद्ध झालेली आणि मालकांनी संपूर्ण प्रदेशात साठवलेली.",
  "home.whyTitle": "शेतकरी कृष्हीबिंडू का निवडतात",
  "home.why.0.title": "६०% पर्यंत कमी पाणी",
  "home.why.0.text": "पाणी ओळीभर पसरत नाही, मुळांच्या क्षेत्रापर्यंत जाते. कमी पाणी उपसा, पंप करण्यासाठी कमी वीज, आणि झाडांमध्ये वाष्पीकरणात काहीही नाही.",
  "home.why.1.title": "IS 13488 प्रमाणित",
  "home.why.1.text": "प्रत्येक लेटरल IS 13488:2008 प्रमाणानुसार Class 2 UV-प्रतिरोधक LDPE मधून तयार केलेला आहे, म्हणजे प्रवाह हंगामानंतर हंगाम ४ LPH ला टिकून राहतो.",
  "home.why.2.title": "समान ओलावा",
  "home.why.2.text": "३०, ४० किंवा ६० सेंटीमीटर अंतरावर कारखान्यातच बसवलेले एमिटर प्रत्येक झाडाला एकच मापदान देतात. ओळीभर ओले किंवा कोरडे भाग नाहीत.",
  "home.why.3.title": "भारतीय शेतीसाठी तयार",
  "home.why.3.text": "महाराष्ट्रातील जमिनी, पाण्याच्या प्रती आणि लांब उन्हाळ्याच्या परिस्थितीसाठी तयार केलेले, आणि त्यावर काम करणाऱ्या शेतकऱ्यांच्या अडचणींनुसार.",
  "home.testimonialQuote": "कृष्हीबिंडूने आमच्या सिंचनाची पद्धत बदलली. पाण्याचा वापर कमी झाला, संपूर्ण ब्लॉकमध्ये उत्पादन सारखेच राहिले, आणि ५००० मीटरचा रोल त्याच्या किमतीत खूप दूरपर्यंत पोहोचतो.",
  "home.testimonialAttribution": "शेतकरी, जळगाव विभाग",
  "home.ctaTitle": "या हंगामीत पाण्याचे बिल कापीत घ्या",
  "home.ctaBody": "तुमचे पीक, क्षेत्र व झाडांतील अंतर कळवा; आम्ही योग्य लेटरल, एमिटर अंतर व फिल्टर शिफारस करू आणि मालकांसाठी डिस्ट्रिब्यूटर किंमत देतो.",
  "home.ctaButton": "शिफारस मिळवा",
  // Footer. Email, phone and postal address stay as-is: they are an address
  // and a phone number, and transliterating a postal address makes it harder
  // to find rather than easier.
  "footer.aboutBlurb": "तेजा पॉलिमर्सचे कृष्हीबिंडू हे IS 13488 प्रमाणित इनलाइन व ऑनलाइन ठिबक सिंचन उत्पादने गोरडाखेडा, पाचोरा, जळगाव येथील कारखान्यातून तयार करते.",

  // Contact
  "contact.heroTitle": "आमच्याशी संपर्क साधा",
  "contact.heroBody": "उत्पादन तपशील, थोक किंमत किंवा डिस्ट्रिब्यूटरशिपबद्दल प्रश्न आहेत? ८०८०३ ३७८१३ यावर आमच्याशी संपर्क साधा किंवा संदेश पाठवा; आम्ही १-२ कार्यदिवसांत उत्तर देतो.",
  "contact.infoTitle": "संपर्क माहिती",
  "contact.hours": "सोमवार - शनिवार, सकाळी ९:०० - सायंकाळी ६:०० (IST)",
  "contact.distributorTitle": "डिस्ट्रिब्यूटर व्हायचे आहे?",
  "contact.distributorBody": "जलद प्रक्रिया होण्यासाठी आमच्या समर्पित अर्ज फॉर्मचा वापर करा.",
  "contact.distributorCta": "डिस्ट्रिब्यूटर व्हा",
  "contact.formTitle": "आम्हाला संदेश पाठवा",
  "contact.formBody": "तुमचे पीक, क्षेत्र व गरज भरा; आमची टीम किंमत व उपलब्धता सहित परत संपर्क करेल.",

  // About
  // "उत्पादक" (producer/manufacturer) rather than "निर्माता": in Marathi
  // "निर्माता" works as an adjective ("निर्माता कंपनी"), but standing alone
  // as a noun it reads as an incomplete phrase.
  "about.heroTitle": "ठिबक सिंचन उत्पादक. प्रत्येक थेंबाचे काळजीपालन.",
  "about.heroBody": "कृष्हीबिंडू हे तेजा पॉलिमर्सचा ठिबक सिंचन ब्रँड आहे — महाराष्ट्रातील जळगाव जिल्ह्यातील पाचोरा येथील गोरडाखेडा येथे इनलाइन व ऑनलाइन ठिबक उत्पादनांची संपूर्ण श्रृंखला तयार करणारा निर्माता.",
  "about.storyTitle": "आमची ओळख",
  "about.storyBody": "<p>तेजा पॉलिमर्स सर्व्हे नं. १५२/३, सुगरान डेअरीच्या मागे, गोरडाखेडा, पाचोरा येथील कारखान्यातून कृष्हीबिंडू श्रृंखलेतील इनलाइन व ऑनलाइन ठिबक सिंचन उत्पादने तयार करते. आम्ही IS 13488 प्रमाणित फ्लॅट इनलाइन ठिबक लेटरल, ऑनलाइन ड्रिपर्स व दाब-भरित एमिटर, स्क्रीन व डिस्क फिल्टर, आणि सिस्टम पूर्ण करणारी फिटिंग्ज तयार करतो.</p><p class=\"mt-4\">महाराष्ट्रातील शेतांना हा प्रश्न चांगलाच माहीत आहे: पीक जेवढ्या वेळेला पाणी लागेल तेवढे पाणी नेहमी असत नाही, आणि पंप केलेले पाणी झाडाला पूर्ण वापरले जात नाही. आमचा उपाय साधा इंजिनियरिंग आहे — तासाला ४ लिटर मापून, मुळांच्या क्षेत्रापर्यंत नेऊन, ओळीभर समान पद्धतीने पुन्हा. नीट केल्यास पाण्याची बचत इथूनच येते, आणि ही बचत उत्पादनापेक्षा जास्त वीज बिलात दिसते.</p><p class=\"mt-4\">प्रत्येक रोल मानकानुसार तपासलेला आणि चिन्हांकित आपल्या ओळीतून जातो, कारण बंद पडलेला एमिटर म्हणजे स्वतःचा खर्च वसूल करणारे सिस्टम आणि खरेदी करणाऱ्या शेतकऱ्याची निराशा यातला फरक आहे.</p>",
  "about.stats.0.label": "प्रमाणित मानक",
  "about.stats.1.label": "पाणी बचत",
  "about.stats.2.label": "रोलची लांबी",
  "about.stats.3.label": "एमिटर प्रवाह",
  "about.valuesTitle": "आमची ध्येये",
  "about.values.0.title": "शेताच्या आधीची नांदणी",
  "about.values.0.text": "खरोखर लावलेल्या अंतरानुसार आपण आकार ठरवतो — द्राक्ष व डाळिंब ३० सेंटीमीटर, ऊस व कापूस ४० ते ६० सेंटीमीटर. पिकाला चालणारा आकार, केवळ मोठा आकार यापेक्षा चांगला.",
  "about.values.1.title": "IS 13488 प्रमाणाने तयार",
  "about.values.1.text": "Class 2 UV-प्रतिरोधक LDPE, तपासलेला प्रवाह व नियंत्रित भिंतीची जाडी, म्हणजे या हंगामी घेतलेला रोल तीन हंगामांनंतरही ४ LPH ला टिकून राहतो.",
  "about.values.2.title": "संपूर्ण सिस्टम पुरवठा",
  "about.values.2.text": "लेटरल, एमिटर, फिल्टर व फिटिंग्ज एकाच निर्मात्याकडून, म्हणजे ब्लॉकातील प्रत्येक भाग एकच दाब व्यवस्था व एकच जबाबदारी सामोबात.",
  "about.factoryCtaTitle": "आमच्या कारखान्याला भेट द्यायची आहे?",
  "about.factoryCtaBody": "मालक व डिस्ट्रिब्यूटरांचे स्वागत. गोरडाखेडा कारखाना भेट देऊन उत्पादन ओळ व तयार रोल प्रत्यक्ष पाहण्यासाठी आमच्याशी संपर्क साधा.",
  "about.factoryCtaButton": "संपर्क साधा",
  // Distributor. The two list bodies are stored as sanitised HTML, so the
  // markup must be preserved exactly - only the text inside each tag is
  // translated.
  "distributor.heroTitle": "तुमच्या जिल्ह्यात कृष्हीबिंडू विका",
  "distributor.heroBody": "भारतीय कृषीत ठिबक हा सर्वात वेगाने वाढणारा भाग आहे आणि शेतकरी विश्वासार्ह स्थानिक पुरवठादार शोधत आहेत. कारखान्यातून थेट किंमतीत कृष्हीबिंडू साठवा, तुमच्या विभागासाठी सविष्ट संरक्षण व पूर्ण विक्रीपश्चात सहाय्य मिळेल. अर्ज मोफत, आणि आम्ही ४८ तासांत निर्णय देतो.",
  "distributor.benefits.0.title": "कारखान्यातून थेट किंमत",
  "distributor.benefits.0.text": "पाचोरा येथील आमच्या कारखान्यातून थेट निर्माता दराने खरेदी करा; निवृत्त विक्रीसाठी निकूळ असलेले भाव आम्ही ठरवून देतो.",
  "distributor.benefits.1.title": "विभागासाठी सविष्ट संरक्षण",
  "distributor.benefits.1.text": "मान्यता मिळाल्यानंतर तुमच्या विभागासाठी सविष्ट वितरण हक्क, म्हणजे जवळच्या दुसऱ्या मालकाशी स्पर्धा करावी लागत नाही.",
  "distributor.benefits.2.title": "विक्रीस चालणारी उत्पादन श्रृंखला",
  "distributor.benefits.2.text": "लेटरल, एमिटर, फिल्टर व फिटिंग्ज एका ब्रँडाखाली, म्हणजे तुमच्या ग्राहकांना एकच पुरवठादाराकडून संपूर्ण सिस्टम मिळतो.",
  "distributor.benefits.3.title": "जाहीर व विक्री सहाय्य",
  "distributor.benefits.3.text": "उत्पादनांची छायाचित्रे, डेमो साहित्य, बॅनर आणि विक्री प्रशिक्षण, जेणेकरून शेतकऱ्यांना तपशील सहज सांगता येतील.",
  "distributor.lookingTitle": "आम्ही कोणाला शोधतोय",
  "distributor.lookingList": "<ul class=\"space-y-4\"><li class=\"flex gap-3\"><span class=\"text-brand-600 font-bold\">✓</span> कृषी निविष्ठा, हार्डवेअर किंवा उपकरणे या क्षेत्रात आधीच असलेला व्यवसाय</li><li class=\"flex gap-3\"><span class=\"text-brand-600 font-bold\">✓</span> माल साठवण्यासाठी गोदाम किंवा शोरुम जागा</li><li class=\"flex gap-3\"><span class=\"text-brand-600 font-bold\">✓</span> जोडणी व मूलभूत सेवा देण्यासाठी तांत्रिक कर्मचारी</li><li class=\"flex gap-3\"><span class=\"text-brand-600 font-bold\">✓</span> दीर्घकालीन बाजार उपस्थिती निर्माण करण्याची इच्छा</li></ul>",
  "distributor.processTitle": "प्रक्रिया कशी आहे",
  "distributor.processList": "<ol class=\"space-y-3\"><li class=\"flex gap-2\"><span class=\"font-semibold text-brand-700\">1.</span> <span>अर्ज फॉर्म भरा</span></li><li class=\"flex gap-2\"><span class=\"font-semibold text-brand-700\">2.</span> <span>आमची टीम तपासणी करून ४८ तासांत संपर्क करेल</span></li><li class=\"flex gap-2\"><span class=\"font-semibold text-brand-700\">3.</span> <span>किंमतपत्रक, कॅटलॉग व तुमच्या विभागाच्या संज्ञा मिळतील</span></li><li class=\"flex gap-2\"><span class=\"font-semibold text-brand-700\">4.</span> <span>चाचणी ऑर्डर द्या आणि विक्री सुरू करा</span></li></ol>",
  "distributor.formTitle": "डिस्ट्रिब्यूटर अर्ज",
  "distributor.formSubtitle": "तुमच्या व्यवसायाबद्दल सांगा — कोणतीही बांधन किंवा शुल्क नाही.",

  // Products catalogue
  "products.heroTitle": "ठिबक सिंचन उत्पादने",
  "products.heroBody": "कृष्हीबिंडूची संपूर्ण श्रृंखला: १२ मिमी व १६ मिमी IS 13488 प्रमाणित फ्लॅट इनलाइन ठिबक लेटरल, ऑनलाइन ड्रिपर्स व दाब-भरित एमिटर, स्क्रीन व डिस्क फिल्टर, आणि सिस्टम पूर्ण करणारी फिटिंग्ज. मालकांसाठी थोक किंमत उपलब्ध.",
  "products.ctaTitle": "तुमच्या पिकासाठी कोणता आकार चालेल याची खात्री नाही?",
  "products.ctaBody": "तुमचे पीक, क्षेत्र व झाडांतील अंतर कळवा. आम्ही लेटरल व्यास, एमिटर अंतर व फिल्टरचा प्रकार शिफारस करू आणि संपूर्ण सिस्टमचा भाव देऊ.",
  "products.ctaButton": "डिस्ट्रिब्यूटर किंमत मागवा",
};

function isLocaleKey(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * The built-in default for a key in a given locale, before any admin
 * override. Marathi falls back to English; English never falls back to
 * Marathi, so a half-finished Marathi translation cannot leak Devanagari into
 * the English site.
 */
export function defaultFor(key: string, locale: Locale): string {
  if (locale === "mr") {
    const mr = MARATHI_DEFAULTS[key];
    if (mr) return mr;
  }
  return CONTENT_DEF_MAP[key]?.defaultValue ?? "";
}

/**
 * Per-locale buckets of stored values.
 *
 * Both languages come back from a SINGLE query so adding a language did not
 * double the database round trips on every page render - the hot path cost
 * is identical to the previous single-language version.
 */
export type ContentMap = Record<Locale, Record<string, string>>;

/**
 * In-process cache for the site content.
 *
 * Content only changes when an admin saves, yet every page render used
 * to run a fresh MongoDB query. Caching it removes that round trip from
 * the hot path, which is the biggest single win on page load.
 *
 * The cache is short-lived AND explicitly invalidated by the save
 * endpoint, so an admin never sees their own edit go stale.
 */
const CACHE_TTL_MS = 60_000;

type ContentCache = { map: ContentMap; expiresAt: number };
const globalCache = globalThis as unknown as { siteContentCache?: ContentCache };

/** Drop the cache. Call after anything writes site content. */
export function invalidateSiteContentCache(): void {
  globalCache.siteContentCache = undefined;
}

/**
 * Resolves one editable string for a locale.
 *
 * Order of precedence:
 *   1. the value an admin saved for THAT locale
 *   2. the built-in default for THAT locale
 *   3. the value an admin saved for English (only when reading Marathi)
 *   4. the built-in English default
 *
 * Step 2 before step 3 is the subtle one and it matters a lot. Every row in
 * the database is currently English, because that is all that existed before
 * bilingual editing. If the English stored value were consulted first, every
 * Marathi page would silently render English - the fallback would fire for
 * all 110 keys and the Marathi defaults in MARATHI_DEFAULTS would never be
 * reached. Preferring the locale's own default means a Marathi page shows
 * Marathi as soon as the code ships a Marathi default, and only falls back
 * to English for keys that genuinely have no Marathi translation yet.
 *
 * A stored empty string still wins - that is an admin deliberately clearing
 * a field, and must not be second-guessed by falling back to a default.
 */
export function content(
  map: ContentMap | undefined,
  locale: Locale,
  key: string
): string {
  const stored = map?.[locale]?.[key];
  if (typeof stored === "string") return stored;

  if (locale === "mr") {
    const mr = MARATHI_DEFAULTS[key];
    if (mr) return mr;
  }

  if (locale !== "en") {
    const english = map?.en?.[key];
    if (typeof english === "string") return english;
  }

  return defaultFor(key, locale);
}

/** Locale-aware convenience wrapper: `t("home.heroTitle")` inside a page. */
export function translator(map: ContentMap | undefined, locale: Locale) {
  return (key: string): string => content(map, locale, key);
}

export async function getSiteContentMap(): Promise<ContentMap> {
  const cached = globalCache.siteContentCache;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.map;
  }

  await connectDB();
  const docs = await SiteContent.find().select("key value locale").lean();

  const map: ContentMap = { mr: {}, en: {} };
  for (const doc of docs) {
    const row = doc as unknown as { key: string; value: string; locale?: string };
    // Rows written before bilingual editing have no locale field and hold
    // English copy, so anything unrecognised is filed under "en" rather than
    // silently becoming the Marathi default.
    const bucket = isLocaleKey(row.locale) ? row.locale : "en";
    map[bucket][row.key] = row.value;
  }

  globalCache.siteContentCache = { map, expiresAt: Date.now() + CACHE_TTL_MS };
  return map;
}

export function sanitizeText(raw: unknown, maxLength: number): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return cleaned.slice(0, maxLength);
}

export function sanitizeRich(raw: unknown, maxLength: number): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tag, attrs) => {
      const lower = tag.toLowerCase();
      if (!["b", "strong", "i", "em", "a", "ul", "ol", "li", "p", "br"].includes(lower)) {
        return "";
      }
      if (lower === "a") {
        const hrefMatch = attrs.match(/href=(["'])(.*?)\1/i);
        const href = hrefMatch ? hrefMatch[2] : "";
        if (
          href.startsWith("/") ||
          href.startsWith("https://") ||
          href.startsWith("http://") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:")
        ) {
          return `<a href="${href.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer">`;
        }
        return "<a>";
      }
      return `<${lower}>`;
    });
  return cleaned.trim().slice(0, maxLength);
}

export function sanitizeLink(raw: unknown, maxLength: number): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (
    !trimmed.startsWith("/") &&
    !trimmed.startsWith("https://") &&
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("mailto:") &&
    !trimmed.startsWith("tel:")
  ) {
    return null;
  }
  return trimmed.slice(0, maxLength);
}

export function sanitizeImagePath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed === "") return "";
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }
  return null;
}


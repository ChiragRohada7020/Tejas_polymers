import type { Locale } from "@/lib/i18n";

/**
 * Long-form guides that sit alongside the catalogue.
 *
 * WHY THEY ARE SEPARATE FROM THE PRODUCT PAGES
 *
 * A product page answers "what is this and how much". It cannot answer "which
 * of these two do I actually need", which is the question a grower types into
 * Google. So each guide targets one of those questions and links to the single
 * product it recommends, rather than restating the catalogue.
 *
 * HOW THEY ARE LINKED
 *
 * Deliberately NOT in the main navigation. They are reachable from the footer
 * and from each other, and every one is in sitemap.xml. That is enough for
 * Google to crawl and rank them, and it keeps the header focused on the
 * catalogue. They are NOT linked from the product pages, by choice.
 *
 * WHY THE COPY IS TYPED RATHER THAN IN THE DATABASE
 *
 * Article bodies are structured (sections, FAQs) and referenced by JSON-LD, so
 * a malformed row would break structured data rather than just look wrong.
 * Typing them here makes a missing translation a compile error, exactly like
 * STRINGS in src/lib/strings.ts.
 *
 * GROUND RULE FOR THIS FILE: every number quoted must already exist in the
 * product's own specification table in the database. These articles explain
 * the catalogue; they must never invent a figure the product page contradicts.
 */

export type BlogSection = {
  heading: string;
  /** One entry per paragraph, so the page controls the spacing. */
  body: string[];
};

export type BlogFaq = { question: string; answer: string };

export type BlogCopy = {
  /** On-page H1 and the <title>. */
  title: string;
  /** Meta description, clamped to ~155 characters at render time. */
  metaDescription: string;
  /** One-sentence summary shown on the index and in the related list. */
  excerpt: string;
  sections: BlogSection[];
  faq: BlogFaq[];
};

export type BlogPost = {
  slug: string;
  /**
   * The product this guide recommends. Drives the spec table, the CTA and the
   * hero image, so a guide can never drift out of sync with the catalogue.
   */
  productSlug: string;
  /** ISO dates, used for the visible date and BlogPosting JSON-LD. */
  publishedAt: string;
  updatedAt: string;
  /** Both locales are required, so a half-translated guide cannot ship. */
  copy: Record<Locale, BlogCopy>;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "disc-filter-for-dirty-water",
    productSlug: "krusheebindoo-disc-filter-2-inch",
    publishedAt: "2026-10-02",
    updatedAt: "2026-10-02",
    copy: {
      en: {
        title: "Filtering Canal, Pond and Recycled Water Without Constant Cleaning",
        metaDescription:
          "Algae and heavy organic load blind a fine mesh quickly. A disc filter holds far more dirt before the pressure drop shows, which matters on canal and pond water.",
        excerpt:
          "On dirty water the question is not whether the filter works, it is how often you have to stop irrigating to clean it.",
        sections: [
          {
            heading: "Why dirty water needs a different filter",
            body: [
              "A screen filter traps contaminants on a single mesh. That is efficient on clean water and unforgiving on dirty water, because once the mesh is blinded the pressure drop climbs and the element needs cleaning — often mid-cycle, when you least want to stop.",
              "Canal, pond and recycled water carry algae and a heavier organic load than a borewell does. If that is your source, the filter has to be chosen for how much dirt it can hold, not only for how fine it filters.",
            ],
          },
          {
            heading: "How a disc stack holds more dirt",
            body: [
              "Where a screen blocks, a disc filter separates. A stack of thin grooved discs traps contaminants in the grooves between them rather than on a flat surface, which gives a far larger filtration area and holds much more dirt before the pressure drop becomes noticeable.",
              "Our 2 inch disc filter is rated at 130 micron, handles up to 40 m³/h at a maximum working pressure of 10 bar, and is the usual second stage after a sand media filter — the media filter takes the bulk of the load and the disc stack catches what gets through.",
            ],
          },
          {
            heading: "Servicing between irrigation cycles",
            body: [
              "Because each disc can be removed, washed or replaced individually, there is no heavy cartridge to discard when the element finally loads up. That keeps running costs down over a season and avoids the situation where a whole filter body is thrown away because one part wore out.",
              "The stack separates with a single clamp, so cleaning fits into the gap between irrigation cycles rather than becoming a job of its own. A differential pressure indicator shows at a glance when cleaning is due, so it is done on the filter's schedule rather than after the block has already under-irrigated.",
            ],
          },
        ],
        faq: [
          {
            question: "Can a disc filter be the only filter on canal water?",
            answer:
              "It can, and it will cope far better than a fine screen. On heavily loaded water a sand media filter ahead of it is still the more usual arrangement, because the media filter takes the bulk of the dirt and the disc stack then works as a polishing stage.",
          },
          {
            question: "How often does a disc filter need cleaning?",
            answer:
              "It depends entirely on the load in your water. A differential pressure indicator is the honest answer — clean it when the drop reaches the threshold rather than on a fixed calendar, because the load changes with the season.",
          },
          {
            question: "Do the discs need replacing?",
            answer:
              "Usually not. They are washed and reused, and replaced individually if one is damaged. That is the practical advantage of a stack over a single cartridge element.",
          },
        ],
      },
      mr: {
        title: "कालवा, तलाव व पुनर्वापराचे पाणी वारंवार साफ करण्याशिवाय गाळणे",
        metaDescription:
          "अल्गी व जड सेंद्रिय भार बारीक जाळी लवकर बंद करतो. डिस्क फिल्टर दाब कमी होण्यापूर्वी खूप जास्त घाण सहन करतो, त्यामुळे कालवा व तलावाच्या पाण्यात तोच योग्य.",
        excerpt:
          "घाण पाण्यात प्रश्न फिल्टर चालतो का हा नसतो — सिंचन थांबवून किती वेळा साफ करावे लागते हा असतो.",
        sections: [
          {
            heading: "घाण पाण्याला वेगळा फिल्टर का लागतो",
            body: [
              "स्क्रीन फिल्टर घाण एकाच जाळीवर अडवतो. स्वच्छ पाण्यात हे कार्यक्षम आहे आणि घाण पाण्यात निर्दय — जाळी भरली की दाब कमी होत जातो आणि घटक साफ करावा लागतो, बहुधा फेरीच्या मध्येच, जेव्हा थांबवणे अजिबात नको असते.",
              "कालवा, तलाव व पुनर्वापराच्या पाण्यात बोअरवेलपेक्षा जास्त अल्गी व जड सेंद्रिय भार असतो. स्रोत असाच असेल, तर फिल्टर किती बारीक गाळतो एवढेच नव्हे तर किती घाण सहन करू शकतो हे पाहून निवडावा.",
            ],
          },
          {
            heading: "डिस्क स्टॅक जास्त घाण कसा सहन करतो",
            body: [
              "जिथे स्क्रीन अडकते, तिथे डिस्क वेगळे करते. पातळ खोबणी असलेल्या डिस्कचा स्टॅक घाण सपाट पृष्ठभागावर नव्हे तर त्यांच्यातील खोबणीत अडवतो, त्यामुळे गाळणीचे क्षेत्र खूप मोठे होते आणि दाब कमी होणे जाणवण्यापूर्वी तो खूप जास्त घाण सहन करतो.",
              "आमचा २ इंच डिस्क फिल्टर १३० मायक्रॉन क्षमतेचा, १० बार कमाल कार्य दाबावर ४० घनमीटर प्रति तासापर्यंत प्रवाह देणारा, आणि वाळू मीडिया फिल्टरनंतरचा नेहमीचा दुसरा टप्पा आहे — मीडिया फिल्टर बहुतेक भार घेतो आणि डिस्क स्टॅक आत गेलेले अडवतो.",
            ],
          },
          {
            heading: "सिंचन फेऱ्यांदरम्यान सेवा",
            body: [
              "प्रत्येक डिस्क स्वतंत्रपणे काढता, धुवता किंवा बदलता येते, त्यामुळे घटक शेवटी भरल्यावर फेकून देण्यासारखा जड कार्ट्रिज नसतो. त्यामुळे हंगामभर चालू खर्च कमी राहतो आणि एक भाग संपल्यामुळे संपूर्ण फिल्टर बॉडी फेकावी लागण्याची वेळ येत नाही.",
              "एका क्लॅम्पने स्टॅक उघडतो, त्यामुळे साफसफाई वेगळे काम न होता सिंचन फेऱ्यांमधल्या वेळात होते. दाबातील फरक दाखवणारा निर्देशक साफसफाईची वेळ झाली हे एका दृष्टीक्षेपात दाखवतो, त्यामुळे ब्लॉक कमी भिजल्यानंतर नव्हे तर फिल्टरच्या वेळापत्रकानुसार साफसफाई होते.",
            ],
          },
        ],
        faq: [
          {
            question: "कालव्याच्या पाण्यावर डिस्क फिल्टर एकच फिल्टर म्हणून चालतो का?",
            answer:
              "चालतो, आणि बारीक स्क्रीनपेक्षा खूप चांगला सहन करतो. अत्यंत भरलेल्या पाण्यावर त्याच्यापुढे वाळू मीडिया फिल्टर ठेवणे हीच नेहमीची रचना असते — मीडिया फिल्टर बहुतेक घाण घेतो आणि डिस्क स्टॅक नंतर अंतिम गाळणीचे काम करतो.",
          },
          {
            question: "डिस्क फिल्टर किती वेळा साफ करावा लागतो?",
            answer:
              "हे पूर्णपणे तुमच्या पाण्यातील भारावर अवलंबून आहे. दाबातील फरक दाखवणारा निर्देशक हेच खरे उत्तर आहे — ठरलेल्या तारखेऐवजी फरक ठरलेल्या मर्यादेपर्यंत पोहोचल्यावर साफ करा, कारण भार हंगामानुसार बदलतो.",
          },
          {
            question: "डिस्क बदलावे लागतात का?",
            answer:
              "सहसा नाही. त्या धुवून पुन्हा वापरल्या जातात, आणि एखादी खराब झाल्यास फक्त तीच बदलली जाते. एका कार्ट्रिज घटकापेक्षा स्टॅकचा व्यावहारिक फायदा हाच आहे.",
          },
        ],
      },
    },
  },
  {
    slug: "emitter-spacing-explained",
    productSlug: "krusheebindoo-flat-inline-drip-12mm-4lph-40cm",
    publishedAt: "2026-10-03",
    updatedAt: "2026-10-03",
    copy: {
      en: {
        title: "Emitter Spacing Explained: Why 30 cm and 40 cm Suit Different Crops",
        metaDescription:
          "Emitter spacing decides how much of the root zone gets wetted and how many outlets you buy per roll. Here is how to choose between 30 cm and 40 cm.",
        excerpt:
          "Spacing is not a specification detail you inherit. It decides how wide the wetted band is under each plant, and how many outlets a roll buys you.",
        sections: [
          {
            heading: "What emitter spacing actually controls",
            body: [
              "Discharge tells you how fast water comes out. Spacing tells you where it lands and how much of the root zone it reaches. Those are two different decisions, and only the first one is usually discussed.",
              "Spacing also decides how many outlets you are buying. A 5000 m roll carries far more outlets at 30 cm than at 40 cm, so the per-acre cost of an outlet falls as the spacing tightens. That is worth knowing before you compare two rolls by price alone.",
            ],
          },
          {
            heading: "Tighter spacing, around 30 cm",
            body: [
              "Tighter spacing suits crops that want a small, frequent dose and an even moisture band rather than a deep soak. That is the pattern high-value horticulture responds to, because even moisture across the root zone drives fruit size and uniformity rather than simply keeping a plant alive.",
              "Our 16 mm lateral with emitters fixed at 30 cm is the finest-spacing option we manufacture, putting roughly 33,000 outlets into a single 5000 m roll. It is the better choice for close-spaced crops and for soils that do not spread water laterally very far.",
            ],
          },
          {
            heading: "Wider spacing, around 40 cm",
            body: [
              "Wider spacing suits crops with larger root volumes, wider plant spacing, or heavier soils that carry moisture sideways on their own. One outlet can then serve more soil, and you are not paying for emitters that wet ground the roots already cover.",
              "Our 12 mm and 16 mm laterals with emitters at 40 cm are the rolls most often specified for closely spaced row crops, where the aim is even coverage along the row rather than a dense grid of outlets.",
            ],
          },
        ],
        faq: [
          {
            question: "Does closer spacing mean less water used?",
            answer:
              "Not by itself. Closer spacing spreads the same water over more outlets, so each outlet delivers less. Total water use is set by discharge, run time and the number of emitters, not by spacing alone.",
          },
          {
            question: "Can I change the emitter spacing after buying?",
            answer:
              "Not on an inline lateral — the emitters are factory-fixed. If you need spacing you can change between seasons, choose plain lateral and fit on-line drippers, which can be moved and the old holes plugged.",
          },
          {
            question: "Which spacing is better for sandy soil?",
            answer:
              "Sandy soils do not carry water sideways well, so moisture stays close to the outlet. That usually argues for tighter spacing than you would choose on a heavier soil, where the wetted zone spreads further on its own.",
          },
        ],
      },
      mr: {
        title: "एमिटर अंतर समजून घ्या: ३० सें.मी. व ४० सें.मी. वेगवेगळ्या पिकांना का योग्य",
        metaDescription:
          "एमिटर अंतर ठरवते की मुळांचे क्षेत्र किती भिजते आणि प्रति रोल किती आउटलेट मिळतात. ३० सें.मी. व ४० सें.मी. यांत निवड कशी करावी.",
        excerpt:
          "अंतर हा वारशाने मिळालेला तपशील नाही. तो ठरवतो की प्रत्येक झाडाखाली ओल किती रुंद पसरते, आणि एका रोलमध्ये किती आउटलेट मिळतात.",
        sections: [
          {
            heading: "एमिटर अंतर प्रत्यक्षात काय ठरवते",
            body: [
              "प्रवाह सांगतो की पाणी किती वेगाने बाहेर पडते. अंतर सांगते की ते कुठे पडते आणि मुळांच्या क्षेत्रापर्यंत किती पोहोचते. या दोन वेगळ्या निवडी आहेत, आणि सहसा चर्चा फक्त पहिल्याची होते.",
              "अंतर हेच ठरवते की तुम्ही किती आउटलेट विकत घेत आहात. ५००० मीटर रोलमध्ये ३० सें.मी. अंतरावर ४० सें.मी. पेक्षा खूप जास्त आउटलेट बसतात, त्यामुळे अंतर घट्ट होत जाते तसा प्रति आउटलेट खर्च कमी होतो. फक्त किंमत पाहून दोन रोलची तुलना करण्यापूर्वी हे माहीत असावे.",
            ],
          },
          {
            heading: "घट्ट अंतर, सुमारे ३० सें.मी.",
            body: [
              "घट्ट अंतर अशा पिकांना योग्य ज्यांना खोल भिजवण्यापेक्षा लहान व वारंवार मात्रा आणि समान ओल हवी असते. महागड्या पिकांचा प्रतिसाद याच नमुन्याला असतो, कारण मुळांच्या क्षेत्रात समान ओल झाड जगवण्यापेक्षा फळाचा आकार व एकसारखेपणा ठरवते.",
              "३० सें.मी. अंतरावर एमिटर असलेली आमची १६ मिमी लेटरल ही आमची सर्वात बारीक अंतराची निवड आहे — एका ५००० मीटर रोलमध्ये सुमारे ३३,००० आउटलेट. जवळच्या अंतराच्या पिकांसाठी आणि पाणी बाजूला फार पसरत नाही अशा मातीसाठी हीच बरी निवड.",
            ],
          },
          {
            heading: "मोठे अंतर, सुमारे ४० सें.मी.",
            body: [
              "मोठे अंतर मोठ्या मुळांचे प्रमाण असलेल्या पिकांना, मोठ्या अंतरावरील झाडांना, किंवा ओल स्वतःच बाजूला नेणाऱ्या जड मातीस योग्य असते. तेव्हा एक आउटलेट जास्त जमीन झाकतो, आणि मुळे आधीच व्यापलेली जमीन भिजवण्यासाठी पैसे खर्च होत नाहीत.",
              "४० सें.मी. अंतरावर एमिटर असलेल्या आमच्या १२ मिमी व १६ मिमी लेटरल जवळच्या अंतराच्या ओळीच्या पिकांसाठी सर्वाधिक निवडल्या जातात, जिथे हेतू दाट जाळीऐवजी ओळीभर समान झाकणे हा असतो.",
            ],
          },
        ],
        faq: [
          {
            question: "घट्ट अंतर म्हणजे कमी पाणी लागते का?",
            answer:
              "फक्त त्यामुळे नाही. घट्ट अंतर तेच पाणी जास्त आउटलेटवर वाटून देते, त्यामुळे प्रत्येक आउटलेट कमी देते. एकूण पाण्याचा वापर प्रवाह, चालण्याची वेळ व एमिटरची संख्या यांवर ठरतो, केवळ अंतरावर नाही.",
          },
          {
            question: "खरेदीनंतर एमिटरचे अंतर बदलता येते का?",
            answer:
              "इनलाइन लेटरलवर नाही — एमिटर कारखान्यातच बसवलेले असतात. हंगामांत बदलता येणारे अंतर हवे असेल तर साधी लेटरल घ्या व ऑनलाइन ड्रिपर बसवा; ते हलवता येतात आणि जुनी छिद्रे बंद करता येतात.",
          },
          {
            question: "वाळूच्या मातीसाठी कोणते अंतर चांगले?",
            answer:
              "वाळूची माती पाणी बाजूला नीट नेते नाही, त्यामुळे ओल आउटलेटजवळच राहते. त्यामुळे सहसा जड मातीपेक्षा घट्ट अंतर योग्य ठरते; जड मातीत ओल स्वतःच जास्त पसरते.",
          },
        ],
      },
    },
  },
  {
    slug: "take-off-connector-ball-valve",
    productSlug: "krusheebindoo-take-off-connector-valve-16mm",
    publishedAt: "2026-10-04",
    updatedAt: "2026-10-04",
    copy: {
      en: {
        title: "Why a Valved Take-Off Connector Makes a Block Easier to Run",
        metaDescription:
          "The take-off connector joins a 16 mm lateral to the sub-main. With an integral ball valve you can isolate one row without draining the rest of the line.",
        excerpt:
          "One small fitting decides whether you can shut off a single row, or whether a leak means draining the whole block.",
        sections: [
          {
            heading: "What a take-off connector does",
            body: [
              "The take-off connector is the fitting that joins a drip lateral to the sub-main. Ours takes a 16 mm lateral on a barb and a 3/4 inch male thread into the sub-main, in virgin UV-stabilised PP, in black or blue.",
              "It is a small, cheap part and it is easy to treat as an afterthought. That is a mistake, because it is the component that turns a run of pipe into something you can actually control.",
            ],
          },
          {
            heading: "Why the integral valve matters",
            body: [
              "With an inline quarter-turn ball valve built into the connector, you can isolate a single row or a single block without draining the rest of the line. Irrigation can then proceed zone by zone, which is how a system is normally run.",
              "The alternative shows its cost at the worst moment. If a leak develops in one row on a manifold with no valves, your only option is to shut down the whole block — so a five-minute repair becomes a lost irrigation cycle for everything downstream.",
            ],
          },
          {
            heading: "Building a proper manifold",
            body: [
              "Build a line of valved take-offs along a header and you have a properly valved manifold. That is the difference between an installation that is convenient to run season after season and one that is not.",
              "The 16 mm barb grips the lateral firmly without needing clamps or glue, so a manifold goes together quickly, and a single row can be re-run, re-routed or taken out of service without disturbing its neighbours.",
            ],
          },
        ],
        faq: [
          {
            question: "What is the difference between a plain take-off and a valved one?",
            answer:
              "A plain take-off just makes the connection. A valved take-off adds a quarter-turn ball valve, so that row can be shut off on its own. The valve is what makes zone-by-zone irrigation possible.",
          },
          {
            question: "Do I need a clamp on the 16 mm barb?",
            answer:
              "No. The barb is sized to grip the lateral firmly on its own, which is why the fitting needs neither clamps nor glue. That also means the lateral can be removed and re-fitted without cutting the pipe.",
          },
          {
            question: "How many take-offs do I need?",
            answer:
              "One per lateral, along the header. Ordering a few spare is worth it, because adding a row later is trivial with a spare fitting and awkward without one.",
          },
        ],
      },
      mr: {
        title: "व्हाव्हसह टेक-ऑफ कनेक्टर ब्लॉक चालवायला सोपा का करतो",
        metaDescription:
          "टेक-ऑफ कनेक्टर १६ मिमी लेटरल सब-मेनला जोडतो. एकात्म बॉल व्हाव्हमुळे उर्वरित ओळ रिकामी न करता एकच ओळ बंद करता येते.",
        excerpt:
          "छोटे फिटिंग ठरवते की एकच ओळ बंद करता येईल, की गळती झाल्यास संपूर्ण ब्लॉक रिकामा करावा लागेल.",
        sections: [
          {
            heading: "टेक-ऑफ कनेक्टर काय करतो",
            body: [
              "टेक-ऑफ कनेक्टर हे फिटिंग ठिबक लेटरलला सब-मेनला जोडते. आमचे फिटिंग १६ मिमी लेटरल बार्बवर व ३/४ इंच पुरुष स्क्रूने सब-मेनमध्ये बसते — व्हर्जिन UV-स्थिर PP मध्ये, काळ्या किंवा निळ्या रंगात.",
              "हा छोटा व स्वस्त भाग आहे, आणि त्याकडे दुर्लक्ष करणे सोपे आहे. ते चूक आहे, कारण पाइपच्या ओळीला प्रत्यक्षात नियंत्रित करता येणारी गोष्ट बनवणारा घटक हाच आहे.",
            ],
          },
          {
            heading: "एकात्म व्हाव्ह का महत्त्वाचा",
            body: [
              "कनेक्टरमध्येच चतुर्थांश फिरतीचा बॉल व्हाव्ह बसवलेला असल्याने उर्वरित ओळ रिकामी न करता एकच ओळ किंवा एकच ब्लॉक बंद करता येतो. त्यामुळे सिंचन विभागानुसार करता येते, जे सिस्टम चालवण्याचे नेहमीचे स्वरूप आहे.",
              "पर्यायाचा खर्च सर्वात वाईट क्षणी समोर येतो. व्हाव्ह नसलेल्या मॅनिफोल्डवर एका ओळीत गळती आली तर संपूर्ण ब्लॉक बंद करण्याशिवाय पर्याय नाही — म्हणजे पाच मिनिटांची दुरुस्ती पुढील सर्व भागांसाठी वाया गेलेली सिंचन फेरी बनते.",
            ],
          },
          {
            heading: "योग्य मॅनिफोल्ड कसा बनवावा",
            body: [
              "हेडरभर व्हाव्हसह टेक-ऑफची ओळ बनवली की योग्य व्हाव्हयुक्त मॅनिफोल्ड तयार होते. हंगामानंतर हंगाम चालवायला सोपी बसवणी आणि जी नाही यातला हाच फरक आहे.",
              "१६ मिमी बार्ब लेटरलला क्लॅम्प किंवा गोंद न लागता घट्ट धरतो, त्यामुळे मॅनिफोल्ड लवकर तयार होतो, आणि शेजारच्या ओळींना त्रास न देता एकच ओळ पुन्हा टाकता, वळवता किंवा वापरातून काढता येते.",
            ],
          },
        ],
        faq: [
          {
            question: "साध्या टेक-ऑफ व व्हाव्हसह टेक-ऑफ यांत फरक काय?",
            answer:
              "साधा टेक-ऑफ फक्त जोडणी करतो. व्हाव्हसह टेक-ऑफमध्ये चतुर्थांश फिरतीचा बॉल व्हाव्ह असतो, त्यामुळे ती ओळ स्वतंत्रपणे बंद करता येते. विभागानुसार सिंचन शक्य करणारा घटक हाच व्हाव्ह आहे.",
          },
          {
            question: "१६ मिमी बार्बवर क्लॅम्प लागतो का?",
            answer:
              "नाही. बार्ब लेटरलला स्वतःच घट्ट धरतो, म्हणूनच या फिटिंगला क्लॅम्प किंवा गोंद लागत नाही. त्यामुळे पाइप न कापता लेटरल काढून पुन्हा बसवता येते.",
          },
          {
            question: "किती टेक-ऑफ लागतात?",
            answer:
              "प्रत्येक लेटरलला एक, हेडरभर. दोन-चार जास्त ठेवणे फायद्याचे ठरते, कारण नंतर ओळ जोडायची असल्यास जास्त फिटिंग असल्यास सोपे जाते आणि नसल्यास अडचण होते.",
          },
        ],
      },
    },
  },
  {
    slug: "plain-lateral-vs-inline-drip",
    productSlug: "krusheebindoo-plain-drip-lateral-16mm",
    publishedAt: "2026-10-05",
    updatedAt: "2026-10-05",
    copy: {
      en: {
        title: "Plain Lateral or Inline Drip? When Punched Pipe Is the Better Choice",
        metaDescription:
          "Plain 16 mm lateral has no built-in emitters, so you choose the outlet spacing. Here is when that beats a factory-fitted inline drip lateral.",
        excerpt:
          "Inline drip is faster to lay. Plain lateral lets you decide the spacing, and change it next season without replacing the line.",
        sections: [
          {
            heading: "What plain lateral is for",
            body: [
              "Plain lateral is the blank canvas of a drip system: a 16 mm polyethylene pipe with no built-in emitters, punched where you want an outlet. Ours is manufactured to IS 12786 in Class 2 with a 1.1 to 1.3 mm wall.",
              "That is the same wall thickness as our 16 mm inline laterals, which matters more than it sounds: it means the whole block runs on one consistent pressure regime rather than two different ones.",
            ],
          },
          {
            heading: "When punched pipe beats inline drip",
            body: [
              "Specify plain lateral when plant spacing changes between seasons, when you are laying for an orchard with irregular trees, or when you want the option to move emitters later without replacing the line. A factory-fixed emitter cannot be re-spaced; a punched outlet can be plugged and re-punched elsewhere.",
              "It is also the standard choice for carrying water to a manifold or feeding a further line, and it works with micro-sprinklers, jets and foggers as well as drippers — which is useful when one pipe has to serve more than one job.",
            ],
          },
          {
            heading: "What to watch when you punch your own",
            body: [
              "The trade-off is labour and consistency. Inline drip arrives with the emitter spacing already correct, so there is no on-site clipping, splicing or emitter-loss risk during laying; with plain lateral, every outlet is a decision someone makes in the field.",
              "That makes it the right choice when the spacing genuinely needs to be bespoke, and the wrong one when it does not. If your crop is evenly spaced and you know the pattern, an inline lateral will be faster and more consistent for the same money.",
            ],
          },
        ],
        faq: [
          {
            question: "Can plain lateral be used as a sub-main?",
            answer:
              "It is routinely used to carry water to a manifold or feed a further line. Whether it should be the sub-main depends on the flow it has to carry and the length of the run, so size it against the block rather than by habit.",
          },
          {
            question: "What size dripper fits plain 16 mm lateral?",
            answer:
              "On-line drippers and emitters with a 16 mm barb, which is the standard fit. Our PC online emitter and our plain lateral are both 16 mm barb, so they pair directly without an adaptor.",
          },
          {
            question: "How far apart should I punch the holes?",
            answer:
              "Match the plant spacing, and keep it consistent within a block so every plant receives the same. Inconsistent hand punching is the main way a punched system ends up irrigating unevenly.",
          },
        ],
      },
      mr: {
        title: "साधी लेटरल की इनलाइन ठिबक? छिद्र पाडलेला पाइप कधी योग्य",
        metaDescription:
          "साध्या १६ मिमी लेटरलमध्ये एमिटर बसवलेले नसतात, त्यामुळे अंतर तुम्ही ठरवता. कारखान्यात बसवलेल्या इनलाइन लेटरलपेक्षा हे कधी चांगले ठरते.",
        excerpt:
          "इनलाइन ठिबक लवकर टाकता येते. साधी लेटरल तुम्हाला अंतर ठरवू देते, आणि पुढच्या हंगामात ओळ बदलल्याशिवाय ते बदलू देते.",
        sections: [
          {
            heading: "साधी लेटरल कशासाठी",
            body: [
              "साधी लेटरल म्हणजे ठिबक सिस्टमचा कोरा कॅनव्हास: १६ मिमी पॉलिथिलीन पाइप, ज्यात एमिटर बसवलेले नसतात, आणि जिथे आउटलेट हवा तिथे छिद्र पाडले जाते. आमची लेटरल IS 12786 नुसार Class 2 मध्ये १.१ ते १.३ मिमी भिंतीसह तयार होते.",
              "ही भिंत आमच्या १६ मिमी इनलाइन लेटरलइतकीच आहे, आणि हे ऐकायला साधे वाटले तरी महत्त्वाचे आहे: त्यामुळे संपूर्ण ब्लॉक एकाच दाब पद्धतीवर चालतो, दोन वेगळ्या पद्धतींवर नाही.",
            ],
          },
          {
            heading: "छिद्र पाडलेला पाइप इनलाइनपेक्षा कधी चांगला",
            body: [
              "हंगामांत झाडांचे अंतर बदलत असेल, असमान झाडांच्या फळबागेसाठी टाकत असाल, किंवा ओळ न बदलता नंतर एमिटर हलवण्याची मोकळीक हवी असेल तर साधी लेटरल निवडा. कारखान्यात बसवलेला एमिटर हलवता येत नाही; पाडलेले छिद्र बंद करून दुसरीकडे पाडता येते.",
              "मॅनिफोल्डपर्यंत पाणी नेण्यासाठी किंवा पुढील ओळीला पुरवठा करण्यासाठीही हीच नेहमीची निवड असते, आणि ती ड्रिपरसोबतच मायक्रो-स्प्रिंकलर, जेट व फॉगरसोबतही चालते — एकाच पाइपला एकापेक्षा जास्त कामे द्यायची असतील तेव्हा हे उपयोगी ठरते.",
            ],
          },
          {
            heading: "स्वतः छिद्र पाडताना काय लक्षात ठेवावे",
            body: [
              "तडजोड म्हणजे मजुरी व सातत्य. इनलाइन ठिबक येते तेव्हाच एमिटरचे अंतर बरोबर असते, त्यामुळे टाकताना जागेवर कापणे, जोडणे किंवा एमिटर हरवण्याचा धोका नसतो; साध्या लेटरलमध्ये प्रत्येक आउटलेट हा शेतात घेतलेला निर्णय असतो.",
              "म्हणूनच अंतर खरोखर वेगळे लागत असेल तेव्हा ही योग्य निवड ठरते, आणि लागत नसेल तेव्हा चुकीची. पीक समान अंतरावर असेल व नमुना माहीत असेल, तर तितक्याच पैशात इनलाइन लेटरल जास्त लवकर व जास्त सातत्याने बसते.",
            ],
          },
        ],
        faq: [
          {
            question: "साधी लेटरल सब-मेन म्हणून वापरता येते का?",
            answer:
              "मॅनिफोल्डपर्यंत पाणी नेण्यासाठी किंवा पुढील ओळीला पुरवठा करण्यासाठी ती नेहमी वापरली जाते. सब-मेन म्हणून तीच हवी की नाही हे तिला वाहावे लागणारे प्रवाह व ओळीची लांबी यांवर अवलंबून असते, त्यामुळे सवयीने नव्हे तर ब्लॉकच्या हिशेबाने आकार ठरवा.",
          },
          {
            question: "साध्या १६ मिमी लेटरलवर कोणता ड्रिपर बसतो?",
            answer:
              "१६ मिमी बार्ब असलेले ऑनलाइन ड्रिपर व एमिटर, हेच मानक फिट आहे. आमचा PC ऑनलाइन एमिटर व आमची साधी लेटरल दोन्ही १६ मिमी बार्बवर आहेत, त्यामुळे अडॅप्टरशिवाय थेट जोडता येतात.",
          },
          {
            question: "छिद्र किती अंतरावर पाडावी?",
            answer:
              "झाडांच्या अंतराएवढी, आणि एका ब्लॉकमध्ये ते एकसारखे ठेवा जेणेकरून प्रत्येक झाडाला समान मिळेल. हाताने असमान छिद्र पाडणे हेच छिद्र पाडलेल्या सिस्टममध्ये असमान सिंचन होण्याचे मुख्य कारण आहे.",
          },
        ],
      },
    },
  },
  {
    slug: "drip-lateral-12mm-vs-16mm",
    productSlug: "krusheebindoo-flat-inline-drip-16mm-4lph-30cm",
    publishedAt: "2026-10-08",
    updatedAt: "2026-10-08",
    copy: {
      en: {
        title: "12 mm vs 16 mm Drip Lateral: Which Diameter Should You Specify?",
        metaDescription:
          "Both are IS 13488 Class 2 laterals with 4 LPH emitters. The difference is flow capacity and run length. Here is how to choose between 12 mm and 16 mm.",
        excerpt:
          "Same standard, same 4 LPH emitters, different bore. The diameter decides how far a lateral runs before the far end loses pressure.",
        sections: [
          {
            heading: "What the diameter actually changes",
            body: [
              "Both of our flat inline laterals are manufactured to IS 13488:2008 in Class 2, both deliver 4 litres per hour from factory-fixed emitters, and both work at 1.0 to 2.0 bar. The diameter is not a quality difference, it is a capacity difference.",
              "A wider bore carries more water for the same pressure loss. That is the whole story: 16 mm holds its discharge over a longer run and tolerates a steeper field, while 12 mm loses pressure sooner along the row. If your laterals are short and your ground is level, that extra capacity buys you nothing.",
            ],
          },
          {
            heading: "When 12 mm is the right answer",
            body: [
              "Choose 12 mm for closely spaced row crops on short runs and reasonably level ground. The narrower bore is lighter and more flexible, so it is easier to handle, and it costs less per roll — a block that does not need the extra capacity should not pay for it.",
              "It is also the friendlier lateral to move. The flat profile lies close to the soil, which cuts wind drag, and the lighter wall makes it easier to lift, re-lay or keep for a second season.",
            ],
          },
          {
            heading: "When to move up to 16 mm",
            body: [
              "Step up to 16 mm when the lateral run is long, when the field slopes, or when the sub-main already runs at the upper end of the working range. The wider bore tolerates higher pressure and keeps the far end of the row close to the near end — which is what stops a block being well watered at one end and barely at the other.",
              "It is also the better choice where a block has to be run as one long lateral rather than split into sub-blocks, because splitting means more sub-main, more fittings and more labour at installation.",
            ],
          },
          {
            heading: "The spacing difference that comes with it",
            body: [
              "The 16 mm lateral is the finest-spacing option we manufacture, with emitters fixed at 30 cm rather than 40 cm. That puts roughly 33,000 outlets into a single 5000 m roll.",
              "Denser outlets mean a smaller, more frequent dose at each plant and a more even moisture band through the root zone, which is what high-value horticulture responds to. Wider spacing suits crops with larger root volumes, where one outlet can serve more soil.",
            ],
          },
        ],
        faq: [
          {
            question: "Can I run 12 mm and 16 mm laterals on the same block?",
            answer:
              "You can, but it is better not to. The two bores lose pressure at different rates, so a mixed block tends to over-water the 12 mm rows and under-water the 16 mm ones. Keep one diameter per sub-block and valve it separately.",
          },
          {
            question: "Does 16 mm deliver more water per emitter?",
            answer:
              "No. Both are rated at 4 litres per hour. The 16 mm lateral carries more water in total because it can supply more emitters over a longer run, not because each emitter discharges more.",
          },
          {
            question: "How long can a lateral run be?",
            answer:
              "It depends on inlet pressure, ground slope and how many emitters are downstream, so it has to be worked out per block rather than quoted as one figure. If the far end of a row is visibly weaker than the near end, the run is too long for that diameter or the pressure is too low.",
          },
        ],
      },
      mr: {
        title: "१२ मिमी की १६ मिमी ठिबक लेटरल: कोणता व्यास निवडावा?",
        metaDescription:
          "दोन्ही IS 13488 Class 2 लेटरल, दोन्हींत ४ LPH एमिटर. फरक प्रवाह क्षमता व लांबीचा. १२ मिमी व १६ मिमी यांत निवड कशी करावी हे पहा.",
        excerpt:
          "एकच मानक, एकच ४ LPH एमिटर, फरक फक्त बोअरचा. व्यास ठरवतो की लेटरल किती लांब नेता येईल.",
        sections: [
          {
            heading: "व्यासामुळे प्रत्यक्षात काय बदलते",
            body: [
              "आमची दोन्ही फ्लॅट इनलाइन लेटरल IS 13488:2008 नुसार Class 2 मध्ये तयार होतात, दोन्हींत कारखान्यातच बसवलेले ४ लिटर प्रति तास एमिटर असतात, आणि दोन्ही १.० ते २.० बारवर चालतात. व्यास हा गुणवत्तेचा फरक नाही — तो क्षमतेचा फरक आहे.",
              "रुंद बोअर समान दाब तोट्यात जास्त पाणी वाहून नेते. एवढाच मुद्दा आहे: १६ मिमी लांब ओळीतही प्रवाह टिकवते व उतार असलेल्या शेतात टिकते, तर १२ मिमी ओळीभर लवकर दाब गमावते. ओळी लहान असतील व जमीन सपाट असेल, तर ही अतिरिक्त क्षमता काहीच देते.",
            ],
          },
          {
            heading: "१२ मिमी कधी योग्य",
            body: [
              "जवळच्या अंतरावरील ओळीच्या पिकांसाठी, लहान ओळी व बऱ्यापैकी सपाट जमिनीवर १२ मिमी निवडा. बारीक बोअर हलका व लवचिक असतो, हाताळायला सोपा असतो आणि प्रति रोल खर्चही कमी येतो — ज्या ब्लॉकला अतिरिक्त क्षमता लागत नाही, त्याने तिचा खर्च करू नये.",
              "ही लेटरल हलवायलाही सोपी आहे. सपाट आकार जमिनीला चिकटून राहतो, त्यामुळे वाऱ्याचा ताण कमी होतो, आणि हलकी भिंत उचलून दुसऱ्या हंगामात पुन्हा वापरणे सोपे जाते.",
            ],
          },
          {
            heading: "१६ मिमी कधी घ्यावे",
            body: [
              "लेटरलची ओळ लांब असेल, शेताला उतार असेल, किंवा सब-मेन आधीच कार्य दाबाच्या वरच्या टोकावर चालत असेल, तर १६ मिमी घ्या. रुंद बोअर जास्त दाब सहन करतो आणि ओळीचे दूरचे टोक जवळच्या टोकाच्या जवळ ठेवतो — एका ब्लॉकचे एक टोक नीट तर दुसरे टोक जेमतेम भिजणे हेच यामुळे थांबते.",
              "जिथे ब्लॉक एका लांब लेटरलने चालवावा लागतो, तिथेही हेच योग्य. ब्लॉकचे तुकडे केल्यास जास्त सब-मेन, जास्त फिटिंग्ज आणि बसवताना जास्त मजुरी लागते.",
            ],
          },
          {
            heading: "सोबत येणारा अंतराचा फरक",
            body: [
              "१६ मिमी लेटरल आमची सर्वात बारीक अंतराची लेटरल आहे — एमिटर ४० सें.मी. ऐवजी ३० सें.मी. अंतरावर बसवलेले असतात. त्यामुळे एका ५००० मीटर रोलमध्ये सुमारे ३३,००० आउटलेट मिळतात.",
              "दाट आउटलेट म्हणजे प्रत्येक झाडाला लहान व वारंवार मात्रा, आणि मुळांच्या क्षेत्रात अधिक समान ओल — महागड्या पिकांना हेच लागते. मोठ्या मुळांच्या पिकांना एक आउटलेट जास्त जमीन झाकत असल्याने तिथे मोठे अंतर चालते.",
            ],
          },
        ],
        faq: [
          {
            question: "एकाच ब्लॉकमध्ये १२ मिमी व १६ मिमी दोन्ही लेटरल चालवता येतात का?",
            answer:
              "चालवता येतात, पण नको. दोन्ही बोअर वेगवेगळ्या दराने दाब गमावतात, त्यामुळे मिसळलेल्या ब्लॉकमध्ये १२ मिमी ओळींना जास्त व १६ मिमी ओळींना कमी पाणी मिळते. एका सब-ब्लॉकला एकच व्यास ठेवा व स्वतंत्र व्हाव्ह द्या.",
          },
          {
            question: "१६ मिमी जास्त पाणी देते का?",
            answer:
              "नाही. दोन्ही ४ लिटर प्रति तास क्षमतेची आहेत. १६ मिमी एकूण जास्त पाणी वाहून नेते कारण ती लांब ओळीत जास्त एमिटरना पुरवठा करू शकते — प्रत्येक एमिटर जास्त ओततो म्हणून नाही.",
          },
          {
            question: "लेटरल किती लांब नेता येते?",
            answer:
              "ते प्रवेश दाब, जमिनीचा उतार व पुढील एमिटरची संख्या यांवर अवलंबून असते, त्यामुळे एकच आकडा सांगता येत नाही — प्रत्येक ब्लॉकसाठी आकडेमोड करावी लागते. ओळीचे दूरचे टोक जवळच्यापेक्षा स्पष्ट कमजोर वाटत असेल, तर ओळ व्यासापेक्षा लांब आहे किंवा दाब कमी आहे.",
          },
        ],
      },
    },
  },
  {
    slug: "screen-filter-vs-disc-filter",
    productSlug: "krusheebindoo-inline-screen-filter-2-inch",
    publishedAt: "2026-10-07",
    updatedAt: "2026-10-07",
    copy: {
      en: {
        title: "Screen Filter or Disc Filter? Matching the Filter to Your Water",
        metaDescription:
          "Most drip failures start with a blocked emitter, and almost all of those start with unfiltered water. Here is how to choose between a screen and a disc filter.",
        excerpt:
          "Most drip failures start with a blocked emitter. Choosing the right first filter is the cheapest insurance a drip system has.",
        sections: [
          {
            heading: "Why filtration decides whether the system works",
            body: [
              "Most drip irrigation failures come down to blocked emitters, and almost all of those begin with suspended solids in the source water. A filter is not an accessory bolted on at the end of the design — it is the component that decides whether the rest of the system performs at all.",
              "The practical question is not which filter is better in general. It is what your water is carrying. Silt behaves differently from algae, and algae behaves differently from a heavy organic load, and each of those points at a different element.",
            ],
          },
          {
            heading: "What a screen filter does well",
            body: [
              "A screen filter passes water through a fine mesh that traps silt, algae and suspended organic matter before it reaches the laterals. Our 2 inch inline screen filter is rated at 120 mesh, roughly 125 micron, and handles up to 40 m³/h at a maximum working pressure of 10 bar.",
              "It is the right first stage for relatively clean borewell or canal water, and it works well as a secondary stage behind a sand media filter. The clear bowl is the part that matters day to day: you can see the element and judge when it needs cleaning without breaking the line. The flanged top unscrews for fast element removal, and INLET and OUTLET are moulded into the body so the unit cannot be plumbed backwards in the field.",
            ],
          },
          {
            heading: "When to choose a disc filter instead",
            body: [
              "Where a screen blocks, a disc filter separates. Instead of a single mesh, a stack of thin grooved discs traps contaminants in the grooves between them. That gives a far larger filtration area and holds much more dirt before the pressure drop becomes noticeable — which is exactly what pond, canal and recycled water need.",
              "Our 2 inch disc filter is rated at 130 micron with a maximum working pressure of 10 bar and up to 40 m³/h, and it is the usual second stage after a sand media filter. Because each disc can be removed, washed or replaced individually, there is no heavy cartridge to discard, and the whole stack separates with a single clamp for servicing between irrigation cycles.",
            ],
          },
        ],
        faq: [
          {
            question: "Can I use a screen filter on pond water?",
            answer:
              "You can, but it will need cleaning far more often. Pond and canal water carries algae and heavier organic load, which blinds a fine mesh quickly. A disc filter holds much more dirt before the pressure drop shows, so it is the better first stage there.",
          },
          {
            question: "Do I need more than one filter?",
            answer:
              "Often yes. A sand media filter followed by a screen or disc filter is a common two-stage arrangement on dirty water, with the media filter taking the bulk of the load and the finer element catching what gets through. The right number of stages depends on the source, so it is worth describing your water when you ask for a recommendation.",
          },
          {
            question: "How do I know when a filter needs cleaning?",
            answer:
              "The honest answer is a pressure differential, but the practical one is the bowl. On a screen filter the clear body lets you see how loaded the element is, which is why we keep it clear rather than opaque.",
          },
        ],
      },
      mr: {
        title: "स्क्रीन फिल्टर की डिस्क फिल्टर? पाण्यानुसार फिल्टर निवडा",
        metaDescription:
          "ठिबक सिंचनातील बहुतेक बिघाड बंद पडलेल्या एमिटरमुळे होतात, आणि त्यामागे बहुधा गाळण न केलेले पाणी असते. स्क्रीन व डिस्क फिल्टर यांत निवड कशी करावी.",
        excerpt:
          "ठिबक सिंचनातील बहुतेक बिघाड बंद पडलेल्या एमिटरमुळे होतात. योग्य पहिला फिल्टर हे सिस्टमचे सर्वात स्वस्त संरक्षण आहे.",
        sections: [
          {
            heading: "गाळण ठरवते की सिस्टम चालेल की नाही",
            body: [
              "ठिबक सिंचनातील बहुतेक बिघाड बंद पडलेल्या एमिटरमुळे होतात, आणि त्यामागे जवळजवळ नेहमी स्रोताच्या पाण्यातील तरंगते घनपदार्थ असतात. फिल्टर हा शेवटी जोडलेला उपसाधन नाही — उर्वरित सिस्टम चालेल की नाही हे ठरवणारा घटक आहे.",
              "प्रत्यक्ष प्रश्न हा नाही की कोणता फिल्टर सर्वसाधारणपणे चांगला. प्रश्न हा आहे की तुमचे पाणी काय वाहून आणते. गाळ वेगळ्या पद्धतीने वागतो, अल्गी वेगळ्या पद्धतीने, आणि जड सेंद्रिय पदार्थ वेगळ्या पद्धतीने — आणि प्रत्येकासाठी वेगळा घटक योग्य ठरतो.",
            ],
          },
          {
            heading: "स्क्रीन फिल्टर काय चांगले करतो",
            body: [
              "स्क्रीन फिल्टर पाणी बारीक जाळीतून जाऊ देते, जी लेटरलपर्यंत पोहोचण्यापूर्वी गाळ, अल्गी व तरंगते सेंद्रिय पदार्थ अडवते. आमचा २ इंच इनलाइन स्क्रीन फिल्टर १२० मेश — सुमारे १२५ मायक्रॉन — क्षमतेचा असून १० बार कमाल कार्य दाबावर ४० घनमीटर प्रति तासापर्यंत पाणी घेतो.",
              "बऱ्यापैकी स्वच्छ बोअरवेल किंवा कालव्याच्या पाण्यासाठी हा योग्य पहिला टप्पा आहे, आणि वाळू मीडिया फिल्टरनंतर दुसरा टप्पा म्हणूनही चांगला चालतो. रोजच्या वापरात पारदर्शक पात्र महत्त्वाचे ठरते: ओळ तोडल्याशिवाय घटक किती भरला आहे हे दिसते. वरचे फ्लँज स्क्रू उघडून घटक पटकन काढता येतो, आणि बॉडीवर INLET व OUTLET ठसे असल्याने शेतात उलट बसवणे शक्य होत नाही.",
            ],
          },
          {
            heading: "त्याऐवजी डिस्क फिल्टर कधी निवडावा",
            body: [
              "जिथे स्क्रीन अडकते, तिथे डिस्क वेगळे करते. एका जाळीऐवजी पातळ खोबणी असलेल्या डिस्कचा स्टॅक त्यांच्यातील खोबणीत घाण अडवतो. त्यामुळे गाळणीचे क्षेत्र खूप मोठे होते आणि दाब कमी होणे जाणवण्यापूर्वी तो बराच घाण सहन करतो — तलाव, कालवा व पुनर्वापराच्या पाण्याला नेमके हेच लागते.",
              "आमचा २ इंच डिस्क फिल्टर १३० मायक्रॉन क्षमतेचा, १० बार कमाल कार्य दाब व ४० घनमीटर प्रति तासापर्यंत प्रवाह देणारा असून वाळू मीडिया फिल्टरनंतरचा नेहमीचा दुसरा टप्पा आहे. प्रत्येक डिस्क स्वतंत्रपणे काढता, धुवता किंवा बदलता येते, त्यामुळे फेकून देण्यासारखा जड कार्ट्रिज नसतो; एका क्लॅम्पने संपूर्ण स्टॅक उघडतो, त्यामुळे सिंचन फेऱ्यांदरम्यान सेवा पटकन होते.",
            ],
          },
        ],
        faq: [
          {
            question: "तलावाच्या पाण्याला स्क्रीन फिल्टर वापरता येतो का?",
            answer:
              "येतो, पण खूप वारंवार साफ करावा लागतो. तलाव व कालव्याच्या पाण्यात अल्गी व जड सेंद्रिय भार असतो, जो बारीक जाळी लवकर बंद करतो. डिस्क फिल्टर दाब कमी होणे जाणवण्यापूर्वी बरीच घाण सहन करतो, त्यामुळे तिथे तोच योग्य पहिला टप्पा आहे.",
          },
          {
            question: "एकापेक्षा जास्त फिल्टर लागतात का?",
            answer:
              "अनेकदा होय. घाण पाण्यावर वाळू मीडिया फिल्टरनंतर स्क्रीन किंवा डिस्क फिल्टर ही नेहमीची दोन टप्प्यांची रचना असते — मीडिया फिल्टर बहुतेक भार घेतो आणि बारीक घटक आत जाणारे उरलेले अडवतो. किती टप्पे लागतील हे स्रोतावर अवलंबून असते, त्यामुळे शिफारस मागताना तुमच्या पाण्याचे वर्णन करा.",
          },
          {
            question: "फिल्टरला साफ करण्याची वेळ आली हे कळते कसे?",
            answer:
              "खरा निकष दाबातील फरक आहे, पण प्रत्यक्षात पात्र पाहून कळते. स्क्रीन फिल्टरचे पारदर्शक पात्र घटक किती भरला आहे हे दाखवते — म्हणूनच ते अपारदर्शक ठेवलेले नाही.",
          },
        ],
      },
    },
  },
  {
    slug: "pressure-compensating-emitters-slopes",
    productSlug: "krusheebindoo-pc-online-emitter-8lph",
    publishedAt: "2026-10-06",
    updatedAt: "2026-10-06",
    copy: {
      en: {
        title: "Why Pressure-Compensating Emitters Pay Off on Sloping Fields",
        metaDescription:
          "A normal dripper waters less at the far end of a row because the pressure is lower there. Pressure-compensating emitters hold the flow steady from 0.5 to 3.5 bar.",
        excerpt:
          "On undulating ground or long runs, an ordinary dripper delivers visibly different amounts along the row. Pressure compensation fixes that.",
        sections: [
          {
            heading: "The problem with ordinary drippers on a slope",
            body: [
              "A normal non-compensating dripper discharges less water simply because the pressure at its end is lower than at the head of the line. On undulating ground, a long block, or a system running without a pressure regulator, that difference shows up as visibly uneven irrigation — one end of the row dry while the other end ponds.",
              "The plants themselves are the tell. If the crop looks noticeably stronger at the head of the block and weaker at the tail, that is not a soil problem, it is a pressure gradient, and no amount of extra pumping will even it out.",
            ],
          },
          {
            heading: "What pressure compensation actually means",
            body: [
              "A pressure-compensating emitter contains a flexible silicone diaphragm that holds the flow steady across a wide working range. Ours is rated from 0.5 to 3.5 bar and delivers a constant 8 litres per hour anywhere in that band.",
              "In practice that means every plant receives the same 8 litres per hour regardless of its position on the line. The emitter is a 16 mm barb fit with a PP body and silicone diaphragm, so it goes straight onto plain lateral without adaptors.",
            ],
          },
          {
            heading: "Where PC earns its extra cost",
            body: [
              "Pressure compensation costs more per emitter, so it is worth being deliberate about when to buy it. Sloping fields, long lateral runs, polyhouses, and any installation where you cannot guarantee level pressure are the clear cases.",
              "The other case is a block that is already built. If you are laying new lateral through a field that has always irrigated unevenly, PC emitters are usually cheaper than re-plumbing the block into smaller, valved zones.",
            ],
          },
        ],
        faq: [
          {
            question: "Do pressure-compensating emitters need a pressure regulator?",
            answer:
              "They tolerate a wide range, from 0.5 to 3.5 bar, so they are far more forgiving than non-compensating drippers. That said, keeping the system inside the working range still protects the emitters and the pipework, so a regulator is good practice where the supply pressure is unpredictable.",
          },
          {
            question: "Can I mix PC and non-PC emitters on one lateral?",
            answer:
              "Not usefully. The whole point of PC is even discharge along the line; mixing in emitters that vary with pressure gives you the unevenness back. Keep a lateral either PC or non-PC.",
          },
          {
            question: "Is 8 litres per hour too much for young plants?",
            answer:
              "It is a higher discharge than a 4 LPH emitter, so it suits larger root volumes, wider spacing and heavier soils. For close-spaced young plants a 4 LPH emitter running longer is usually the better match.",
          },
        ],
      },
      mr: {
        title: "उतार असलेल्या शेतात दाब-भरित (PC) एमिटर का फायद्याचे",
        metaDescription:
          "सामान्य ड्रिपर ओळीच्या दूरच्या टोकाला कमी पाणी देते कारण तिथे दाब कमी असतो. दाब-भरित एमिटर ०.५ ते ३.५ बारमध्ये प्रवाह स्थिर ठेवतात.",
        excerpt:
          "उतार असलेल्या किंवा लांब ओळींमध्ये सामान्य ड्रिपर ओळीभर वेगळे पाणी देते. दाब-भरित एमिटर हा फरक संपवतात.",
        sections: [
          {
            heading: "उतारावर सामान्य ड्रिपरचा प्रश्न",
            body: [
              "सामान्य (नॉन-कंपन्सेटिंग) ड्रिपर ओळीच्या दूरच्या टोकाला कमी पाणी ओततो कारण तिथे दाब सुरुवातीपेक्षा कमी असतो. उतार असलेल्या जमिनीवर, लांब ब्लॉकमध्ये, किंवा दाब नियंत्रक नसलेल्या सिस्टममध्ये हा फरक डोळ्यांना दिसणाऱ्या असमान सिंचनातून बाहेर पडतो — ओळीचे एक टोक कोरडे तर दुसरे टोक डबक्याने भरलेले.",
              "झाडेच सांगतात. ब्लॉकच्या सुरुवातीला पीक स्पष्ट मजबूत आणि शेवटी कमजोर दिसत असेल, तर तो मातीचा प्रश्न नाही — तो दाबातील उतरता क्रम आहे, आणि जास्त पंपिंग करूनही तो सुटत नाही.",
            ],
          },
          {
            heading: "दाब-भरित म्हणजे नेमके काय",
            body: [
              "दाब-भरित एमिटरमध्ये लवचिक सिलिकॉन डायाफ्राम असतो, जो मोठ्या कार्य परिघात प्रवाह स्थिर ठेवतो. आमचा एमिटर ०.५ ते ३.५ बारपर्यंत असून त्या संपूर्ण पट्ट्यात स्थिर ८ लिटर प्रति तास देतो.",
              "प्रत्यक्षात म्हणजे ओळीवरील स्थान कोणतेही असो, प्रत्येक झाडाला समान ८ लिटर प्रति तास मिळतात. हा एमिटर १६ मिमी बार्बवर बसतो, PP बॉडी व सिलिकॉन डायाफ्रामसह, त्यामुळे अडॅप्टरशिवाय थेट साध्या लेटरलवर बसतो.",
            ],
          },
          {
            heading: "PC चा अतिरिक्त खर्च कधी वसूल होतो",
            body: [
              "दाब-भरित एमिटरचा प्रति एमिटर खर्च जास्त असतो, त्यामुळे कधी घ्यावे हे ठरवून घ्यावे. उतार असलेली शेते, लांब लेटरल ओळी, पॉलीहाऊस, आणि दाब सारखा राहील याची खात्री देता येणार नाही अशी कोणतीही बसवणी — ही स्पष्ट प्रकरणे.",
              "दुसरे प्रकरण म्हणजे आधीच तयार असलेला ब्लॉक. ज्या शेतात नेहमी असमान सिंचन होत आले आहे, तिथे नवीन लेटरल टाकत असाल, तर ब्लॉकचे लहान व्हाव्हयुक्त विभाग करण्यापेक्षा PC एमिटर बहुधा स्वस्त पडतात.",
            ],
          },
        ],
        faq: [
          {
            question: "दाब-भरित एमिटरना दाब नियंत्रक लागतो का?",
            answer:
              "ते ०.५ ते ३.५ बारपर्यंत मोठा परिघ सहन करतात, त्यामुळे नॉन-कंपन्सेटिंग ड्रिपरपेक्षा खूप सहनशील आहेत. तरीही सिस्टम कार्य परिघात ठेवल्यास एमिटर व पाइपलाइनचे रक्षण होते, त्यामुळे पुरवठा दाब अनिश्चित असेल तर नियंत्रक ठेवणे योग्य.",
          },
          {
            question: "एकाच लेटरलवर PC व नॉन-PC एमिटर मिसळता येतात का?",
            answer:
              "उपयोगी पद्धतीने नाही. PC चा उद्देशच ओळीभर समान प्रवाह आहे; दाबानुसार बदलणारे एमिटर मिसळल्यास असमानता परत येते. एक लेटरल एकतर PC किंवा नॉन-PC ठेवा.",
          },
          {
            question: "८ लिटर प्रति तास लहान झाडांना जास्त होत नाही का?",
            answer:
              "४ LPH एमिटरपेक्षा हा प्रवाह जास्त आहे, त्यामुळे तो मोठ्या मुळांचे प्रमाण, मोठे अंतर व जड मातीसाठी योग्य आहे. जवळच्या अंतरावरील लहान झाडांसाठी जास्त वेळ चालणारा ४ LPH एमिटर बहुधा जास्त योग्य ठरतो.",
          },
        ],
      },
    },
  },
  {
    slug: "drip-subsidy-application",
    productSlug: "krusheebindoo-flat-inline-drip-16mm-4lph-30cm",
    publishedAt: "2026-10-08",
    updatedAt: "2026-10-08",
    copy: {
      en: {
        title: "Drip Irrigation Subsidy: How to Apply and Why Claims Get Rejected",
        metaDescription:
          "Most subsidy claims fail on paperwork rather than on the field. IS-marked material, a quotation from a registered dealer and matching land records decide the outcome.",
        excerpt:
          "Subsidy is settled on paper long before an inspector reaches the field. IS marking and a matching name on the 7/12 are what most claims turn on.",
        sections: [
          {
            heading: "Why IS marking decides eligibility",
            body: [
              "Every micro-irrigation subsidy in India is tied to material that carries the IS mark. That is not a formality. The scheme pays for a specified standard of pipe, and a lateral that is not marked to that standard cannot be verified as being it.",
              "Both of our flat inline laterals are made to IS 13488:2008 Class 2, and the plain lateral to IS 12786. The standard is moulded into the pipe rather than printed on a label, so it survives the season and it survives the inspection. If you are buying material to claim on, look for the mark before the invoice is written, not after.",
            ],
          },
          {
            heading: "What the file actually needs",
            body: [
              "The paperwork is ordinary: the 7/12 extract for the survey number being irrigated, Aadhaar, a bank passbook in the same name, and a quotation or invoice from a dealer registered for the scheme.",
              "The step that catches people out is sequence. Take the quotation first and the approval second. Material bought before approval is the most common single reason a claim is refused, because the scheme reimburses against an approved estimate rather than against a receipt.",
            ],
          },
          {
            heading: "Where claims stall",
            body: [
              "Almost every rejection traces back to one of four things: the name on the 7/12 not matching the name on the bank account, a quotation from a dealer who is not registered for the scheme, material bought before approval, or an invoice that does not carry the IS mark.",
              "Rates and per-hectare caps change by state, by farmer category and by year. Treat any figure you read anywhere, including on this page, as a starting point, and confirm the current one with your Krishi Vibhag or on the official scheme portal before you commit money.",
            ],
          },
        ],
        faq: [
          {
            question: "Can I claim subsidy on material I have already bought?",
            answer:
              "That is the case that most often fails. Approval is normally given against an estimate before purchase, and the scheme reimburses against that approved estimate. If you have already bought, raise it with your Krishi Vibhag rather than assuming it will not be covered.",
          },
          {
            question: "Does the land have to be in my own name?",
            answer:
              "The 7/12 extract and the bank account need to agree. Where land is held jointly or in a family member's name, that is a paperwork problem to settle before the application rather than after it.",
          },
          {
            question: "Is there a subsidy for repairing an existing system?",
            answer:
              "Renovation of an existing system is treated separately from a new installation, and the rules differ by state. Ask specifically about renovation when you enquire, because it is not the same application form.",
          },
        ],
      },
      mr: {
        title: "ठिबक सिंचन अनुदान: अर्ज कसा करावा आणि दावे का फेटाळले जातात",
        metaDescription:
          "अनुदानाचे बहुतेक दावे शेतात नाही तर कागदपत्रांवरच फेटाळले जातात. IS मार्क असलेले साहित्य, नोंदणीकृत विक्रेत्याचे कोटेशन आणि जुळणारे ७/१२ हेच निर्णायक ठरतात.",
        excerpt:
          "अनुदान शेतात पोहोचण्याच्या खूप आधी कागदावर ठरते. IS मार्क आणि ७/१२ व बँक खात्यावरील नाव जुळणे यावरच बहुतेक दावे टिकतात किंवा फेटाळले जातात.",
        sections: [
          {
            heading: "IS मार्कच अनुदानाची पात्रता ठरवतो",
            body: [
              "भारतातील प्रत्येक सूक्ष्म सिंचन अनुदान योजना IS मार्क असलेल्या साहित्याशी जोडलेली आहे. हा केवळ औपचारिक भाग नाही. योजना ठराविक दर्जाच्या पाइपसाठी पैसे देते, आणि त्या दर्जाचा छाप नसलेली लेटरल तो दर्जा आहे हे पटवून देऊ शकत नाही.",
              "आमच्या दोन्ही फ्लॅट इनलाइन लेटरल्स IS १३४८८:२००८ क्लास २ नुसार आणि साधी लेटरल IS १२७८६ नुसार बनवली जाते. मानक लेबलावर छापलेले नाही तर पाइपवरच ठसवलेले असते, त्यामुळे ते हंगामही झेलते आणि तपासणीही. अनुदानासाठी साहित्य घेत असाल तर बिल लिहिण्याआधीच छाप तपासा, नंतर नाही.",
            ],
          },
          {
            heading: "फाइलला प्रत्यक्षात काय लागते",
            body: [
              "कागदपत्रे साधीच असतात: ज्या सर्व्हे नंबरवर सिंचन करायचे त्याचा ७/१२ उतारा, आधार, त्याच नावावरील बँक पासबुक, आणि योजनेसाठी नोंदणीकृत विक्रेत्याचे कोटेशन किंवा बिल.",
              "लोकांची गल्लत क्रमात होते. आधी कोटेशन घ्या, नंतर मंजुरी. मंजुरीआधी खरेदी केलेले साहित्य हे दावा नाकारला जाण्याचे सर्वात मोठे कारण आहे, कारण योजना मंजूर अंदाजपत्रकावर परतावा देते, पावतीवर नाही.",
            ],
          },
          {
            heading: "दावे कुठे अडकतात",
            body: [
              "जवळजवळ प्रत्येक नकार या चारपैकी एका कारणामुळे असतो: ७/१२ वरील नाव बँक खात्यावरील नावाशी न जुळणे, योजनेसाठी नोंदणी नसलेल्या विक्रेत्याचे कोटेशन, मंजुरीआधी केलेली खरेदी, किंवा IS मार्क नसलेले बिल.",
              "दर व प्रति हेक्टर मर्यादा राज्य, शेतकरी वर्ग आणि वर्षानुसार बदलतात. या पानावरील आकड्यासह कोणताही आकडा फक्त प्रारंभबिंदू माना, आणि पैसे खर्च करण्यापूर्वी सध्याचा दर तुमच्या कृषी विभागाकडून किंवा अधिकृत योजना पोर्टलवरून खात्री करा.",
            ],
          },
        ],
        faq: [
          {
            question: "आधीच खरेदी केलेल्या साहित्यावर अनुदान मिळू शकते का?",
            answer:
              "बहुतेकदा हाच दावा अडतो. सामान्यतः खरेदीपूर्वी अंदाजपत्रकावर मंजुरी मिळते आणि योजना त्याच मंजूर अंदाजावर परतावा देते. आधीच खरेदी केले असेल तर मिळणार नाही असे गृहीत धरण्यापूर्वी तुमच्या कृषी विभागाकडे तुमच्या प्रकरणाबद्दल विचारा.",
          },
          {
            question: "जमीन स्वतःच्या नावावर असावी लागते का?",
            answer:
              "७/१२ उतारा आणि बँक खाते जुळणे आवश्यक आहे. जमीन संयुक्त नावावर किंवा कुटुंबातील सदस्याच्या नावावर असल्यास ही कागदपत्रांची अडचण अर्जानंतर नाही तर आधी सोडवावी लागते.",
          },
          {
            question: "आधीच्या सिस्टमच्या दुरुस्तीवर अनुदान मिळते का?",
            answer:
              "सध्याच्या सिस्टमचे नूतनीकरण आणि नवीन बसवणी यांची प्रक्रिया वेगळी असते, आणि नियम राज्यानुसार बदलतात. चौकशी करताना नूतनीकरणाबद्दल स्वतंत्रपणे विचारा, कारण तो अर्ज वेगळा असतो.",
          },
        ],
      },
    },
  },
  {
    slug: "drip-cost-per-acre",
    productSlug: "krusheebindoo-flat-inline-drip-12mm-4lph-40cm",
    publishedAt: "2026-10-08",
    updatedAt: "2026-10-08",
    copy: {
      en: {
        title: "Drip Irrigation Cost per Acre: How to Work It Out",
        metaDescription:
          "Cost per acre is not one number, it follows row spacing. Worked from the actual roll price: our 12 mm lateral comes to about 92 paise a metre.",
        excerpt:
          "A lateral is priced by the roll but you buy by the acre. Row spacing is the conversion, and it is worth doing on paper before you commit.",
        sections: [
          {
            heading: "Start from the roll, not the acre",
            body: [
              "A drip lateral is sold by the roll and a field is measured in acres, so the two have to be converted before any price means anything. Our 12 mm flat inline lateral is 5000 metres to the roll at an M.R.P. of ₹4,585, which comes to about 92 paise a metre.",
              "That per-metre figure is the useful one, because it turns the question from what a roll costs into what your field actually needs.",
            ],
          },
          {
            heading: "Row spacing is the whole calculation",
            body: [
              "An acre is 4,047 square metres. Where laterals run down every crop row, the metres you need is that area divided by the row spacing. At 1.2 metre rows an acre needs about 3,370 metres, roughly two thirds of a roll and about ₹3,090 of lateral. At 1.5 metres it is about 2,700 metres, around ₹2,470. At 1.8 metres it is about 2,250 metres, around ₹2,060.",
              "Wider rows costing less is not obvious until you do the division. The catch is that wider rows also mean fewer emitters per square metre, so the same crop can need a longer run or a higher discharge to put the same water down.",
            ],
          },
          {
            heading: "What that number leaves out",
            body: [
              "The lateral is the largest single line, but it is not the system. A working installation also needs the filter, the sub-main, the take-off connectors and valves, the end fittings, and the labour to lay it all.",
              "So treat the per-acre figure above as the lateral budget and price the rest against a proper quotation. A quotation also lets you check the one thing a per-acre figure cannot: that the pipe being quoted is IS 13488 material and not a lighter wall at the same price.",
            ],
          },
        ],
        faq: [
          {
            question: "Is a longer roll cheaper per metre?",
            answer:
              "No. A 5000 metre roll is priced as a roll, so the rate per metre is the same however much you buy. Buying in full rolls saves you joints rather than rupees, and fewer joints means fewer places for the system to leak or come apart.",
          },
          {
            question: "Is 12 mm or 16 mm cheaper per acre?",
            answer:
              "Our 12 mm roll is ₹4,585 and the 16 mm roll is ₹6,225, both 5000 metres, so per acre the narrower pipe costs less. Whether it is the right choice depends on run length and slope rather than on price alone.",
          },
          {
            question: "Does this figure include the subsidy?",
            answer:
              "No. These are M.R.P. figures before any subsidy, and subsidy is settled separately once the installation is approved. Our guide on the subsidy application covers how that side of it works.",
          },
        ],
      },
      mr: {
        title: "ठिबक सिंचनाचा खर्च प्रति एकर कसा मोजावा",
        metaDescription:
          "प्रति एकर खर्च हा एकच आकडा नसतो, तो पंक्तीतील अंतरावर अवलंबून असतो. प्रत्यक्ष रोल दरावरून मोजलेला: आमची १२ मिमी लेटरल सुमारे ९२ पैसे प्रति मीटर.",
        excerpt:
          "लेटरल रोलने विकली जाते पण शेत एकरात मोजले जाते. पंक्तीतील अंतर हेच रूपांतर, आणि तो आकडा पैसे खर्च करण्यापूर्वी कागदावर काढून घ्यावा.",
        sections: [
          {
            heading: "एकरापासून नाही, रोलपासून सुरुवात करा",
            body: [
              "ठिबक लेटरल रोलने विकली जाते आणि शेत एकरात मोजले जाते, त्यामुळे कोणताही दर अर्थपूर्ण होण्यापूर्वी हे दोन्ही जुळवावे लागतात. आमची १२ मिमी फ्लॅट इनलाइन लेटरल रोलला ५००० मीटर असून M.R.P. ₹४,५८५ आहे, म्हणजे सुमारे ९२ पैसे प्रति मीटर.",
              "प्रति मीटरचा आकडा उपयोगी आहे, कारण तो प्रश्न 'रोल किती रुपयांचा' वरून 'माझ्या शेताला किती लागेल' असा करतो.",
            ],
          },
          {
            heading: "पंक्तीतील अंतर हेच संपूर्ण गणित",
            body: [
              "एक एकर म्हणजे ४,०४७ चौरस मीटर. प्रत्येक पंक्तीला लेटरल टाकली तर लागणारी लांबी म्हणजे हे क्षेत्रफळ भागिले पंक्तीतील अंतर. १.२ मीटर अंतरावर एकरला सुमारे ३,३७० मीटर लागतात, म्हणजे जवळपास दोन तृतीयांश रोल आणि सुमारे ₹३,०९० ची लेटरल. १.५ मीटरवर सुमारे २,७०० मीटर, म्हणजे जवळपास ₹२,४७०. १.८ मीटरवर सुमारे २,२५० मीटर, म्हणजे जवळपास ₹२,०६०.",
              "रुंद पंक्ती स्वस्त पडतात हे भागाकार केल्याशिवाय लक्षात येत नाही. पण रुंद पंक्तीत प्रति चौरस मीटर एमिटर कमी असतात, त्यामुळे त्याच पिकाला तेवढेच पाणी देण्यासाठी लांब रन किंवा जास्त डिस्चार्ज लागू शकतो.",
            ],
          },
          {
            heading: "या आकड्यात काय समाविष्ट नाही",
            body: [
              "लेटरल हा सर्वात मोठा एकच खर्च आहे, पण ती संपूर्ण सिस्टम नाही. कार्यरत बसवणीसाठी फिल्टर, सब-मेन, टेक-ऑफ कनेक्टर व व्हाव्ह, शेवटची फिटिंग्ज आणि मजुरीही लागते.",
              "त्यामुळे वरील प्रति एकर आकडा लेटरलचे बजेट माना आणि बाकीचे योग्य कोटेशनवर मिळवा. कोटेशनमुळे एक गोष्ट तपासता येते जी प्रति एकर आकड्याने तपासता येत नाही: जो पाइप कोट केला आहे तो IS १३४८८ चा आहे की त्याच दरात पातळ भिंतीचा.",
            ],
          },
        ],
        faq: [
          {
            question: "लांब रोल प्रति मीटर स्वस्त पडतो का?",
            answer:
              "नाही. ५००० मीटरचा रोल रोल म्हणूनच दर केला जातो, त्यामुळे कितीही घेतले तरी प्रति मीटर दर तोच राहतो. पूर्ण रोल घेतल्याने रुपये वाचत नाहीत, जोड वाचतात — आणि कमी जोड म्हणजे गळती किंवा निखळण्याची कमी ठिकाणे.",
          },
          {
            question: "प्रति एकर १२ मिमी स्वस्त की १६ मिमी?",
            answer:
              "आमचा १२ मिमी रोल ₹४,५८५ आणि १६ मिमी रोल ₹६,२२५, दोन्ही ५००० मीटर, त्यामुळे प्रति एकर बारीक पाइप स्वस्त पडतो. योग्य निवड फक्त दरावर नाही तर रनची लांबी व उतार यांवर अवलंबून असते.",
          },
          {
            question: "या आकड्यात अनुदान धरले आहे का?",
            answer:
              "नाही. येथील आकडे कोणत्याही अनुदानापूर्वीचे M.R.P. आहेत, आणि बसवणी मंजूर झाल्यावर अनुदान वेगळे दिले जाते. ती प्रक्रिया कशी चालते हे आमच्या अनुदान अर्जाच्या मार्गदर्शकात पहा.",
          },
        ],
      },
    },
  },
  {
    slug: "mulch-and-drip-lateral",
    productSlug: "krusheebindoo-flat-inline-drip-16mm-4lph-30cm",
    publishedAt: "2026-10-08",
    updatedAt: "2026-10-08",
    copy: {
      en: {
        title: "Laying a Drip Lateral Under Plastic Mulch",
        metaDescription:
          "Under mulch the lateral is buried for the season, so spacing and joints have to be right the first time. What changes when you lay the pipe under the sheet.",
        excerpt:
          "Once the mulch sheet is down the lateral cannot be adjusted, so everything that would be easy to change later has to be decided first.",
        sections: [
          {
            heading: "The sheet makes every later decision permanent",
            body: [
              "Laying a lateral on bare soil is forgiving. If the spacing is wrong or a run comes up short, you lift the pipe, punch it again and move it. Put a mulch sheet over it and that option is gone: the lateral sits under the sheet for the whole crop, and getting at it means disturbing the mulch you have already paid for.",
              "So the order matters. Settle the row spacing, the run lengths and the position of every take-off before the sheet goes down, not after.",
            ],
          },
          {
            heading: "Why a flat thin-wall lateral suits mulch",
            body: [
              "A flat lateral lies low against the soil, which is exactly what you want under a sheet. Our 16 mm flat inline lateral is made to IS 13488:2008 Class 2 with emitters at 30 cm, and the flat profile sits close enough to the bed that the mulch lies flat over it instead of tenting wherever the pipe passes.",
              "Emitters at 30 cm give a wet strip along the row rather than isolated points, and that is what a mulch bed wants: the sheet holds the moisture in and the strip wets the root zone evenly underneath it.",
            ],
          },
          {
            heading: "Joints are the part that fails",
            body: [
              "A joint under a mulch sheet is a leak you cannot see and cannot easily reach. Fewer joints is the most useful thing you can do, which is an argument for taking the lateral down the full row length rather than piecing it together.",
              "It is also an argument for checking run length before you buy rather than after. A run that is too long loses pressure at the far end, and under mulch the crop at that end simply receives less water with no visible sign until it shows in the plants.",
            ],
          },
        ],
        faq: [
          {
            question: "Can the lateral go on top of the mulch instead?",
            answer:
              "It can, and it is easier to service, but it stays exposed to sun and to anything that walks or drives over the bed. Under the sheet is the usual arrangement for a seasonal crop; on top is worth considering if you need to reach the emitters often.",
          },
          {
            question: "Do emitters clog faster under mulch?",
            answer:
              "The sheet does not clog emitters by itself, but it does hide them, so a blockage is found later. That is an argument for filtration you can inspect, and for checking pressure at the far end of a run rather than waiting for the crop to show it.",
          },
          {
            question: "Is 30 cm or a wider spacing better under mulch?",
            answer:
              "Under mulch the sheet is already limiting evaporation, so the wet strip is doing more of the work. A closer spacing such as 30 cm wets a continuous strip, which is usually what a mulched bed is after.",
          },
        ],
      },
      mr: {
        title: "प्लास्टिक मल्चखाली ठिबक लेटरल कशी अंथरावी",
        metaDescription:
          "मल्चखाली लेटरल हंगामभर पुरलेली असते, त्यामुळे अंतर व जोड पहिल्याच वेळी बरोबर हवेत. आच्छादनाखाली अंथरताना काय बदलते ते पहा.",
        excerpt:
          "मल्चचे आच्छादन अंथरल्यावर लेटरल हलवता येत नाही, त्यामुळे नंतर सहज बदलता आले असते ते सर्व आधीच ठरवावे लागते.",
        sections: [
          {
            heading: "आच्छादनामुळे नंतरचा प्रत्येक निर्णय कायमचा होतो",
            body: [
              "उघड्या जमिनीवर लेटरल अंथरणे सोपे असते. अंतर चुकले किंवा रन लहान पडला तर पाइप उचलून, पुन्हा छिद्र पाडून हलवता येतो. त्यावर मल्चचे आच्छादन अंथरले की ती सोय संपते: लेटरल संपूर्ण पिकभर आच्छादनाखाली राहते, आणि तिथवर पोहोचणे म्हणजे आधीच पैसे दिलेले आच्छादन बिघडवणे.",
              "त्यामुळे क्रम महत्त्वाचा आहे. आच्छादन अंथरण्याआधीच पंक्तीतील अंतर, रनची लांबी आणि प्रत्येक टेक-ऑफची जागा निश्चित करा, नंतर नाही.",
            ],
          },
          {
            heading: "मल्चसाठी फ्लॅट व पातळ भिंतीची लेटरलच योग्य",
            body: [
              "फ्लॅट लेटरल जमिनीला घट्ट बसते, आणि आच्छादनाखाली नेमके हेच हवे. आमची १६ मिमी फ्लॅट इनलाइन लेटरल IS १३४८८:२००८ क्लास २ नुसार असून ३० सें.मी. अंतरावर एमिटर आहेत, आणि फ्लॅट आकार वाफ्याला इतका घट्ट बसतो की आच्छादन पाइपच्या ठिकाणी तंबूसारखे उचलले जात नाही तर सपाट पडते.",
              "३० सें.मी. अंतरावरील एमिटर पंक्तीभर ओलसर पट्टा देतात, तुकड्या नाही — आणि मल्च वाफ्याला नेमके हेच लागते: आच्छादन ओलावा रोखते आणि पट्टा त्याखालील मुळांचा भाग समान ओला ठेवतो.",
            ],
          },
          {
            heading: "जोड हाच तुटणारा भाग",
            body: [
              "मल्चच्या आच्छादनाखालील जोड म्हणजे असा गळती जो दिसत नाही आणि सहज पोहोचत नाही. जोड कमी करणे हीच सर्वात उपयोगी गोष्ट, आणि म्हणून लेटरल तुकड्या जोडण्यापेक्षा पूर्ण पंक्तीभर एकसंध नेणे बरे.",
              "रनची लांबी विकत घेण्याआधी तपासण्याचे हेदेखील कारण आहे: नको इतका लांब रन शेवटी दाब गमावतो, आणि मल्चखाली शेवटच्या टोकाच्या पिकाला कमी पाणी मिळत असूनही पिकावर दिसेपर्यंत काहीच लक्षात येत नाही.",
            ],
          },
        ],
        faq: [
          {
            question: "लेटरल आच्छादनावर वर ठेवता येते का?",
            answer:
              "येते, आणि देखभाल सोपी होते, पण ती उन्हाला आणि वाफ्यावरून चालणाऱ्या किंवा धावणाऱ्या कशालाही उघडी राहते. हंगामी पिकासाठी आच्छादनाखाली ठेवणे हीच नेहमीची पद्धत; एमिटरकडे वारंवार पोहोचावे लागत असेल तर वर ठेवण्याचा विचार करा.",
          },
          {
            question: "मल्चखाली एमिटर लवकर बंद पडतात का?",
            answer:
              "आच्छादनामुळे एमिटर बंद पडत नाहीत, पण ते लपतात, त्यामुळे बंद पडल्याचे उशिरा कळते. म्हणून पाहता येणारी गाळण ठेवावी आणि पिकावर दिसण्याची वाट न पाहता रनच्या शेवटच्या टोकावर दाब तपासावा.",
          },
          {
            question: "मल्चखाली ३० सें.मी. की जास्त अंतर बरे?",
            answer:
              "आच्छादनाखाली बाष्पीभवन आच्छादनच रोखते, त्यामुळे ओलसर पट्टा जास्त काम करतो. ३० सें.मी.सारखे कमी अंतर सतत ओलसर पट्टा देतो, जो मल्च वाफ्याला सामान्यतः हवाच असतो.",
          },
        ],
      },
    },
  },
  {
    slug: "fertigation-and-filtration",
    productSlug: "krusheebindoo-disc-filter-2-inch",
    publishedAt: "2026-10-08",
    updatedAt: "2026-10-08",
    copy: {
      en: {
        title: "Fertigation Makes Filtration More Important, Not Less",
        metaDescription:
          "Dissolved fertiliser does not remove the need for a filter, it raises it. Salts and organic load blind a screen faster, so the filter choice changes.",
        excerpt:
          "Fertigation is sold as a way to feed the crop, but the practical bottleneck is the filter. Dissolved salts do not pass through the way water does.",
        sections: [
          {
            heading: "What fertigation actually puts in the line",
            body: [
              "Fertigation is usually described in terms of what it does for the crop, but it is worth thinking about what it puts into the pipe. Water-soluble fertiliser is dissolved, but it is not pure, and the fillers and impurities in a commercial grade do not disappear because the label says soluble.",
              "Add that to whatever the source water already carries and the filter is now handling two loads at once rather than one.",
            ],
          },
          {
            heading: "Why a disc stack copes better with that",
            body: [
              "A screen filter traps contaminants on a single mesh and blinds progressively: as the mesh loads, the pressure drop climbs. With fertiliser in the water there is more to trap, and a screen blinding at the wrong moment starves a block at exactly the point in the season when the crop is being fed through that line.",
              "A disc filter separates rather than blocks. Our 2 inch disc filter uses a 130 micron grooved disc stack rated to 40 m³/h at a maximum working pressure of 10 bar, and the grooves hold far more dirt before the pressure drop becomes noticeable. Each disc lifts out and can be washed, so a loaded stack is a cleaning job rather than a replacement.",
            ],
          },
          {
            heading: "Order of operations on a fertigation line",
            body: [
              "The usual arrangement puts the primary filter first, then the finer stage, and the injection point after that. Injecting after the filter is what you want: fertiliser goes into water that has already been cleaned rather than through the element that is catching the dirt.",
              "Whatever the arrangement, the indicator that matters is differential pressure. Fertigation changes the load through the season, so clean the filter on the gauge rather than on a calendar.",
            ],
          },
        ],
        faq: [
          {
            question: "Does fertigation need a different filter from plain water?",
            answer:
              "The filter still has to remove what is in the water, and fertigation adds to that load. A disc filter copes with the extra load better than a fine screen because it holds more dirt before the pressure drop shows.",
          },
          {
            question: "Can I inject fertiliser before the filter?",
            answer:
              "You can, and the filter will then catch anything the fertiliser carries, but it loads the element faster and the fertiliser has to pass through whatever is already trapped there. Injecting after the filter is the more usual arrangement.",
          },
          {
            question: "How often should the filter be cleaned when fertigating?",
            answer:
              "More often than on plain water, because there is more to trap. Go by the differential pressure gauge rather than a fixed interval, since the load changes with the fertiliser and with the season.",
          },
        ],
      },
      mr: {
        title: "विद्राव्य खते दिल्यावर गाळण अधिक महत्त्वाची होते, कमी नाही",
        metaDescription:
          "विद्राव्य खत गाळणीची गरज संपवत नाही तर वाढवते. क्षार व सेंद्रिय भारामुळे जाळी लवकर बंद होते, त्यामुळे फिल्टरची निवड बदलते.",
        excerpt:
          "विद्राव्य खत पिकाला खत देण्याची पद्धत म्हणून सांगितले जाते, पण प्रत्यक्ष अडथळा फिल्टरचा असतो. विरघळलेले क्षार पाण्यासारखे सहज जात नाहीत.",
        sections: [
          {
            heading: "विद्राव्य खत प्रत्यक्षात ओळीत काय टाकते",
            body: [
              "विद्राव्य खत हे पिकाला काय देते या दृष्टीने सांगितले जाते, पण ते पाइपमध्ये काय टाकते हेही विचारात घ्यावे. पाण्यात विरघळणारे खत विरघळलेले असते, पण शुद्ध नसते, आणि बाजारातील दर्जातील भराव व अशुद्धी 'विद्राव्य' लिहिले आहे म्हणून गायब होत नाहीत.",
              "ते तुमच्या स्रोताच्या पाण्यात आधीच असलेल्या भारात मिळवा, आणि फिल्टरला आता एकाऐवजी दोन भार सांभाळावे लागतात.",
            ],
          },
          {
            heading: "डिस्क स्टॅक हा भार का जास्त चांगला सांभाळतो",
            body: [
              "स्क्रीन फिल्टर एका जाळीवर घाण अडवतो आणि हळूहळू बंद होत जातो: जाळी भरत जाते तसे दाब कमी होणे वाढते. पाण्यात खत असल्यास अडवण्यासारखे जास्त असते, आणि चुकीच्या क्षणी बंद पडलेली जाळी हंगामातील ज्या टप्प्यात त्या ओळीतून पिकाला खत दिले जाते त्याच टप्प्यात वाफा कोरडा ठेवते.",
              "डिस्क फिल्टर अडवत नाही तर वेगळे करतो. आमचा २ इंच डिस्क फिल्टर १३० मायक्रॉन खोबणी असलेला स्टॅक वापरतो, जो १० बार कमाल कार्य दाबावर ४० घनमीटर प्रति तासापर्यंत रेट केलेला आहे, आणि खोबणी दाब कमी होणे जाणवण्यापूर्वी खूप जास्त घाण सहन करते. प्रत्येक डिस्क काढता व धुवता येते, त्यामुळे भरलेला स्टॅक म्हणजे बदलण्याचे नाही तर स्वच्छ करण्याचे काम.",
            ],
          },
          {
            heading: "विद्राव्य खत असलेल्या ओळीतील क्रम",
            body: [
              "नेहमीच्या रचनेत आधी मुख्य फिल्टर, नंतर बारीक टप्पा आणि नंतर इंजेक्शनचा बिंदू असतो. फिल्टरनंतर इंजेक्शन देणेच योग्य: खत घाण अडवणाऱ्या घटकातून न जाता आधीच स्वच्छ झालेल्या पाण्यात मिसळते.",
              "रचना कोणतीही असो, महत्त्वाचा निर्देशक दाबातील फरक आहे. विद्राव्य खतामुळे हंगामभर भार बदलतो, त्यामुळे दिनदर्शिकेवर नाही तर गेजवर फिल्टर साफ करा.",
            ],
          },
        ],
        faq: [
          {
            question: "विद्राव्य खतासाठी वेगळा फिल्टर लागतो का?",
            answer:
              "फिल्टरला पाण्यातील घाण काढावीच लागते, आणि विद्राव्य खत तो भार वाढवते. बारीक जाळीपेक्षा डिस्क फिल्टर हा वाढीव भार जास्त चांगला सांभाळतो, कारण दाब कमी होणे जाणवण्यापूर्वी तो बरीच घाण धरतो.",
          },
          {
            question: "फिल्टरआधी खत देता येते का?",
            answer:
              "येते, आणि मग फिल्टर खतासोबत येणारे काहीही अडवेल, पण त्यामुळे घटक लवकर भरतो आणि खताला आधीच अडकलेल्या घाणीतून जावे लागते. फिल्टरनंतर खत देणे हीच नेहमीची रचना.",
          },
          {
            question: "विद्राव्य खत देत असताना फिल्टर किती वेळा साफ करावा?",
            answer:
              "साध्या पाण्यापेक्षा जास्त वेळा, कारण अडवण्यासारखे जास्त असते. ठराविक कालावधीऐवजी दाबातील फरकाच्या गेजवरून साफ करा, कारण खत व हंगामानुसार भार बदलतो.",
          },
        ],
      },
    },
  },
];

export function blogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

/** Rough reading time, so the index can show it without a manual field. */
export function readingMinutes(copy: BlogCopy): number {
  const words = copy.sections
    .flatMap((section) => [section.heading, ...section.body])
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(2, Math.round(words / 180));
}

/** Newest first - the order the index and the sitemap both want. */
export function allBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Guides other than `slug`, for the "related" strip. */
export function relatedBlogPosts(slug: string, limit = 3): BlogPost[] {
  return allBlogPosts()
    .filter((post) => post.slug !== slug)
    .slice(0, limit);
}

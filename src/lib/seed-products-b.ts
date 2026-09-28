// Seed products part 2 — online drip emitters, plain laterals, filters & fittings.
// Online emitters follow IS 13487; plain lateral follows IS 12786 Class 2;
// screen/disc filter specs follow standard Indian drip-system practice.
export const products2 = [
  {
    name: "Krusheebindoo Online Dripper 4 LPH - 16 mm",
    slug: "krusheebindoo-online-dripper-4lph-16mm",
    category: "online-drip-emitters",
    shortDescription:
      "On-line dripper to IS 13487, 4 LPH at 16 mm barb. Black or blue, single outlet.",
    description:
      "An on-line dripper is fitted directly into a hole in a plain lateral, so you choose exactly where each plant gets its water. That flexibility makes it the right choice for orchards, polyhouses and block planting where plants are unevenly spaced or a row has gaps — you put outlets where the roots actually are, rather than being tied to a fixed factory spacing. At 4 litres per hour it matches the discharge of our 12 mm and 16 mm flat inline laterals, so a grower can combine inline and on-line outlets in one block and still have a uniform system. The barbed 16 mm inlet grips a punched hole firmly, and the twist-lock cap lets you remove an emitter for cleaning without cutting the lateral.",
    imageUrl: "/images/products/online-dripper-4lph.svg",
    specs: {
      Standard: "IS 13487",
      Discharge: "4 litres per hour",
      Inlet: "16 mm barb (fits 16 mm plain lateral)",
      Outlets: "Single outlet",
      Material: "Virgin PP, UV-stabilised",
      "Working Pressure": "0.8 - 1.0 kg/cm²",
      Colours: "Black or blue",
    },
    price: "Contact for pricing",
    minOrderQty: "1000 pieces",
    rank: 5,
    featured: true,
  },
  {
    name: "Krusheebindoo Online Dripper 8 LPH - 16 mm",
    slug: "krusheebindoo-online-dripper-8lph-16mm",
    category: "online-drip-emitters",
    shortDescription:
      "On-line dripper to IS 13487, 8 LPH at 16 mm barb. For mature and widely spaced crops.",
    description:
      "The 8 LPH on-line dripper delivers double the flow of the 4 LPH version, which makes it the practical choice for mature orchards, banana, pomegranate and papaya where a single plant needs a genuinely generous drink rather than a maintenance trickle. Fitting them along a plain lateral lets you increase or decrease the water a given stretch of row receives simply by changing emitter size — useful where soil type changes across a field and the clayey end needs a slower application rate than the sandy end. The larger internal flow passage is also less prone to clogging, which matters on longer irrigation runs.",
    imageUrl: "/images/products/online-dripper-8lph.svg",
    specs: {
      Standard: "IS 13487",
      Discharge: "8 litres per hour",
      Inlet: "16 mm barb (fits 16 mm plain lateral)",
      Outlets: "Single outlet",
      Material: "Virgin PP, UV-stabilised",
      "Working Pressure": "0.8 - 1.0 kg/cm²",
      "Best For": "Banana, pomegranate, papaya, mature orchards",
    },
    price: "Contact for pricing",
    minOrderQty: "1000 pieces",
    rank: 6,
    featured: false,
  },
  {
    name: "Krusheebindoo PC Online Emitter 8 LPH - Pressure Compensating",
    slug: "krusheebindoo-pc-online-emitter-8lph",
    category: "online-drip-emitters",
    shortDescription:
      "Pressure-compensating on-line emitter, 8 LPH. Constant flow on slopes and long runs.",
    description:
      "A normal non-PC dripper discharges less water simply because the pressure at its end is lower than at the head of the line. On undulating ground, a long block, or a system running without a pressure regulator, that difference shows up as visibly uneven irrigation — one end of the row dry while the other end ponds. A pressure-compensating emitter solves this with a flexible silicone diaphragm that holds the flow steady across a wide working range, typically 0.5 to 3.5 bar. Every plant then receives the same 8 litres per hour regardless of its position on the line. This is the spec to choose for hilly terrain, long lateral runs, greenhouse systems and any installation where you cannot guarantee perfectly level pressure.",
    imageUrl: "/images/products/pc-online-emitter-8lph.svg",
    specs: {
      Type: "Pressure-compensating (PC) on-line emitter",
      Discharge: "8 litres per hour (constant)",
      "Compensation Range": "0.5 - 3.5 bar",
      Inlet: "16 mm barb",
      Material: "PP body with silicone diaphragm",
      "Best For": "Slopes, long runs, polyhouses, uneven pressure",
    },
    price: "Contact for pricing",
    minOrderQty: "500 pieces",
    rank: 7,
    featured: false,
  },
  {
    name: "Krusheebindoo Take-Off Connector with Valve - 16 mm",
    slug: "krusheebindoo-take-off-connector-valve-16mm",
    category: "fittings-accessories",
    shortDescription:
      "16 mm take-off connector with 3/4\" male thread and integral ball valve. The standard header fit.",
    description:
      "This is the fitting that joins a drip lateral to the sub-main, and it is the part that turns an irrigation block into something you can control. The integral ball valve lets you isolate a single row or a single block without draining the rest of the line, so irrigation can proceed zone by zone and a leak in one section does not force you to shut down everything. The 3/4\" male thread takes a standard nipple into the sub-main, and the 16 mm barb grips the lateral firmly without needing clamps or glue. Build a line of these along a header and you have a properly valved manifold, which is the difference between an installation that is convenient to run and one that is not.",
    imageUrl: "/images/products/take-off-connector.svg",
    specs: {
      Type: "Take-off connector with integral ball valve",
      "Lateral Size": "16 mm barb",
      "Sub-main Thread": "3/4\" male (NPT/BSP)",
      Valve: "Inline quarter-turn ball valve",
      Material: "Virgin PP, UV-stabilised",
      Colours: "Black or blue",
    },
    price: "Contact for pricing",
    minOrderQty: "500 pieces",
    rank: 11,
    featured: false,
  },
  {
    name: "Krusheebindoo Lateral Grommet - 16 mm",
    slug: "krusheebindoo-lateral-grommet-16mm",
    category: "fittings-accessories",
    shortDescription:
      "Rubber grommet seating a 16 mm take-off into a poly or HDPE main. Seals and prevents chafing.",
    description:
      "A grommet is the small part that decides whether a manifold stays leak-free over a season. Wherever a take-off connector passes through the wall of a polyethylene main, the hole has a sharp edge that will slowly cut into the soft plastic as the fitting is tightened and as the line flexes in the sun. The rubber grommet takes that load instead, spreading it over a wider area and sealing the hole against seepage and grit. It also stops the lateral rubbing against the main's edge as the water moves through. Fit one in every take-off position, especially on thin-wall sub-mains, and a manifold that would weep from a dozen connections stays dry.",
    imageUrl: "/images/products/grommet-16mm.svg",
    specs: {
      Type: "Lateral grommet (seat for take-off)",
      "Lateral Size": "16 mm",
      Material: "Natural rubber, UV-resistant",
      Fits: "Polyethylene / HDPE main lines",
      Packing: "100 pieces per pack",
    },
    price: "Contact for pricing",
    minOrderQty: "100 packs",
    rank: 12,
    featured: false,
  },
  {
    name: "Krusheebindoo End Cap - 16 mm",
    slug: "krusheebindoo-end-cap-16mm",
    category: "fittings-accessories",
    shortDescription:
      "16 mm end cap with barb plug for sealing the end of a lateral. Stops leakage and dirt entry.",
    description:
      "Every lateral you lay has a far end, and if that end is left open the line drains onto your field, wastes pressure and pulls in dirt that will block emitters downstream. The end cap closes it with a barbed 16 mm plug that seats tight inside the pipe, giving a leak-proof finish that opens easily when you want to flush the line at the end of a season. Flushing is the single best defence against emitter clogging — pushing clean water through the lateral clears accumulated sediment from between the emitters before it bakes into a blockage. Order a few spares, because losing one during laying is routine and a missing end cap quietly spoils the run behind it.",
    imageUrl: "/images/products/end-cap-16mm.svg",
    specs: {
      Type: "Barbed end cap / end plug",
      "Lateral Size": "16 mm",
      Material: "Virgin PP, UV-stabilised",
      Seal: "Barbed press-fit, leak-proof",
      Colours: "Black or blue",
      Packing: "100 pieces per pack",
    },
    price: "Contact for pricing",
    minOrderQty: "100 packs",
    rank: 13,
    featured: false,
  },

  {
    name: "Krusheebindoo Plain Drip Lateral 16 mm (No Emitters)",
    slug: "krusheebindoo-plain-drip-lateral-16mm",
    category: "online-drip-emitters",
    shortDescription:
      "16 mm plain lateral pipe to IS 12786, Class 2, 1.1-1.3 mm wall. Pair with on-line drippers.",
    description:
      "Plain lateral is the blank canvas of a drip system — a 16 mm polyethylene pipe with no built-in emitters, punched where you need an outlet. Specify it when plant spacing changes between seasons, when you are laying a system for orchards with irregular trees, or when you want the option to move emitters later without replacing the line. It is also the standard choice for carrying water to a manifold or feeding a later line, and works with micro-sprinklers, jets and foggers as well as drippers. Manufactured to IS 12786 in Class 2 with a 1.1-1.3 mm wall, it is the same wall thickness used for our 16 mm inline laterals, so the whole block runs on one consistent pressure regime.",
    imageUrl: "/images/products/plain-lateral-16mm.svg",
    specs: {
      Standard: "IS 12786",
      "Diameter (outer)": "16 mm",
      Class: "Class 2",
      "Wall Thickness": "1.1 - 1.3 mm",
      Material: "UV-stabilised virgin polyethylene",
      "Roll Length": "5000 metres",
      Use: "On-line drippers, micro-sprinklers, sub-mains",
    },
    price: "Contact for pricing",
    minOrderQty: "1 roll (5000 m)",
    rank: 8,
    featured: false,
  },
  {
    name: "Krusheebindoo Inline Screen Filter - 2\" Blue",
    slug: "krusheebindoo-inline-screen-filter-2-inch",
    category: "filters",
    shortDescription:
      "2\" blue inline screen filter, 120 mesh. The essential first line of defence against clogging.",
    description:
      "Ninety per cent of drip irrigation failures are caused by blocked emitters, and almost all of those come from suspended solids in the source water. A screen filter is the first component every line needs. Water passes through a fine stainless or nylon mesh that traps silt, algae and suspended organic matter before they reach the laterals, while the clear blue bowl lets you see the element and judge when it needs cleaning without breaking the line. Rated at 120 mesh, it is the right choice for relatively clean borewell or canal water and for use as a secondary stage behind a sand media filter. The flanged top unscrews for fast element removal, and INLET and OUTLET are moulded into the body so the unit cannot be plumbed backwards in the field.",
    imageUrl: "/images/products/inline-screen-filter.svg",
    specs: {
      Type: "Inline screen (mesh) filter",
      "Size (inlet/outlet)": "2\" (50 mm) threaded",
      "Mesh Rating": "120 mesh (approx. 125 micron)",
      "Body": "Blue glass-filled polymer",
      "Element": "Stainless steel / nylon mesh, removable",
      "Max Working Pressure": "10 bar",
      "Flow Rate": "Up to 40 m³/h",
      Markings: "Moulded INLET / OUTLET arrows",
    },
    price: "Contact for pricing",
    minOrderQty: "20 pieces",
    rank: 9,
    featured: true,
  },
  {
    name: "Krusheebindoo Disc Filter - 2\" Black",
    slug: "krusheebindoo-disc-filter-2-inch",
    category: "filters",
    shortDescription:
      "2\" black disc filter with self-cleaning stack. Handles algae and heavier organic load.",
    description:
      "Where a screen filter blocks, a disc filter separates. Instead of a single mesh, a stack of thin grooved discs traps contaminants in the grooves between them, giving a far larger filtration area and holding much more dirt before the pressure drop becomes noticeable. That makes it the better choice for pond, canal or recycled water carrying algae and heavier organic load, and it is the usual second stage after a sand media filter. Each disc can be individually removed, washed or replaced, so there is no heavy cartridge to discard. A differential pressure indicator shows at a glance when cleaning is due, and the whole stack separates with a single clamp for fast servicing between irrigation cycles.",
    imageUrl: "/images/products/disc-filter.svg",
    specs: {
      Type: "Disc filter (self-cleaning stack)",
      "Size (inlet/outlet)": "2\" (50 mm) threaded",
      Filtration: "130 micron grooved disc stack",
      Body: "Black glass-filled polymer",
      Elements: "Individually removable discs, cleanable in place",
      "Max Working Pressure": "10 bar",
      "Flow Rate": "Up to 40 m³/h",
    },
    price: "Contact for pricing",
    minOrderQty: "20 pieces",
    rank: 10,
    featured: true,
  },
  {
    name: "Krusheebindoo Lateral Cock / Ball Valve - 1/2\"",
    slug: "krusheebindoo-lateral-cock-ball-valve-half-inch",
    category: "fittings-accessories",
    shortDescription:
      "1/2\" threaded ball valve for sub-mains and manifolds. Full-bore, quarter-turn isolation.",
    description:
      "The lateral cock is the isolation valve for a sub-main — it lets you shut down one feed line and work on the block behind it, or stop a leaking section while the rest of the field keeps irrigating. This full-bore quarter-turn ball valve opens and closes with a firm lever action and, unlike a plug cock, does not trap sediment in the seat, which matters on water that carries any silt at all. The 1/2\" female threaded ends suit standard poly main lines and adaptors, and the body is glass-filled polymer for strength without the weight of metal. Keep one at the head of every sub-main and one at the far end, and no part of the system is more than a turn away from being isolated.",
    imageUrl: "/images/products/lateral-cock.svg",
    specs: {
      Type: "Full-bore ball valve (lateral cock)",
      Size: "1/2\" (15 mm) threaded",
      Ends: "Female threaded, F/F",
      Operation: "Quarter-turn lever",
      Body: "UV-stabilised glass-filled polymer",
      "Max Working Pressure": "10 bar",
      Colours: "Blue or green handle",
    },
    price: "Contact for pricing",
    minOrderQty: "200 pieces",
    rank: 14,
    featured: false,
  },
  {
    name: "Krusheebindoo Drip Hole Punch - 16 mm",
    slug: "krusheebindoo-drip-hole-punch-16mm",
    category: "fittings-accessories",
    shortDescription:
      "Precision 16 mm hole punch for seating on-line drippers cleanly into plain lateral.",
    description:
      "On-line drippers need a hole of exactly the right size, and a punch is how you get it. A correctly sized, cleanly punched hole is what gives the barb a tight grip and a seal that will not weep. An improvised hole — a heated nail, an awl or a wrong-size drill — tears the wall of the lateral and leaves an oval opening that leaks around the emitter and invites silt into the line. This punch cuts a round 16 mm hole to match our on-line drippers, with a depth stop so you do not drive it through the far wall of the pipe, and a twist action that clears the cut disc each stroke. Pair it with a barrel punch for main lines and a whole layout can be punched in the time it takes to walk the rows.",
    imageUrl: "/images/products/drip-hole-punch.svg",
    specs: {
      Type: "Twist hole punch (step drill)",
      "Hole Size": "16 mm (suits 16 mm on-line drippers)",
      "Lateral Size": "12 mm and 16 mm plain lateral",
      Action: "Twist-cut, self-clearing disc",
      Body: "Hardened steel tip, moulded grip",
    },
    price: "Contact for pricing",
    minOrderQty: "100 pieces",
    rank: 15,
    featured: false,
  },
];

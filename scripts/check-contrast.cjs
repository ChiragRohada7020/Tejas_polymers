/**
 * Checks text/background colour contrast across every public page.
 *
 * Walks the live rendered DOM and resolves each text node's effective colour
 * against the first opaque ancestor background, so it measures what a visitor
 * actually sees rather than what the class names suggest. This matters here
 * because the site paints text over gradients (wave-bg, wave-bg-deep) and over
 * photography, where a static palette check would be meaningless.
 *
 * Text over an image or gradient is reported separately and flagged for manual
 * review, because a single colour cannot represent a varying backdrop.
 *
 * Thresholds are WCAG 2.1 AA: 4.5:1 body, 3:1 for large text (>=24px, or
 * >=18.66px bold).
 */
const { spawn } = require("node:child_process");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");

const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE_URL || "http://localhost:3100";
const PAGES = [
  "/mr",
  "/en",
  "/mr/products",
  "/mr/about",
  "/mr/contact",
  "/mr/become-a-distributor",
  "/mr/products/krusheebindoo-flat-inline-drip-12mm-4lph-40cm",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getTargets(port) {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === "page");
      if (page) return page;
    } catch {
      /* not up yet */
    }
    await sleep(500);
  }
  throw new Error("Chrome DevTools endpoint never became ready");
}

function cdp(ws) {
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  });
  return (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pending.set(mid, { resolve, reject });
      ws.send(JSON.stringify({ id: mid, method, params }));
    });
}


/**
 * Runs inside the page. Returns one record per distinct text style, with the
 * resolved foreground/background pair and its computed contrast ratio.
 */
const PROBE = `(() => {
  /*
   * Colour parsing has to cover every space Chrome reports, not just rgb().
   * Tailwind v4 emits oklab()/oklch() for its palette, so a regex that only
   * understood rgba() treated those surfaces as "no background at all" and the
   * ancestor walk fell through to the white <body> - which is what produced
   * false "white text on white" failures on dark cards. Everything is
   * converted to sRGB first so the maths below is uniform.
   */
  const toSrgb = (r, g, b) => {
    const enc = (v) => {
      v = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055;
      return Math.min(255, Math.max(0, Math.round(v * 255)));
    };
    return { r: enc(r), g: enc(g), b: enc(b), a: 1 };
  };
  // Oklab -> linear sRGB (Björn Ottosson's matrices).
  const fromOklab = (L, A, B) => {
    const l_ = L + 0.3963377774 * A + 0.2158037573 * B;
    const m_ = L - 0.1055613458 * A - 0.0638541728 * B;
    const s_ = L - 0.0894841775 * A - 1.2914855480 * B;
    const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
    return toSrgb(
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    );
  };
  const parse = (c) => {
    if (!c || c === "transparent") return null;
    const rgb = c.match(/^rgba?\\(([^)]+)\\)$/);
    if (rgb) {
      const p = rgb[1].split(/[,\\s/]+/).filter(Boolean).map(parseFloat);
      if (p.length < 3 || p.some(isNaN)) return null;
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 && !isNaN(p[3]) ? p[3] : 1 };
    }
    // Both oklab() and oklch() put alpha after a slash.
    const alphaOf = (body) => {
      const parts = body.split("/");
      const a = parts.length > 1 ? parseFloat(parts[1]) : 1;
      return { nums: parts[0].trim().split(/\\s+/).map(parseFloat), a: isNaN(a) ? 1 : a };
    };
    const lab = c.match(/^oklab\\(([^)]+)\\)$/);
    if (lab) {
      const { nums, a } = alphaOf(lab[1]);
      return { ...fromOklab(nums[0], nums[1], nums[2]), a };
    }
    const lch = c.match(/^oklch\\(([^)]+)\\)$/);
    if (lch) {
      const { nums, a } = alphaOf(lch[1]);
      // Oklch is polar: hue in degrees, chroma is the radius.
      const hr = (nums[2] * Math.PI) / 180;
      return { ...fromOklab(nums[0], nums[1] * Math.cos(hr), nums[1] * Math.sin(hr)), a };
    }
    return null;
  };
  const lin = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });

  // Walk up compositing translucent layers until an opaque colour is found.
  // A gradient/image backdrop cannot be reduced to one colour, so it is
  // reported separately and flagged for manual review.
  const resolveBg = (el) => {
    let node = el;
    const stack = [];
    while (node && node.nodeType === 1) {
      const cs = getComputedStyle(node);
      if (cs.backgroundImage && cs.backgroundImage !== "none") {
        return { kind: "image", note: cs.backgroundImage.slice(0, 40) };
      }
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) {
        stack.push(c);
        if (c.a === 1) break;
      }
      node = node.parentElement;
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
    return { kind: "solid", color: base };
  };

  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  let n;
  while ((n = walker.nextNode())) {
    const text = (n.nodeValue || "").trim();
    if (text.length < 2) continue;
    const el = n.parentElement;
    if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    if (parseFloat(cs.opacity) < 0.1) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;

    /*
     * Skip visually-hidden text. WCAG 1.4.3 is about text a sighted visitor
     * can see; sr-only text is clipped to a 1px box for screen readers and is
     * exempt. Measuring it produces noise (a dark caption over a dark card
     * "fails" while being invisible to everyone) and buries real failures.
     * The clip/overflow signature of the sr-only utility is checked directly
     * rather than matching on class names.
     */
    const clipped =
      cs.clip !== "auto" ||
      cs.clipPath !== "none" ||
      (cs.overflow === "hidden" && parseFloat(cs.fontSize) <= 2);
    if (clipped) continue;

    const fgRaw = parse(cs.color);
    if (!fgRaw) continue;
    const bg = resolveBg(el);
    if (bg.kind === "image") {
      out.push({
        text: text.slice(0, 40), tag: el.tagName,
        cls: String(el.className || "").slice(0, 50),
        size: Math.round(parseFloat(cs.fontSize)), onImage: true,
      });
      continue;
    }
    const fg = fgRaw.a < 1 ? over(fgRaw, bg.color) : fgRaw;
    const size = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = size >= 24 || (bold && size >= 18.66);
    const cr = ratio(fg, bg.color);

    // Dedupe by colour pair + size + tag so a repeated nav item is one row.
    const key = cs.color + "|" + cs.backgroundColor + "|" + size + "|" + el.tagName;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      text: text.slice(0, 40), tag: el.tagName,
      cls: String(el.className || "").slice(0, 50),
      size: Math.round(size), weight: cs.fontWeight,
      fg: cs.color,
      bg: "rgb(" + [bg.color.r, bg.color.g, bg.color.b].map(Math.round).join(",") + ")",
      ratio: Math.round(cr * 100) / 100,
      required: large ? 3 : 4.5,
      pass: cr >= (large ? 3 : 4.5),
    });
  }
  return out;
})()`;


(async () => {
  const port = 9222 + Math.floor(Math.random() * 400);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "contrast-"));
  const chrome = spawn(
    CHROME,
    [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--window-size=1280,900",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let ws;
  try {
    const target = await getTargets(port);
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.addEventListener("open", res, { once: true });
      ws.addEventListener("error", rej, { once: true });
    });
    const send = cdp(ws);
    await send("Page.enable");

    let totalFail = 0;
    for (const p of PAGES) {
      await send("Page.navigate", { url: `${BASE}${p}` });
      await sleep(3500);
      // Force reveal animations to finish so opacity-0 text is not skipped.
      await send("Runtime.evaluate", {
        expression:
          "document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-visible'));",
      });
      await sleep(600);

      const { result } = await send("Runtime.evaluate", {
        expression: PROBE,
        returnByValue: true,
      });
      const rows = result.value || [];
      const fails = rows.filter((r) => r.pass === false);
      const onImage = rows.filter((r) => r.onImage);
      totalFail += fails.length;

      console.log(`\n=== ${p} ===`);
      console.log(
        `  ${rows.length} styles checked, ${fails.length} below AA, ${onImage.length} over image/gradient`
      );

      for (const f of fails.sort((a, b) => a.ratio - b.ratio)) {
        console.log(
          `  FAIL ${f.ratio}:1 (need ${f.required}) ${f.tag} ${f.size}px/${f.weight} ${f.fg} on ${f.bg}`
        );
        console.log(`       "${f.text}"  .${f.cls}`);
      }
    }
    console.log(`\ntotal contrast failures: ${totalFail}`);
    process.exitCode = totalFail ? 1 : 0;
  } finally {
    if (ws) ws.close();
    chrome.kill();
    try {
      fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch {
      /* temp dir left behind; harmless */
    }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

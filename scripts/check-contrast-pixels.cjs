/**
 * Samples the real rendered pixel colour behind each text element that sits on
 * a gradient or image backdrop, and reports WCAG contrast for the actual pair.
 *
 * check-contrast.cjs deliberately refuses to guess at gradient backdrops. This
 * is the other half of that: it uses CDP to grab a screenshot plus each
 * element's box, then reads the pixels inside the box. The text glyphs are
 * skipped by taking the modal (most common) colour, so what is left is the
 * backdrop the text is actually painted on.
 *
 * That matters because wave-bg-deep is a 135deg gradient running from near
 * black-green to mid aqua: white text passes AA over the dark end and fails
 * over the light end, so the answer genuinely depends on position.
 */
const { spawn } = require("node:child_process");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");
const zlib = require("node:zlib");

const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE_URL || "http://localhost:3100";
const PAGES = ["/mr", "/mr/contact", "/mr/become-a-distributor", "/mr/products"];
const WIDTH = 1280;
const HEIGHT = 900;

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

/** Minimal PNG decoder for the RGBA screenshots CDP returns. */
function decodePng(buf) {
  // Walk the chunk list to find IHDR and IDAT.
  let pos = 8;
  let w = 0, h = 0, bitDepth = 0, colorType = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") break;
    pos += 12 + len;
  }
  if (bitDepth !== 8) throw new Error(`unsupported bit depth ${bitDepth}`);
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`unsupported colour type ${colorType}`);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * channels;
  const out = Buffer.alloc(h * stride);

  // Reverse the per-scanline PNG filters.
  for (let y = 0; y < h; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= channels ? prev[x - channels] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[x] = v & 0xff;
    }
  }
  return { w, h, channels, data: out };
}


/**
 * In-page: reports text elements whose backdrop is a gradient or image, with
 * their boxes in CSS pixels, so screenshot pixels can be sampled against them.
 */
const COLLECT = `(() => {
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const text = (n.nodeValue || "").trim();
    if (text.length < 3) continue;
    const el = n.parentElement;
    if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    if (parseFloat(cs.opacity) < 0.1) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > innerHeight) continue;

    // Confirm some ancestor really is a gradient/image backdrop.
    let node = el, overArt = false;
    while (node && node.nodeType === 1) {
      const s = getComputedStyle(node);
      if (s.backgroundImage && s.backgroundImage !== "none") { overArt = true; break; }
      node = node.parentElement;
    }
    if (!overArt) continue;

    const size = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    out.push({
      text: text.slice(0, 34),
      cls: String(el.className || "").slice(0, 46),
      color: cs.color,
      size: Math.round(size),
      large: size >= 24 || (bold && size >= 18.66),
      x: Math.round(r.left), y: Math.round(r.top),
      w: Math.round(r.width), h: Math.round(r.height),
    });
  }
  return out;
})()`;

const parseRgb = (s) => {
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(",").map((v) => parseFloat(v));
  return { r: p[0], g: p[1], b: p[2] };
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
const hexOf = (c) =>
  "#" + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

/**
 * Most frequent colour inside a box, excluding pixels that match the text
 * colour.
 *
 * The text colour is passed in rather than assuming glyphs are light: these
 * heroes are large headings, and on a light gradient the dark glyphs are the
 * majority of the box. Filtering on "near white" would keep the glyphs and
 * report them as the backdrop, producing a meaningless 1:1.
 */
function dominantBg(img, box, fg) {
  const counts = new Map();
  const near = (a, b) => Math.abs(a - b) < 40;
  const x1 = Math.max(0, box.x), y1 = Math.max(0, box.y);
  const x2 = Math.min(img.w, box.x + box.w), y2 = Math.min(img.h, box.y + box.h);
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      const i = (y * img.w + x) * img.channels;
      const r = img.data[i], g = img.data[i + 1], b = img.data[i + 2];
      // Drop the glyph itself, including its antialiased edge.
      if (near(r, fg.r) && near(g, fg.g) && near(b, fg.b)) continue;
      // Quantise to 5 bits per channel so JPEG/scaling noise groups together.
      const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  let best = null, bestN = 0;
  for (const [key, n] of counts) if (n > bestN) { bestN = n; best = key; }
  if (best == null) return null;
  return {
    r: ((best >> 10) & 31) * 8 + 4,
    g: ((best >> 5) & 31) * 8 + 4,
    b: (best & 31) * 8 + 4,
  };
}

(async () => {
  const port = 9222 + Math.floor(Math.random() * 400);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "pxcheck-"));
  const chrome = spawn(
    CHROME,
    [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      `--window-size=${WIDTH},${HEIGHT}`,
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
    await send("Emulation.setDeviceMetricsOverride", {
      width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false,
    });

    let fails = 0;
    for (const p of PAGES) {
      await send("Page.navigate", { url: `${BASE}${p}` });
      await sleep(4000);
      await send("Runtime.evaluate", {
        expression: "document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-visible'));",
      });
      await sleep(700);

      const { result } = await send("Runtime.evaluate", {
        expression: COLLECT,
        returnByValue: true,
      });
      const boxes = result.value || [];
      if (!boxes.length) {
        console.log(`\n=== ${p} ===\n  no text over gradients/images`);
        continue;
      }

      const shot = await send("Page.captureScreenshot", { format: "png" });
      const img = decodePng(Buffer.from(shot.data, "base64"));

      const seen = new Set();
      const rows = [];
      for (const b of boxes) {
        const fg = parseRgb(b.color);
        if (!fg) continue;
        const bg = dominantBg(img, b, fg);
        if (!bg) continue;
        const key = `${b.color}|${hexOf(bg)}|${b.size}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push({ ...b, bgHex: hexOf(bg), cr: ratio(fg, bg), need: b.large ? 3 : 4.5 });
      }

      const bad = rows.filter((r) => r.cr < r.need);
      fails += bad.length;
      console.log(`\n=== ${p} ===`);
      console.log(`  ${rows.length} text elements over art, ${bad.length} below AA`);
      for (const r of rows.sort((a, b) => a.cr - b.cr)) {
        const mark = r.cr < r.need ? "FAIL" : "ok  ";
        console.log(
          `  ${mark} ${r.cr.toFixed(2)}:1 (need ${r.need}) ${r.size}px ${r.color} on ${r.bgHex}`
        );
        console.log(`       "${r.text}"  .${r.cls}`);
      }
    }
    console.log(`\ntotal gradient/image contrast failures: ${fails}`);
    process.exitCode = fails ? 1 : 0;
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

/**
 * Screenshots a selector (default: the footer) using the DevTools Protocol over
 * Node's built-in WebSocket, so it needs no Puppeteer/Playwright dependency.
 *
 * Chrome's --screenshot flag only captures the viewport, which never reaches the
 * footer on a long page, so this scrolls the element into view first.
 *
 * Usage: node scripts/shot-footer.cjs [path] [outfile] [width]
 */
const { spawn } = require("node:child_process");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");

const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE_URL || "http://localhost:3100";
const ROUTE = process.argv[2] || "/mr";
const OUT = process.argv[3] || path.join(os.tmpdir(), "footer.png");
const WIDTH = Number(process.argv[4] || 1200);
const HEIGHT = Number(process.argv[5] || 900);

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

(async () => {
  const port = 9222 + Math.floor(Math.random() * 400);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "shot-"));
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
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await send("Page.navigate", { url: `${BASE}${ROUTE}` });
    await sleep(6000);

    // Scroll the footer into view, then let layout settle.
    await send("Runtime.evaluate", {
      expression:
        "document.querySelector('footer')?.scrollIntoView({block:'start'});",
    });
    await sleep(1200);

    const shot = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(OUT, Buffer.from(shot.data, "base64"));
    console.log(`wrote ${OUT}`);
  } finally {
    if (ws) ws.close();
    chrome.kill();
    // Chrome can still be holding the profile as it exits, so a failure to
    // remove the temp dir must not fail an otherwise successful capture.
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
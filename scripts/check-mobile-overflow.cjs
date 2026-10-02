/**
 * Finds horizontal overflow on the Marathi pages at mobile widths.
 *
 * Uses the DevTools Protocol over Node's built-in WebSocket, so it needs no
 * Puppeteer/Playwright dependency. The Next.js dev overlay can also introduce
 * a stray wide element, so offenders are reported with their outerHTML to
 * tell real layout bugs from tooling noise.
 */
const { spawn } = require("node:child_process");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");

const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE_URL || "http://localhost:3100";
const PAGES = ["/mr", "/mr/products", "/mr/contact", "/mr/about"];
const WIDTHS = [360, 390, 414, 430];

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

const PROBE = `(() => {
  const de = document.documentElement;
  const vw = de.clientWidth;
  const bad = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > vw + 1) {
      bad.push({
        tag: el.tagName,
        cls: String(el.className || "").slice(0, 60),
        right: Math.round(r.right),
        width: Math.round(r.width),
        text: (el.textContent || "").trim().slice(0, 45),
      });
    }
  }
  return { scrollWidth: de.scrollWidth, clientWidth: vw, count: bad.length, worst: bad.slice(0, 5) };
})()`;

async function main() {
  const port = 9333;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ovf-"));
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let failures = 0;
  try {
    const target = await getTargets(port);
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener("open", r, { once: true }));
    const send = cdp(ws);

    await send("Page.enable");

    for (const width of WIDTHS) {
      for (const route of PAGES) {
        await send("Emulation.setDeviceMetricsOverride", {
          width,
          height: 800,
          deviceScaleFactor: 1,
          mobile: true,
        });
        await send("Page.navigate", { url: BASE + route });
        await sleep(3500);

        const { result } = await send("Runtime.evaluate", {
          expression: PROBE,
          returnByValue: true,
        });
        const r = result.value;
        const over = r.scrollWidth > r.clientWidth;
        if (over) failures++;
        console.log(
          `${String(width).padEnd(4)} ${route.padEnd(14)} ` +
            `scroll=${r.scrollWidth} client=${r.clientWidth} ` +
            `${over ? "** OVERFLOW **" : "ok"}`
        );
        if (over) {
          for (const w of r.worst) {
            console.log(
              `       <${w.tag} class="${w.cls}"> w=${w.width} right=${w.right} "${w.text}"`
            );
          }
        }

        if (route === "/mr" && width === 390) {
          // One properly-emulated reference shot: the plain --screenshot flag
          // does not apply the mobile viewport meta, which makes mobile
          // layouts look clipped when they are not.
          const shot = await send("Page.captureScreenshot", { format: "png" });
          fs.writeFileSync(
            path.join(process.env.TEMP, "agrigrid-mobile-emulated.png"),
            Buffer.from(shot.data, "base64")
          );
        }
      }
    }
    ws.close();
  } finally {
    chrome.kill();
    // Chrome can still hold the profile directory for a moment after the
    // kill, so a failed cleanup must not fail the check itself.
    try {
      fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
    } catch {
      /* temp dir will be reclaimed by the OS */
    }
  }

  console.log(`\npages with overflow: ${failures}`);
  process.exit(failures > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(2);
});
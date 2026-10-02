/**
 * Measures horizontal overflow at several viewport widths using the
 * Chrome DevTools Protocol.
 *
 * Chrome's `--screenshot --window-size` flag is not a reliable way to
 * check responsive layout: it sizes the window but the layout viewport
 * can still come out wider, and the resulting PNG is just the left-hand
 * slice - which looks identical to a genuine overflow bug. Emulating a
 * real device and asking the page for its own scrollWidth tells us which
 * it actually is, and names the elements responsible.
 *
 * Usage: npx tsx scripts/check-responsive.cts [url]
 */

const URL_UNDER_TEST = process.argv[2] ?? "http://localhost:3000/products";
const PORT = 9333;

const WIDTHS = [
  { name: "mobile-sm", width: 360, mobile: true },
  { name: "mobile", width: 390, mobile: true },
  { name: "tablet", width: 768, mobile: true },
  { name: "laptop", width: 1280, mobile: false },
  { name: "desktop", width: 1440, mobile: false },
];

async function cdp() {
  const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) =>
    r.json()
  );
  const page = list.find((t: { type: string }) => t.type === "page");
  if (!page) throw new Error("no page target exposed by Chrome");

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise<void>((res, rej) => {
    ws.onopen = () => res();
    ws.onerror = () => rej(new Error("devtools socket failed"));
  });

  let id = 0;
  const pending = new Map<number, (v: unknown) => void>();

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data as string);
    const done = pending.get(msg.id);
    if (done) {
      pending.delete(msg.id);
      done(msg.result);
    }
  };

  const send = (method: string, params: object = {}) =>
    new Promise<never>((res) => {
      const myId = ++id;
      pending.set(myId, res);
      ws.send(JSON.stringify({ id: myId, method, params }));
    });

  return { send, close: () => ws.close() };
}

/** Elements whose right edge runs past the viewport are the usual cause. */
const PROBE = `(() => {
  const vw = window.innerWidth;
  const bad = [];
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > vw + 1) {
      bad.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && String(el.className).slice(0, 70)) || '',
        right: Math.round(r.right),
        width: Math.round(r.width),
      });
    }
  }
  return JSON.stringify({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: vw,
    offenders: bad.slice(0, 6),
  });
})()`;

async function main() {
  const { send, close } = await cdp();

  await send("Page.enable");
  await send("Runtime.enable");

  let failures = 0;

  for (const vp of WIDTHS) {
    await send("Emulation.setDeviceMetricsOverride", {
      width: vp.width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: vp.mobile,
    });

    await send("Page.navigate", { url: URL_UNDER_TEST });
    // Give the server component render + reveal animations time to settle.
    await new Promise((r) => setTimeout(r, 4000));

    const res = (await send("Runtime.evaluate", {
      expression: PROBE,
      returnByValue: true,
    })) as { result: { value: string } };

    const { scrollWidth, innerWidth, offenders } = JSON.parse(res.result.value);
    const over = scrollWidth > innerWidth + 1;
    if (over) failures++;

    console.log(
      `${vp.name.padEnd(10)} ${String(vp.width).padStart(5)}px  ` +
        `scrollWidth=${scrollWidth}  innerWidth=${innerWidth}  ` +
        (over ? "OVERFLOW" : "ok")
    );

    for (const o of offenders) {
      console.log(`             <${o.tag}> right=${o.right} w=${o.width} ${o.cls}`);
    }
  }

  close();
  console.log(failures ? `\n${failures} viewport(s) overflow` : "\nno overflow at any width");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error("FAILED:", e instanceof Error ? e.stack : e);
  process.exit(1);
});
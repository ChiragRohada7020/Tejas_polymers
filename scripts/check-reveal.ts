/**
 * Guard: a page that uses the `reveal` class must render <Reveal />.
 *
 * `.reveal` starts at `opacity: 0` and only becomes visible when the
 * Reveal component adds `.is-visible`. A page that uses the class but
 * forgets the component renders permanently invisible content - the
 * product detail page shipped that way, hiding the image, title and
 * price behind a blank area.
 *
 * Run as part of the build so this cannot regress silently.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "src", "app");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".tsx")) out.push(full);
  }
  return out;
}

let bad = 0;
for (const file of walk(ROOT)) {
  const src = readFileSync(file, "utf8");
  const usesRevealClass = /className="[^"]*\breveal\b/.test(src);
  const hasComponent = /<Reveal\s*\/>/.test(src);
  if (usesRevealClass && !hasComponent) {
    console.error(`  ✗ ${file.replace(ROOT, "src/app")} uses .reveal but never renders <Reveal />`);
    bad++;
  }
}

if (bad > 0) {
  console.error(`\n${bad} file(s) would render invisible content. Add <Reveal /> to each.`);
  process.exit(1);
}
console.log("  ✓ every page using .reveal also renders <Reveal />");
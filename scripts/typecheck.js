/* Type-check helper: lists TypeScript diagnostics without emitting. */
const ts = require("typescript");
const fs = require("fs");
const path = require("path");

function walk(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (/\.tsx?$/.test(f)) out.push(p);
  }
  return out;
}

const files = walk("src");
const cfg = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, ".");
const prog = ts.createProgram(files, { ...parsed.options, noEmit: true, incremental: false });
const diags = ts.getPreEmitDiagnostics(prog);

console.log(`Files: ${files.length}, Diagnostics: ${diags.length}`);
for (const d of diags.slice(0, 30)) {
  let loc = "";
  if (d.file && d.start != null) {
    const pos = d.file.getLineAndCharacterOfPosition(d.start);
    loc = `${path.relative(".", d.file.fileName)}:${pos.line + 1}:${pos.character + 1} `;
  }
  console.log(loc + ts.flattenDiagnosticMessageText(d.messageText, " "));
}
process.exit(diags.length ? 1 : 0);

// Regenerates src/static-content.js from the canonical frontend files so the
// Worker always serves the same homepage, stylesheet, and module as the repo
// root. Run it after editing index.html, styles.css, or app.js.
import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const sources = [
  ["INDEX_HTML", "index.html"],
  ["STYLES_CSS", "styles.css"],
  ["APP_JS", "app.js"]
];

const lines = [];
for (const [name, file] of sources) {
  const contents = await readFile(new URL(file, root), "utf8");
  lines.push(`export const ${name} = ${JSON.stringify(contents)};`);
}

const output = `${lines.join("\n")}\n`;
await writeFile(new URL("src/static-content.js", root), output);
console.log(`Bundled ${sources.map(([, file]) => file).join(", ")} into src/static-content.js.`);

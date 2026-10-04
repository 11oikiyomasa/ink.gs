import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const projectRoot = new URL("../", import.meta.url);
const publicDir = new URL("../public/", import.meta.url);
const publicAssetsDir = new URL("../public/assets/", import.meta.url);
const sourceAssetsDir = new URL("../assets/", import.meta.url);
const staticContentFile = new URL("../src/static-content.js", import.meta.url);

const indexHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
const stylesCss = await readFile(new URL("../styles.css", import.meta.url), "utf8");
const appJs = await readFile(new URL("../app.js", import.meta.url), "utf8");

await mkdir(publicDir, { recursive: true });
await mkdir(publicAssetsDir, { recursive: true });

await copyFile(new URL("../index.html", import.meta.url), new URL("../public/index.html", import.meta.url));
await copyFile(new URL("../styles.css", import.meta.url), new URL("../public/styles.css", import.meta.url));
await copyFile(new URL("../app.js", import.meta.url), new URL("../public/app.js", import.meta.url));

const staticBundle = [
  "// Generated bundle for the Cloudflare Worker. Keep this file synchronized with the frontend source files.",
  "export const INDEX_HTML = " + JSON.stringify(indexHtml) + ";",
  "",
  "export const STYLES_CSS = " + JSON.stringify(stylesCss) + ";",
  "",
  "export const APP_JS = " + JSON.stringify(appJs) + ";",
  "",
].join("\n");

await writeFile(staticContentFile, staticBundle, "utf8");

try {
  for (const entry of await readdir(sourceAssetsDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    await copyFile(
      join(sourceAssetsDir.pathname, entry.name),
      new URL(`../public/assets/${encodeURIComponent(entry.name)}`, import.meta.url),
    );
  }
  console.log(`Prepared public assets and Worker frontend bundle from ${projectRoot.pathname}.`);
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
  console.log("No optional source assets directory found; built-in image fallbacks remain available.");
}

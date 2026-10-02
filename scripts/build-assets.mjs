import { copyFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";

const projectRoot = new URL("../", import.meta.url);
const publicDir = new URL("../public/", import.meta.url);
const publicAssetsDir = new URL("../public/assets/", import.meta.url);
const sourceAssetsDir = new URL("../assets/", import.meta.url);

await mkdir(publicDir, { recursive: true });
await mkdir(publicAssetsDir, { recursive: true });
await copyFile(new URL("../index.html", import.meta.url), new URL("../public/index.html", import.meta.url));

try {
  for (const entry of await readdir(sourceAssetsDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    await copyFile(join(sourceAssetsDir.pathname, entry.name), new URL(`../public/assets/${encodeURIComponent(entry.name)}`, import.meta.url));
  }
  console.log(`Prepared public assets from ${projectRoot.pathname}.`);
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
  console.log("No optional source assets directory found; built-in image fallbacks remain available.");
}

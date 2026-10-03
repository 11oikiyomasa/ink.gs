
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const css = await readFile(new URL("styles.css", root), "utf8");
const js = await readFile(new URL("app.js", root), "utf8");
const workerJs = await readFile(new URL("src/worker.js", root), "utf8");
const staticContentJs = await readFile(new URL("src/static-content.js", root), "utf8");
const wranglerConfig = await readFile(new URL("wrangler.jsonc", root), "utf8");

test("homepage keeps external presentation and behavior modules", () => {
  assert.equal((html.match(/<style\b/gi) || []).length, 0);
  assert.equal((html.match(/<script\b/gi) || []).length, 1);
  assert.match(html, /<link[^>]+href=["']styles\.css["']/iu);
  assert.match(html, /<script[^>]+src=["']app\.js["']/iu);
  assert.doesNotMatch(html, /<script(?![^>]+src=)[^>]*>[\s\S]*?<\/script>/iu);
  assert.doesNotMatch(html, /style=["'][^"']+["']/iu);
  assert.match(css, /--bg:\s*#171717/u);
  assert.match(css, /\.story\s*\{/u);
  assert.match(js, /function wireEvents\(\)/u);
});

test("homepage IDs are unique and the ink.gs brand is present", () => {
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.doesNotMatch(html, /\bMedium\b/u);
  assert.match(html, /<title>ink\.gs — For you<\/title>/u);
  assert.match(html, /class=["']brand-name["'][^>]*>ink\.gs<\/a|class=["']brand-name["'][^>]*>ink\.gs<\/span|class=["']brand-name["'][^>]*>ink\.gs</u);
});

test("story images have text alternatives and no production asset dependency", () => {
  const images = [...html.matchAll(/<img\b[^>]*class=["'][^"']*\bstory-image\b[^"']*["'][^>]*>/gi)].map((match) => match[0]);
  assert.equal(images.length, 6);
  images.forEach((image) => {
    assert.match(image, /\balt=["'][^"']+["']/iu);
    assert.match(image, /\bsrc=["']data:image\/svg\+xml/iu);
  });
  assert.match(js, /function installImageFallbacks\(\)/u);
  assert.match(js, /addEventListener\('error'/u);
});

test("mobile reader and menu hooks stay wired", () => {
  assert.match(html, /id=["']reader-summary["']/u);
  assert.match(html, /class=["']mobile-drawer-close["']/u);
  assert.match(js, /readerSummary/u);
  assert.match(js, /mobile-drawer-close/u);
});


test("dynamic reader stories and remote-only actions keep accessibility hooks", () => {
  assert.match(js, /title\.className = 'story-title-button'/u);
  assert.match(js, /title\.setAttribute\('tabindex', '0'\)/u);
  assert.match(js, /function socialAvailable\(\)/u);
  assert.match(js, /Engagement is available for published online stories/u);
  assert.match(js, /function readStorageValue\(key\)/u);
  assert.match(js, /This story link is malformed/u);
});

test("editor authentication controls are actually revealed only after sign-in", () => {
  assert.match(js, /querySelectorAll\('\.editor-auth-only'\)/u);
  assert.match(js, /element\.hidden = !editorAuthenticated/u);
  assert.match(js, /editingOnlineStoryId = null/u);
});


test("games prevent duplicate answers and expose a truthful round total", () => {
  assert.match(html, /id=["']game-total["']/u);
  assert.match(js, /answered: false/u);
  assert.match(js, /if \(!current \|\| gameState\.answered\) return/u);
  assert.match(js, /button\.disabled = true/u);
});


test("utility links resolve to real site information sections", () => {
  assert.match(html, /id=["']about["']/u);
  assert.match(html, /id=["']help["']/u);
  assert.match(html, /id=["']terms["']/u);
  assert.match(html, /title=["']Refresh published online stories["']/u);
  assert.match(js, /Published stories refreshed\./u);
});

test("Worker serves the canonical frontend bundle", () => {
  const worker = workerJs;
  const bundled = staticContentJs;
  assert.match(worker, /from ["']\.\/static-content\.js["']/u);
  assert.match(worker, /function bundledAssetResponse\(request\)/u);
  assert.match(worker, /pathname === ["']\/app\.js["']/u);
  assert.match(bundled, /export const INDEX_HTML =/u);
  assert.match(bundled, /export const STYLES_CSS =/u);
  assert.match(bundled, /export const APP_JS =/u);
});

test("frontend requests are owned by the Worker runtime", () => {
  assert.doesNotMatch(wranglerConfig, /"assets"\s*:/u);
  assert.match(wranglerConfig, /"main":\s*"src\/worker\.js"/u);
  assert.match(workerJs, /function bundledAssetResponse\(request\)/u);
});

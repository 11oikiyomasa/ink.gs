
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const css = await readFile(new URL("styles.css", root), "utf8");
const js = await readFile(new URL("app.js", root), "utf8");

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

test("story images have text alternatives and the fallback path remains intact", () => {
  const images = [...html.matchAll(/<img\b[^>]*class=["'][^"']*\bstory-image\b[^"']*["'][^>]*>/gi)].map((match) => match[0]);
  assert.equal(images.length, 6);
  images.forEach((image) => {
    assert.match(image, /\balt=["'][^"']+["']/iu);
    assert.match(image, /\bsrc=["']assets\//iu);
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

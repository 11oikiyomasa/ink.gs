import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("homepage keeps a single stylesheet and stable document structure", () => {
  assert.equal((html.match(/<style\b/gi) || []).length, 1);
  assert.equal((html.match(/<\/style>/gi) || []).length, 1);
  assert.equal((html.match(/<script\b/gi) || []).length, 1);
  assert.equal((html.match(/<\/script>/gi) || []).length, 1);
  assert.equal((html.match(/<head\b/gi) || []).length, 1);
  assert.equal((html.match(/<\/head>/gi) || []).length, 1);
  assert.equal((html.match(/<body\b/gi) || []).length, 1);
  assert.equal((html.match(/<\/body>/gi) || []).length, 1);
});

test("homepage IDs are unique and the old Medium brand is absent", () => {
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.doesNotMatch(html, /\bMedium\b/u);
  assert.match(html, /<title>ink\.gs — For you<\/title>/u);
});

test("story images have text alternatives and a client fallback", () => {
  const images = [...html.matchAll(/<img\b[^>]*class=["'][^"']*\bstory-image\b[^"']*["'][^>]*>/gi)].map((match) => match[0]);
  assert.equal(images.length, 6);
  images.forEach((image) => {
    assert.match(image, /\balt=["'][^"']+["']/iu);
    assert.match(image, /\bsrc=["']assets\//iu);
  });
  assert.match(html, /function installImageFallbacks\(\)/u);
  assert.match(html, /addEventListener\('error'/u);
});

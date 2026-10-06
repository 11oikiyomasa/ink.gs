
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const css = await readFile(new URL("styles.css", root), "utf8");
const js = await readFile(new URL("src/react/legacy-controller.js", root), "utf8");
const reactEntry = await readFile(new URL("src/react/main.jsx", root), "utf8");
const appBundle = await readFile(new URL("app.js", root), "utf8");
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
  assert.equal(images.length, 0);
  assert.match(js, /function createStoryElement\(story\)/u);
  assert.match(js, /function installImageFallbacks\(\)/u);
  assert.match(js, /addEventListener\('error'/u);
});




test("reader engagement stats expose icon counts", () => {
  assert.ok(html.includes('id="reader-applaud-count"'));
  assert.ok(html.includes('id="reader-response-stat-count"'));
  assert.ok(html.includes('id="reader-repost-count"'));
  assert.ok(css.includes(".reader-stats-row"));
  assert.ok(css.includes(".reader-stat-count"));
});

test("reader uses a serif-first system font stack", () => {
  assert.match(css, /\.reader-body\s*\{[\s\S]*?font-family:\s*serif/u);
});

test("composer preview shares the reader rich-block renderer", () => {
  assert.ok(js.includes("function renderStoryBlocks(container, body)"));
  assert.ok(js.includes("renderStoryBlocks(previewBody, draftBody?.value || '')"));
  assert.ok(js.includes("renderStoryBlocks(readerBody, data.body)"));
});

test("reader speech control handles native TTS startup and failure states", () => {
  assert.ok(html.includes('id="reader-listen"'));
  assert.ok(js.includes("window.speechSynthesis.getVoices"));
  assert.ok(js.includes("window.speechSynthesis.resume?.()"));
  assert.ok(js.includes("Text-to-speech is unavailable in this browser."));
});

test("reader Listen and More actions are functional and wired", () => {
  assert.ok(html.includes('id="reader-listen"'));
  assert.ok(html.includes('id="reader-more"'));
  assert.ok(html.includes('id="reader-more-menu"'));
  assert.ok(js.includes("function toggleReaderListen()"));
  assert.ok(js.includes("function toggleReaderMore()"));
  assert.ok(js.includes("window.speechSynthesis"));
  assert.ok(js.includes("copyText(currentStoryUrl(), 'Story link copied.')"));
  assert.ok(css.includes(".reader-more-menu"));
});

test("reader supports topic chips and safe pull-quote rendering", () => {
  assert.ok(html.includes('id="reader-topics"'));
  assert.ok(js.includes("text.startsWith('> ')"));
  assert.ok(js.includes("document.createElement('blockquote')"));
  assert.ok(css.includes(".reader-chip-topic"));
  assert.ok(css.includes(".reader-body blockquote"));
});

test("local samples are labeled as preview content and never shown during live API loading", () => {
  assert.match(js, /if \(!API_ENABLED\) ensureLocalStories\(\)/u);
  assert.match(js, /Local preview · Sample stories and activity\./u);
  assert.match(js, /preview\.textContent = 'Sample story'/u);
  assert.doesNotMatch(html, /Member-only/u);
  assert.match(html, /aria-label="Story topics"/u);
});

test("reader keeps editorial article hierarchy and honest mobile controls", () => {
  assert.ok(html.includes('id="reader-publication"'));
  assert.ok(html.includes('id="reader-meta"'));
  assert.ok(html.includes('id="reader-author-name"'));
  assert.ok(html.includes('id="reader-follow"'));
  assert.ok(html.includes('class="reader-tool-row"'));
  assert.ok(html.includes('id="reader-applaud"'));
  assert.ok(html.includes('id="reader-respond"'));
  assert.ok(html.includes('id="reader-repost"'));
  assert.ok(js.includes("formatPublishedDate"));
  assert.ok(js.includes("readerPublication"));
  assert.ok(css.includes(".reader-author-row"));
  assert.ok(css.includes(".reader-tool-row"));
  assert.match(css, /position:\s*sticky/u);
});


test("mobile article reader preserves editorial cover and pull-quote presentation", () => {
  assert.match(css, /\.reader-cover\s*\{[\s\S]*?aspect-ratio:\s*16\s*\/\s*9/u);
  assert.match(css, /\.reader-body blockquote\s*\{/u);
  assert.match(css, /\.reader-body blockquote cite\s*\{/u);
});

test("reader publication metadata and follow state stay wired", () => {
  assert.match(html, /id=["']reader-publication["']/u);
  assert.match(html, /id=["']reader-follow-publication["']/u);
  assert.match(workerJs, /publishedAt: row\.published_at/u);
  assert.match(js, /publishedAt: story\.publishedAt \|\| story\.published_at \|\| ''/u);
  assert.match(js, /const publishedDate = formatPublishedDate\(data\.publishedAt\)/u);
  assert.match(js, /function setPublicationFollowing\(publication, present, announce = true\)/u);
  assert.match(js, /function refreshPublicationFollowButton\(\)/u);
});

test("mobile reader, menu, and search hooks stay wired", () => {
  assert.match(html, /id=["']reader-summary["']/u);
  assert.match(html, /class=["']mobile-drawer-close["']/u);
  assert.match(html, /id=["']search-toggle["']/u);
  assert.match(js, /readerSummary/u);
  assert.match(js, /mobile-drawer-close/u);
  assert.ok(js.includes("searchBox?.classList.toggle('search-open', open)"));
  assert.ok(css.includes(".search-toggle svg"));
  assert.ok(css.includes(".search-box.search-open"));
});


test("dynamic reader stories and remote-only actions keep accessibility hooks", () => {
  assert.match(js, /const titleButton = document\.createElement\('button'\)/u);
  assert.match(js, /titleButton\.className = 'story-title-button'/u);
  assert.match(js, /title\.append\(titleButton\)/u);
  assert.match(js, /imageButton\.className = 'story-image-button'/u);
  assert.match(js, /imageButton\.addEventListener\('click', \(\) => openReader\(story\.id\)\)/u);
  assert.doesNotMatch(js, /title\.setAttribute\('role', 'button'\)|title\.setAttribute\('tabindex', '0'\)/u);
  assert.match(js, /function socialAvailable\(\)/u);
  assert.match(js, /Engagement is available for published online stories/u);
  assert.match(js, /function readStorageValue\(key\)/u);
  assert.match(js, /This story link is malformed/u);
});

test("unsupported membership claims and demo-only promotion controls are absent", () => {
  assert.doesNotMatch(html, /membership-card|Explore membership|Member-only/u);
  assert.doesNotMatch(js, /Membership is a demo action|Get started/u);
  assert.match(html, /id=["']reader-topics["'] aria-label=["']Story topics["']/u);
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

test("Worker API calls use the current Worker origin", () => {
  assert.match(js, /configuredApiBase/u);
  assert.match(js, /productionHostnames/u);
  assert.match(js, /andregsman\.eu\.org/u);
  assert.match(js, /const API_BASE = isWorkerHost \? location.origin : configuredApiBase;/u);
  assert.match(js, /const API_ENABLED = isWorkerHost \|\| Boolean\(configuredApiBase\);/u);
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

test("story card menu, view-aware headings and search shortcut are wired", () => {
  assert.ok(js.includes("function openStoryMenu(trigger)"));
  assert.ok(js.includes("function closeStoryMenu("));
  assert.ok(js.includes("openStoryMenu(target)"));
  assert.ok(js.includes("function renderViewHeading(view)"));
  assert.ok(js.includes("function emptyMessage(view, filtered)"));
  assert.ok(js.includes("function announceResults("));
  assert.ok(js.includes("event.key === '/'"));
  assert.ok(css.includes(".story-menu"));
});

test("story cards surface locally saved reading progress", () => {
  assert.ok(js.includes("function refreshProgressBadges()"));
  assert.ok(js.includes("refreshProgressBadges();"));
  assert.ok(css.includes(".story-status"));
});

test("an empty successful feed refresh clears stale online cards and restores starter stories", () => {
  assert.match(js, /const starterStories = \[\.\.\.document\.querySelectorAll\('\.story'\)\]/u);
  assert.match(js, /if \(reset\) \{\s*dynamicStoryRecords\.clear\(\);\s*container\.replaceChildren\(\.\.\.\(remoteStories\.length \? \[\] : starterStories\)\)/u);
});

test("an unavailable local feed renders an intentional honest empty state", () => {
  assert.match(html, /id=["']empty-state["'][\s\S]*?Feed preview[\s\S]*?No stories just yet\.[\s\S]*?empty-state-copy/u);
  assert.match(html, /Applause unavailable until a story is published/u);
  assert.match(html, /class=["']empty-story-bookmark["'] type=["']button["'] disabled aria-label=["']Save unavailable/u);
  assert.match(css, /\.empty-state\{grid-template-columns:minmax\(0,1fr\) 180px/u);
  assert.match(js, /No stories have been published yet\./u);
  assert.match(js, /Published stories are temporarily unavailable/u);
  assert.doesNotMatch(html, /class=["']story["']/u);
});

test("feed skeleton mirrors story-card layout and appears only during an initial fetch", () => {
  assert.match(html, /id=["']feed-skeleton["'][^>]*hidden/u);
  assert.match(html, /class=["']skeleton-story["']/u);
  assert.match(js, /if \(!append && !stories\.length\)[\s\S]*?feedSkeleton\.hidden = false/u);
  assert.match(js, /if \(feedSkeleton\) feedSkeleton\.hidden = true/u);
  assert.match(css, /\.skeleton-story\{display:grid;grid-template-columns:minmax\(0,1fr\) 180px/u);
});

test("feed status reserves mobile space and tab selection keeps visual and ARIA state in sync", () => {
  assert.match(html, /class="feed-status-slot"><p class="feed-status" id="feed-status"/u);
  assert.match(css, /@media \(max-width:820px\)\{\.feed-status-slot\{min-height:47px\}\}/u);
  const setView = js.slice(js.indexOf("function setView(view)"), js.indexOf("function updateSearchControls()"));
  assert.match(setView, /button\.classList\.toggle\('selected', button\.dataset\.view === view\)/u);
  assert.match(setView, /button\.setAttribute\('aria-selected', String\(button\.dataset\.view === view\)\)/u);
});

test("narrow feed cards keep a readable text column with aligned skeleton thumbnails", () => {
  assert.match(css, /@media \(max-width:360px\)\{\.story,\.story:first-child,\.skeleton-story,\.skeleton-story:first-child\{grid-template-columns:minmax\(0,1fr\) 88px;gap:10px\}\.story-image,\.story:first-child \.story-image,\.skeleton-image\{width:88px;height:62px\}\}/u);
  assert.match(css, /@media \(max-width:340px\)\{\.story,\.story:first-child,\.skeleton-story,\.skeleton-story:first-child\{grid-template-columns:minmax\(0,1fr\) 72px;gap:8px\}\.story-image,\.story:first-child \.story-image,\.skeleton-image\{width:72px;height:50px\}\}/u);
});

test("site information banners have truthful copy and working internal destinations", () => {
  assert.match(html, /class=["']promotion-banner["'][\s\S]*?href=["']#about["']/u);
  assert.match(html, /id=["']about["']/u);
  const openAppBar = html.match(/<div class=["']open-app-bar[\s\S]*?<\/div>/u)?.[0] || "";
  assert.match(openAppBar, /role=["']note["'][\s\S]*?Open in app[\s\S]*?aria-hidden=["']true["'][^>]*>↗/u);
  assert.doesNotMatch(openAppBar, /href=|<a\b|<button\b|role=["']button/iu);
  assert.doesNotMatch(html, /30% off/iu);
  assert.match(js, /reader-offer a[\s\S]*?window\.location\.hash = 'about'/u);
});

test("typography uses local system stacks with bold sans story headings and serif article body", () => {
  assert.doesNotMatch(css, /fonts\.googleapis\.com|@import\s+url|DM Sans|DM Serif Display/iu);
  assert.match(css, /--sans:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif/u);
  assert.match(css, /--serif:Georgia,"Times New Roman",serif/u);
  assert.match(css, /\.reader-title\{font-family:var\(--sans\);font-weight:750/u);
  assert.match(css, /\.story h2\{font-family:var\(--sans\);font-weight:700/u);
  assert.match(css, /\.reader-body\s*\{[\s\S]*?font-family:\s*serif/u);
});

test("editorial accents are distinct from Medium yellow and preview chips stay legible", () => {
  assert.doesNotMatch(css, /#ffc017/iu);
  assert.match(css, /--accent:#c2a676/u);
  assert.match(css, /\.promotion-banner\{background:#22211e/u);
  assert.match(css, /\.reader-chip-preview\{border-color:/u);
  assert.match(css, /\.reader-title\{max-width:19ch;font-size:clamp\(40px/u);
});

test("mobile drawer exposes accessible controls, focus handling, scroll lock, and narrow-width sizing", () => {
  assert.match(html, /id=["']menu-toggle["'][^>]*aria-controls=["']main-navigation["']/u);
  assert.match(html, /id=["']drawer-overlay["']/u);
  assert.match(js, /document\.activeElement === last/u);
  assert.match(js, /menuReturnFocus/u);
  assert.match(js, /body\.classList\.toggle\('menu-open', open\)/u);
  assert.match(css, /width:clamp\(200px,62vw,360px\)/u);
  assert.match(css, /\.drawer-overlay\.visible/u);
});

test("drawer dialog actions close the mobile menu and desktop navigation remains accessible", () => {
  assert.match(js, /function closeMobileMenuIfOpen\(\)\s*\{\s*if \(document\.body\.classList\.contains\('menu-open'\)\) toggleMobileMenu\(false\);/u);
  const dialogActions = js.slice(js.indexOf("if (target.id === 'editor-settings-button')"), js.indexOf("if (target.dataset.writerAction"));
  assert.equal((dialogActions.match(/closeMobileMenuIfOpen\(\)/gu) || []).length, 5);
  assert.match(js, /if \(window\.innerWidth <= 820\) rail\.setAttribute\('aria-hidden', String\(!open\)\);\s*else rail\.removeAttribute\('aria-hidden'\);/u);
});


test("responsive feed and reader typography stay legible with a safe-area-aware action row", () => {
  assert.match(css, /\.story h2\{font-size:clamp\(24px/u);
  assert.match(css, /\.story:first-child h2\{font-size:clamp\(26px/u);
  assert.match(css, /\.reader-body\{font-size:clamp\(21px/u);
  assert.match(css, /\.reader-body\{font-size:clamp\(21px,calc\(18px \+ \.4vw\),24px\)\}/u);
  assert.match(css, /\.reader\{display:flex;flex-direction:column\}/u);
  assert.match(css, /\.reader-scroll\{flex:1 1 auto;min-height:0;max-height:none\}/u);
  assert.match(css, /\.reader-actions\{[^}]*flex:0 0 auto[^}]*env\(safe-area-inset-bottom\)[^}]*overflow:visible/u);
  assert.match(css, /\.reader-stat\{min-width:44px;min-height:44px/u);
  assert.match(css, /\.reader-scroll\{padding-bottom:max\(48px,env\(safe-area-inset-bottom\)\)\}/u);
  assert.match(css, /\.story-title-button\{overflow-wrap:anywhere\}/u);
  assert.match(css, /\.reader-close\{width:44px;height:44px\}/u);
  assert.match(css, /\.reader-follow-publication\{min-height:44px;padding:0 4px\}/u);
  assert.match(css, /\.reader-inline-follow,\.reader-tool\{min-height:44px\}/u);
  assert.match(css, /\.bookmark,\.more\{width:44px;height:44px;flex:0 0 44px\}/u);
  assert.match(css, /\.story-image-button\{width:180px;aspect-ratio:16\/11/u);
});


test("closed mobile reader stays out of the feed initially and after close or Escape", () => {
  const readerTag = html.match(/<dialog\b[^>]*\bid=["']reader["'][^>]*>/u)?.[0] || "";
  assert.match(readerTag, /\bhidden\b/u);
  assert.match(css, /@media \(max-width:820px\)\s*\{\s*\.reader\{display:flex;flex-direction:column\}/u);
  assert.match(css, /\.reader\[hidden\]\s*,\s*\.reader:not\(\[open\]\)\s*\{\s*display:none!important;\s*\}/u);

  const openReader = js.slice(js.indexOf("function openReader(id)"), js.indexOf("function closeReader()"));
  assert.match(openReader, /reader\.hidden\s*=\s*false;[\s\S]*?reader\.showModal\(\)/u);
  const closeReader = js.slice(js.indexOf("function closeReader()"), js.indexOf("function updateReaderProgress()"));
  assert.match(closeReader, /reader\.hidden\s*=\s*true;/u);
  assert.match(js, /reader\?\.addEventListener\('close',[\s\S]*?reader\.hidden\s*=\s*true;/u);
  assert.match(js, /reader\?\.addEventListener\('close',[\s\S]*?if \(reader\.open\) return;[\s\S]*?reader\.hidden\s*=\s*true;/u);
});


test("sample picks and mobile feed hierarchy are clearly labeled and sized responsively", () => {
  assert.match(html, /Staff picks · Sample stories/u);
  assert.match(css, /\.brand-name\{font-size:32px;line-height:1\}/u);
  assert.match(css, /\.brand-name\{font-size:clamp\(40px,11vw,46px\)\}/u);
  assert.match(css, /\.promotion-banner\{font-size:clamp\(10px/u);
  assert.match(css, /\.welcome h1\{font-size:34px\}/u);
  assert.match(css, /\.welcome p:last-child\{font-size:12px;line-height:1\.4\}/u);
  assert.match(css, /\.story-summary\{font-size:clamp\(20px,5vw,23px\);line-height:1\.4\}/u);
  assert.match(css, /\.skeleton-title-line\{height:28px/u);
  assert.match(css, /\.skeleton-title-line\{height:32px;margin-bottom:0\}/u);
  assert.match(css, /\.skeleton-title-line\.short\{margin-bottom:9px\}/u);
  assert.match(css, /@media \(max-width:360px\)\{\.skeleton-title-line\.short:not\(\.skeleton-extra-title-line\)\{margin-bottom:0\}\}/u);
  assert.match(css, /\.skeleton-story:not\(:first-child\) \.skeleton-extra-title-line\{display:none\}/u);
  assert.match(css, /@media \(max-width:340px\)\{\.skeleton-story:not\(:first-child\) \.skeleton-extra-title-line\{display:block\}/u);
  assert.match(css, /\.skeleton-paragraph-line\{height:clamp\(28px,7\.4vw,32px\);margin-top:0/u);
  assert.equal((html.match(/skeleton-extra-title-line/gu) || []).length, 2);
  assert.match(css, /\.skeleton-extra-title-line\{display:none\}/u);
  assert.match(css, /@media \(max-width:360px\)\{\.skeleton-extra-title-line\{display:block\}\}/u);
});

test("API-backed empty feeds keep bundled Staff picks hidden", () => {
  assert.match(html, /<section class="side-section" id="staff-picks" hidden>/u);
  assert.match(js, /const staffPicks = document\.querySelector\('#staff-picks'\);\s*if \(staffPicks\) staffPicks\.hidden = API_ENABLED/u);
  assert.match(js, /No published stories yet\./u);
  assert.equal((js.match(/staffPicks\.hidden\s*=/gu) || []).length, 1);
});

test("API-backed error feeds keep bundled Staff picks hidden", () => {
  assert.match(js, /else if \(!append\) \{\s*publicStoryUnavailable = true;\s*publicStorySearchError = false;/u);
  assert.match(js, /publicStorySearchError = true;\s*publicStoryUnavailable = false;\s*renderRemoteStories\(\[\], \{ reset: true \}\)/u);
  assert.match(js, /Online stories are temporarily unavailable\. Try again shortly\./u);
  assert.match(js, /const staffPicks = document\.querySelector\('#staff-picks'\);\s*if \(staffPicks\) staffPicks\.hidden = API_ENABLED/u);
  assert.equal((js.match(/staffPicks\.hidden\s*=/gu) || []).length, 1);
});

test("mobile feed compacts the About strip without removing Open in app or feed status", () => {
  assert.match(html, /class="open-app-bar"/u);
  assert.match(html, /class="feed-status-slot"><p class="feed-status"/u);
  assert.match(css, /\.promotion-banner\s*\{\s*min-height:32px;[\s\S]*?padding:4px 12px;/u);
  assert.match(css, /\.promotion-banner > span\s*\{display:none\}/u);
  assert.match(css, /main\s*\{padding-top:8px\}/u);
  assert.match(css, /@media \(max-width:820px\)\{\.feed-status-slot\{min-height:47px\}\}/u);
});

test("mobile profile avatar has a 44px tap box around its compact visible circle", () => {
  assert.match(css, /\.avatar\{width:44px;height:44px;min-width:44px;min-height:44px;padding:5px;background-clip:content-box\}/u);
});

test("responsive header, drawer, and close controls retain 44px hit areas", () => {
  assert.match(css, /\.menu-toggle\{width:44px;height:44px\}/u);
  assert.match(css, /\.search-toggle\{width:44px;height:44px;min-width:44px;flex:0 0 44px\}/u);
  assert.match(css, /\.search-box\.search-open \.search-clear\{width:44px;height:44px\}/u);
  assert.match(css, /\.mobile-drawer-close,\.reader-close,\.composer-close,\.utility-dialog-close\{width:44px;height:44px\}/u);
  assert.match(css, /\.open-app-bar\{min-height:42px[\s\S]*?font-size:clamp\(16px,4vw,18px\)/u);
  assert.match(css, /\.welcome p:last-child\{margin-top:6px;font-size:12px;line-height:1\.4\}/u);
  assert.match(css, /main\{padding-top:14px\}/u);
});


test("feed bookmark renders only its SVG icon", () => {
  assert.match(js, /bookmark\.replaceChildren\(iconSvg\('bookmark'\)\)/u);
  assert.match(css, /\.bookmark svg\{width:15px;height:18px\}/u);
  assert.doesNotMatch(css, /\.bookmark::before/u);
  assert.doesNotMatch(css, /\.bookmark\[aria-pressed=['"]true['"]\]::before/u);
});

test("reader offers explicit resume and start-over without auto-restoring on a normal open", () => {
  assert.match(html, /id="reader-continue"[^>]*>Continue reading/u);
  assert.match(html, /id="reader-start-over"[^>]*>Start from beginning/u);
  assert.match(js, /const READER_RESUME_THRESHOLD = 0\.02/u);
  assert.match(js, /let readerResumePending = false/u);
  const openReader = js.slice(js.indexOf("function openReader(id)"), js.indexOf("function closeReader()"));
  assert.match(openReader, /applyReaderSettings\(\)/u);
  assert.match(openReader, /readerScroll\) readerScroll\.scrollTop = 0/u);
  assert.match(openReader, /hasMeaningfulProgress/u);
  assert.match(openReader, /readerResumePending = hasMeaningfulProgress/u);
  assert.match(openReader, /showModal\(\)[\s\S]*?readerScroll\.scrollTop = 0/u);
  assert.doesNotMatch(openReader, /restoreReaderPosition/u);
  assert.match(js, /function resumeSavedPosition\(\)[\s\S]*?afterReaderLayout\(storyId, \(\) => \{[\s\S]*?restoreReaderPosition\(storyId, ratio\);[\s\S]*?readerResumePending = false;/u);
  assert.match(js, /target\.id === 'reader-continue'[\s\S]*?resumeSavedPosition\(\)/u);
  assert.match(js, /function startStoryFromBeginning\(\)[\s\S]*?state\.progress\[currentStory\.id\] = \{ ratio: 0, finished: false \}/u);
  assert.match(js, /function updateReaderProgress\(\)[\s\S]*?readerResumePending\) return/u);
});

test("reader settings are accessible, validated, local-only, and preserve serif body copy", () => {
  assert.match(html, /<summary class="reader-tool reader-settings-toggle"[^>]*>Aa<\/summary>/u);
  assert.match(html, /Text size[\s\S]*?data-reader-size="small"[\s\S]*?data-reader-size="regular"[\s\S]*?data-reader-size="large"/u);
  assert.match(html, /Reading width[\s\S]*?data-reader-width="narrow"[\s\S]*?data-reader-width="comfortable"[\s\S]*?data-reader-width="wide"/u);
  assert.match(html, /reading width, and progress are saved only on this device/u);
  assert.match(js, /readerSettings: \{ textSize: 'regular', readingWidth: 'comfortable' \}/u);
  assert.match(js, /\['small', 'regular', 'large'\]\.includes\(saved\.readerSettings\?\.textSize\)/u);
  assert.match(js, /\['narrow', 'comfortable', 'wide'\]\.includes\(saved\.readerSettings\?\.readingWidth\)/u);
  assert.match(js, /localStorage\.setItem\(storageKey, JSON\.stringify\(state\)\)/u);
  assert.match(js, /function setReaderSetting\([\s\S]*?persistState\(\)[\s\S]*?applyReaderSettings\(\)/u);
  assert.match(css, /\.reader\[data-reader-size="small"\] \.reader-body\{font-size:19px/u);
  assert.match(css, /\.reader\[data-reader-width="wide"\] \.reader-body\{width:100%;max-width:76ch/u);
  assert.match(css, /\.reader-body\{font-family:var\(--serif\)\}/u);
  assert.match(css, /\.reader-setting-options button\{[^}]*min-height:44px/u);
});

test("reader completion is guarded by the near-end scroll threshold", () => {
  assert.match(js, /const READER_COMPLETION_THRESHOLD = 0\.9/u);
  assert.match(js, /function canMarkStoryFinished\(\)[\s\S]*?readerScrollRatio\(\) >= READER_COMPLETION_THRESHOLD/u);
  assert.match(js, /readerRead\.disabled = finished \|\| !canMarkStoryFinished\(\)/u);
  assert.match(js, /function markFinished\(\)[\s\S]*?if \(!canMarkStoryFinished\(\)\)[\s\S]*?Read near the end of the story/u);
  assert.match(html, /id="reader-finish-hint"[^>]*>Available after reading near the end of the article\./u);
  assert.match(css, /\.reader-finished\{min-height:44px\}/u);
});

test("live story discovery searches the published catalog with debounce, cancellation, and pagination states", () => {
  assert.match(html, /id="search" type="search" maxlength="100"/u);
  assert.match(js, /function schedulePublicCatalogSearch\([\s\S]*?publicStoryRequestController\?\.abort\(\)[\s\S]*?setTimeout\(run, 260\)/u);
  assert.match(js, /params\.set\('q', publicStoryQuery\)/u);
  assert.match(js, /signal: controller\.signal/u);
  assert.match(js, /if \(requestId !== publicStoryRequestId\) return false/u);
  assert.match(js, /Searching published stories…/u);
  assert.match(js, /No published stories match that search\./u);
  assert.match(js, /Published story search is temporarily unavailable/u);
  assert.match(workerJs, /published = 1 AND managed_by = \?\$\{searchSql\}/u);
  assert.match(workerJs, /function publicSearchPattern\(url\)/u);
});

test("writer discovery searches published catalog bylines only and keeps local preview scope honest", () => {
  assert.match(html, /id="writer-search" type="search" maxlength="100"/u);
  assert.match(html, /id="writer-search-status" role="status" aria-live="polite"/u);
  assert.match(html, /id="writer-load-more"[^>]*hidden/u);
  assert.match(js, /function scheduleWriterSearch\([\s\S]*?writerSearchController\?\.abort\(\)[\s\S]*?setTimeout\(run, 260\)/u);
  assert.match(js, /apiRequest\('\/api\/writers\?' \+ params\.toString\(\)/u);
  assert.match(js, /published writers and publications/u);
  assert.match(js, /No published writers or publications match that search\./u);
  assert.match(js, /Published writer search is temporarily unavailable/u);
  assert.match(js, /Local preview · Searching sample-story bylines saved on this device\./u);
  assert.match(workerJs, /WHERE published = 1 AND managed_by = \?/u);
  assert.match(workerJs, /author LIKE \? ESCAPE/u);
  assert.match(workerJs, /publication LIKE \? ESCAPE/u);
  assert.doesNotMatch(workerJs, /writer_profiles|writer_id/u);
});


test("reader response actions have accessible 44px touch targets", () => {
  assert.ok(html.includes('id="reader-respond-cancel"'));
  assert.ok(html.includes('>Post response</button>'));
  assert.match(css, /\.reader-response-actions \.reader-action\{[^}]*min-width:44px;min-height:44px/u);
  assert.match(css, /\.reader-response-actions \.reader-action:focus-visible\{[^}]*outline:/u);
});


test("React entry owns the browser runtime and keeps legacy behavior isolated", () => {
  assert.match(reactEntry, /createRoot\(rootElement\)/u);
  assert.match(reactEntry, /import\(["']\.\/legacy-controller\.js["']\)/u);
  assert.match(appBundle, /createRoot/u);
  assert.match(appBundle, /ink-react-app/u);
});

test("generated browser bundle is synchronized into public assets", async () => {
  const publicApp = await readFile(new URL("../public/app.js", root), "utf8");
  assert.equal(publicApp, appBundle);
});

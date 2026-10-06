# ink.gs — Task History

Keep concise records of recent work; archive older entries if this file grows beyond roughly 30 tasks.

## TASK-001 — Editorial UI refinement and memory setup
- **Date:** 2026-10-05
- **Type:** fix / chore
- **Summary:** Improved the editorial feed's honest empty/preview state, initial skeleton, reader banner behavior, responsive navigation drawer, typography, and accessibility; installed and customized project-memory guidance using the user-provided product description.
- **Changed files:** Frontend source and generated assets under `index.html`, `styles.css`, `app.js`, `public/`, and `src/static-content.js`; tests under `test/`; project guidance and memory files under `AGENTS.md`, `.github/agent/`, `.github/project-metadata.yml`, `.github/copilot-instructions.md`, `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/workflows/memory-check.yml`, `.codex/`, and `.cursor/`.
- **Verification:** `npm test` passed (50/50); `npm run build:assets` passed; ai-coding-ok verifier found all 16 required files with no unresolved placeholders. Browser checks passed at 320, 360, 390, 430, 768, and 1280px; drawer open/focus trap/body scroll lock/Escape/backdrop/navigation passed; no page errors or external requests. Memory-check embedded Bash passed `bash -n`; a YAML parser was unavailable, so YAML parser validation was not run.
- **Notes:** Existing `.github/workflows/ci.yml` was preserved. The repository uses `test/` (singular), so the memory-check path uses the actual directory rather than creating `tests/`. No push, publish, deploy, remote migration, or remote service call was performed.

### TASK-002 — Responsive feed and reader final visual QA
- **Date:** 2026-10-05
- **Type:** fix / test
- **Summary:** Refined feed-card and reader type scales, compacted the mobile reader action row with a flex-based scroll boundary and safe-area padding, aligned skeleton dimensions (including a third title placeholder only at 320–360px), shortened the mobile hero/tab offset, increased the mobile wordmark/excerpt sizes, and labeled desktop Staff picks as sample stories.
- **Changed files:** `index.html`, `styles.css`, `test/site-structure.test.js`, regenerated `public/` assets and `src/static-content.js`, and this task-history entry.
- **Verification:** `npm run build:assets` passed; `npm test` passed (52/52); `git diff --check` passed; root/public frontend parity and Worker CSS bundle parity verified. Chromium checks passed at 320, 360, 390, 430, 768, and 1280px: titles 24–28px, body 21–24px, no horizontal overflow, reader action buttons fit at 320px with 44px targets, article text clears the action row, representative skeleton/feed height delta stays under 20px, desktop sample label is present, and drawer focus trap/restoration remains intact.
- **Notes:** CSS safe-area env() usage and bottom text clearance were verified, but Chromium did not emulate a physical iOS notch/inset. No publish, deploy, push, or external operation was performed; no architecture decision or project-fact change was needed.

### TASK-003 — Hide the closed mobile reader and guard its state
- **Date:** 2026-10-05
- **Type:** fix / test
- **Summary:** Fixed the mobile flex display override that rendered a closed reader above the feed. The dialog now starts hidden, is revealed only on open, is re-hidden after the close button or native Escape close, and has a CSS closed-state guard. Added regression coverage and responsive 44px reader hit areas plus larger mobile wordmark/excerpt text.
- **Changed files:** `index.html`, `app.js`, `styles.css`, `test/site-structure.test.js`, generated `public/index.html`, `public/app.js`, `public/styles.css`, `src/static-content.js`, and this task-history file.
- **Verification:** `npm run build:assets` passed; `npm test` passed (53/53); `git diff --check` passed; source/public parity and generated Worker bundle inclusion checked. Chromium browser checks passed at 390px: initial closed dialog had `hidden=true`, `open=false`, `display:none`, and zero bounds; feed tab remained clickable; reader opened as a modal with `display:flex`; close and Escape both hid it and restored page scrolling (scrollY 321); close/tool controls measured at least 44px. At 320px, both closed and open reader states fit without horizontal document overflow; mobile wordmark/excerpt measured 40px/15px.
- **Notes:** The browser-only story fixture was intercepted locally and was not written to the app or published. No deployment, publishing, push, or remote operation was performed; project facts and architecture did not change.

### TASK-004 — Mobile touch targets and feed geometry refinement
- **Date:** 2026-10-05
- **Type:** fix / test
- **Summary:** Added the requested “Open in app ↗” bar as a restrained, non-interactive note with no destination; compacted the mobile intro; raised feed excerpts to the brief’s 20–23px range; corrected skeleton title/paragraph geometry; and enlarged audited header, drawer, search, and close hit areas to 44×44px. Preserved the closed-reader guard and existing empty-state behavior.
- **Changed files:** `index.html`, `styles.css`, `test/site-structure.test.js`, regenerated `public/index.html` and `public/styles.css`, regenerated `src/static-content.js`, and this task-history entry. `public/app.js` remained byte-identical to `app.js`.
- **Verification:** `npm run build:assets` passed; `npm test` passed (54/54); `git diff --check` passed; source/public parity confirmed for `index.html`, `styles.css`, and `app.js`. Exact-width local Playwright checks passed at 320, 360, 390, and 430px: no horizontal overflow; excerpt text 20–21.5px; hero 80.5–97.3px; 44×44px menu/search/search-clear/drawer-close/reader-close targets; reader hidden initially and after close; drawer, search-clear, bookmark, story-menu dismissal, and reader-close interactions passed; skeleton/feed row deltas stayed within 6.4–18px. No page errors or non-local requests occurred.
- **Notes:** The In-App Browser input channel returned `BROWSER_NOT_READY`; exact-width browser checks were completed with the already-installed local Playwright runner and a route guard blocking non-local hosts. The temporary fixture and local preview server were removed/stopped. No app destination, offer, deployment, publication, or remote operation was added or performed. No project facts or architecture changed.

### TASK-005 — Feed status alignment, tab semantics, and narrow-card regression fixes
- **Date:** 2026-10-05
- **Type:** fix / test
- **Summary:** Reserved two lines of status space on mobile so the first feed item keeps a stable vertical origin from loading skeleton to loaded card; synchronized tab `aria-selected` with the selected feed view; and added a 320px-only smaller thumbnail/gap while keeping the skeleton columns aligned.
- **Changed files:** `index.html`, `app.js`, `styles.css`, `test/site-structure.test.js`, generated `public/` frontend mirrors, `src/static-content.js`, and this task-history entry.
- **Verification:** `npm run build:assets` passed; `npm test` passed (56/56); `git diff --check` passed; exact source/public parity and Worker-bundle content equality verified. Chromium at 320px with a delayed local-only demo API measured 47px status-slot height in both states and 0px first-item movement (367.27px before and after); the loaded card used 193px text + 72px thumbnail with an 8px gap and the demo title wrapped to four lines. Both tabs' selected class, text color, underline, and `aria-selected` matched; Following filtered the demo story and For you restored it. No browser page errors occurred.
- **Notes:** The local demo response was a temporary browser-only fixture and was not stored in the app or published. No deployment, publication, push, remote operation, project-fact change, or architecture decision was made. Existing unrelated UI/auth edits were preserved.

### TASK-006 — Honest feed loading and race-safe editor sign-in
- **Date:** 2026-10-05
- **Type:** fix / test / chore
- **Summary:** Carried the completed local work onto the current `main` tip. Kept feed cards through empty refreshes, exposed honest empty/unavailable states and an initial-fetch skeleton, synchronized tab ARIA state, and refined the responsive reader and mobile drawer’s overlay, focus return, and keyboard boundary. Replaced nonfunctional app/discount promotion claims with a noninteractive availability note and a working internal About destination. Made per-IP login-attempt accounting atomic before password verification and added a concurrent-guess regression test. Added the customized project guidance, issue/PR templates, metadata, and memory reminder workflow.
- **Changed files:** `app.js`, `index.html`, `styles.css`, `src/worker.js`, regenerated `src/static-content.js`, `test/site-structure.test.js`, `test/worker.test.js`, `.gitignore`, `AGENTS.md`, `CLAUDE.md`, `.codex/`, `.cursor/`, `.github/agent/`, `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/copilot-instructions.md`, `.github/project-metadata.yml`, and `.github/workflows/memory-check.yml`.
- **Verification:** `npm test` passed (57/57); `npm run build:assets` passed; source/public frontend parity and exact Worker bundle source embedding passed; `node --check app.js` and `node --check src/worker.js` passed; `git diff --check` and staged-diff whitespace checks passed after integration.
- **Notes:** Based the review branch on live `main` commit `362ccaa`. No merge, deployment, remote migration, or production-data change was performed. The push and PR are explicitly requested as review-only actions.

### TASK-007 — Ink.gs editorial polish and truthful preview states
- **Date:** 2026-10-05
- **Type:** polish / fix / test
- **Summary:** Refined the feed and reader with a restrained brass accent, quieter promotional surfaces, improved editorial spacing and responsive reader typography, and a higher-contrast local-preview disclosure. Bundled stories and their sample activity now appear only when API mode is disabled; API-backed pages wait for published API content or show the existing loading/empty/unavailable states. Replaced the unsupported “Member-only” reader chip with a “Sample story” chip for local fixtures only.
- **Changed files:** `app.js`, `index.html`, `styles.css`, regenerated `public/` mirrors and `src/static-content.js`, `test/site-structure.test.js`, `.github/agent/memory/project-memory.md`, `.github/agent/memory/decisions-log.md`, and this task-history entry.
- **Verification:** `npm run build:assets` passed; `npm test` passed (59/59); `node --check app.js` and `node --check src/worker.js` passed; `git diff --check` passed; generated public files and the Worker bundle match frontend sources. Chromium passed at 1440, 768, 390, and 320px with no horizontal overflow; reader open/close passed at 768, 390, and 320px; the API-unavailable preview showed zero bundled stories and the honest empty state; no runtime exceptions occurred. The preview disclosure color measured 7.15:1 contrast against the page background.
- **Notes:** Preserved the existing review-branch work based on `origin/main` `362ccaa`. No push, merge, deploy, publication, or remote service/data change was performed; no dependencies were added. The temporary local preview server was stopped after browser checks.

### TASK-008 — Mobile feed height, avatar target, and preview-rail gating
- **Date:** 2026-10-05
- **Type:** polish / fix / test
- **Summary:** Compressed the mobile About banner to its truthful internal link and reduced main top padding, moving the first feed headline 26px earlier while preserving the Open in app note and reserved truthful feed-status slot. Expanded the mobile profile button to a 44×44px tap target while retaining a 34×34px visible circle. Gated the three bundled Staff picks to local preview so API-backed empty and unavailable feeds never show them.
- **Changed files:** `index.html`, `app.js`, `styles.css`, `test/site-structure.test.js`, regenerated `public/` frontend mirrors and `src/static-content.js`, `.github/agent/memory/project-memory.md`, `.github/agent/memory/decisions-log.md`, and this task-history entry.
- **Verification:** `npm run build:assets` passed; `npm test` passed (63/63); `node --check app.js` and `git diff --check` passed; `public/` mirrors match sources. Chromium at 320, 390, 430, and 1440px showed no horizontal overflow or page errors; the mobile headline moved from 328.1px to 302.1px, the avatar target measured 44×44px with a 34×34px content circle, and desktop layout/sample labels remained intact. Local API route mocks confirmed zero visible Staff picks with truthful “No published stories yet.” for HTTP 200 empty and “Online stories are temporarily unavailable.” for HTTP 503.
- **Notes:** Existing worktree changes were preserved. No Worker/security logic, dependencies, remote services, or deployment state changed; no commit or push was made. `.github/agent/memory/project-memory.md` and `decisions-log.md` now explicitly include the Staff picks preview-only rule.


### TASK-009 — Project-memory documentation cleanup
- **Date:** 2026-10-05
- **Type:** chore
- **Summary:** Removed a duplicate Core paths table heading and clarified the decisions-log introduction so it accurately reflects the first recorded ADR.
- **Changed files:** `.github/agent/memory/project-memory.md`, `.github/agent/memory/decisions-log.md`, and this task-history entry.
- **Verification:** `git diff --check` passed; no application code or architecture changed.
- **Notes:** Documentation-only cleanup; no publish or deployment.

### TASK-010 — Remaining responsive UI spec and interaction gaps
- **Date:** 2026-10-05
- **Type:** fix / test
- **Summary:** Finished the supported home/feed, mobile drawer, story-card, article-reader, responsive-geometry, touch-target, accessibility, and interaction work. The drawer now stays near 62% of phone width down to 320px; story titles are native buttons inside semantic headings, thumbnails open the same reader, mobile dialog destinations close the drawer, and desktop navigation stays exposed to assistive technology. Removed the unverified membership-promotion card and its dead action while preserving preview-only sample stories and truthful API loading/empty/error states.
- **Changed files:** `app.js`, `index.html`, `styles.css`, `test/site-structure.test.js`, generated `public/` mirrors and `src/static-content.js`, `.github/agent/memory/project-memory.md`, and this task-history entry. No architecture change was made, so the decisions log was not updated.
- **Verification:** `npm run build:assets` passed; `npm test` passed (65/65); `node --check` passed for `app.js`, `src/worker.js`, and the site-structure tests; `git diff --check` passed. `index.html`, `styles.css`, and `app.js` matched their `public/` mirrors and the Worker bundle exactly. Local Chromium passed at 320, 360, 375, 390, 412, 430, 768, and 1280px with no horizontal overflow, 44px mobile feed actions, semantic title keyboard activation, reader fit, and proportional phone drawers. Drawer-triggered profile/writer/game dialogs, search, thumbnail opening, and close paths passed at 390px. Skeleton states passed at 320, 390, and 768px. No page errors or non-local requests occurred.
- **Notes:** Preserved the existing review branch at `b5e7106` over `origin/main` `362ccaa` and all pre-existing worktree changes. No commit, push, merge, deploy, production call, remote data change, or dependency change was performed. Discount/upgrade and membership promotion remain unsupported without a verified offer and destination; the “Open in app” bar remains informational because no app destination is configured; the green article passages in references are text selection, so persistent highlighting was not added without annotation support.


### TASK-011 — Remove duplicate feed bookmark glyph
- **Date:** 2026-10-05
- **Type:** fix / test
- **Summary:** Removed the CSS pseudo-element bookmark glyph from base and mobile rules because feed buttons already render the bookmark SVG; preserved the saved-state color and added regression coverage against duplicate visual sources.
- **Changed files:** `styles.css`, `test/site-structure.test.js`, regenerated `public/styles.css` and `src/static-content.js`, and this task-history entry.
- **Verification:** `npm run build:assets` passed; `npm test` passed (66/66); JavaScript syntax checks and `git diff --check` passed.
- **Notes:** No behavior or backend architecture changed. No commit, push, merge, or deployment.


### TASK-012 — Device-local reader controls and published catalog discovery
- **Date:** 2026-10-05
- **Type:** feature / fix / test
- **Summary:** Added explicit Continue reading/Start from beginning actions for meaningful unfinished progress while normal reader opens remain at the top; deferred normalized scroll restoration until content/layout is ready; added accessible device-local serif reader size/width choices; and gated completion until the reader is near the end. Extended published story search with bounded literal queries and added cursor-paginated writer discovery from actual published-story author/publication strings, with abortable/race-safe UI states and honest local-preview behavior.
- **Changed files:** `app.js`, `index.html`, `styles.css`, `src/worker.js`, `test/site-structure.test.js`, `test/worker.test.js`, generated `public/index.html`, `public/styles.css`, `public/app.js`, `src/static-content.js`, and `.github/agent/memory/project-memory.md`, `decisions-log.md`, and this task-history entry. No migration or dependency changes.
- **Verification:** `npm test` passed (74/74); `npm run build:assets` passed; `node --check` passed for application, Worker, and test files; SQLite migrations and published-only literal search SQL were validated in an in-memory database; root/public parity, Worker bundle equality, and `git diff --check` passed. Local Chromium/Playwright interaction checks passed at 320, 390, 768, and 1280px for no-auto-jump, resume/start-over, local preference persistence and 44px controls, near-end completion, story/writer search paging, loading/empty/error states, and a delayed stale-search response; every non-local browser request was blocked and none was attempted.
- **Notes:** Preserved the existing uncommitted worktree on `review/editorial-feed-auth-hardening-2026-10-05`. No commit, push, merge, deployment, production check, remote migration, or external service call was performed. Reader progress/settings remain device-local; no new identity, reader authentication, or synchronization was added.


### TASK-013 — Reader resume/reopen state regression follow-up
- **Date:** 2026-10-05
- **Type:** fix / test
- **Summary:** Kept meaningful saved progress intact while the explicit resume choice is pending; ordinary opens reset to the top before and after the native dialog opens, preferences are applied before layout, Continue restores the saved normalized ratio after layout, and Start from beginning resets device-local progress. Guarded the delayed native dialog `close` event so a fast reopen does not hide the reader or clear the reopened story state. Added a dependency-free Node/Chromium browser regression for saving progress, reopening, Continue, and Start from beginning.
- **Changed files:** `app.js`, generated `public/app.js` and `src/static-content.js`, `test/site-structure.test.js`, new `test/reader-progress.browser.test.js`, and this task-history entry. Existing search/API and earlier worktree changes were preserved.
- **Verification:** `npm run build:assets` passed; `npm test` passed (76/76); the headless Chromium reader regression passed three consecutive standalone runs and again in the full suite; `node --check` passed for `app.js`, `src/worker.js`, `test/site-structure.test.js`, and `test/reader-progress.browser.test.js`; root/public parity and exact `INDEX_HTML`/`STYLES_CSS`/`APP_JS` Worker-bundle parity passed; `git diff --check` passed.
- **Notes:** Progress and reader preferences remain browser-local. No search/API behavior, D1 schema, dependencies, commit, push, merge, deployment, production operation, or external service was changed or performed.

### TASK-014 — React frontend migration foundation
- **Date:** 2026-10-06
- **Type:** architecture / migration / test
- **Summary:** Moved the browser render surface to React 19, added esbuild, made `index.html` a minimal `#root` shell, bundled `src/react/main.jsx` into `app.js`, and isolated the former DOM controller in `src/react/legacy-controller.js` as a compatibility bridge.
- **Verification:** GitHub Actions passed with the browser reader regression, generated asset synchronization, and D1 migration validation. A live GitHub Pages smoke test confirmed the app renders under `#root`, the feed is usable, mobile has no obvious horizontal overflow, and a story reader opens/closes.
- **Notes:** This is a compatibility-first migration. Worker routes, D1 contracts, local reader state, and publishing behavior remain unchanged. Component-by-component migration of the compatibility controller is still pending.

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

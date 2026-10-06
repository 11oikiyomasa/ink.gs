<!-- ai-coding-ok: v4.1.0 -->
# ink.gs — Agent Workflows

## Feature work
1. Read `AGENTS.md` and the three memory files; inspect the relevant React source, Worker, data, and generated assets.
2. Compare the request with project constraints: preserve the real brand, use existing data, and do not invent content or destinations.
3. Choose the smallest implementation and identify tests. Proceed when direction is clear; ask only for a materially missing choice or authority.
4. Implement and update tests. For frontend changes, run `npm run build:assets` to synchronize `public/` and `src/static-content.js`.
5. Run `npm test`, inspect relevant responsive/browser interactions when feasible, update task history, and report limits accurately.

## Bug fixes
1. Reproduce the issue or add a failing regression test where practical.
2. Trace the cause through source files and generated outputs; do not patch only a generated copy.
3. Make the narrowest safe fix, then run the relevant tests and build.
4. Check for regressions in adjacent flows, keyboard access, responsive widths, and Worker security controls.
5. Record the work in `task-history.md`; update other memory files only when project facts or decisions change.

## Refactors
Keep behavior stable, make small steps, and run tests after meaningful changes. Update project memory if file responsibilities or architecture actually change; record a decision only when a new technical choice is made.

## Content and UI review
Use only repository content and verified user-provided material. When stories are absent, retain the feed structure with an honest editorial empty/preview state. Add links or buttons only when a real supported action and destination exist. Verify semantic labels, focus behavior, Escape/overlay behavior for dialogs or drawers, and narrow-screen layout.

## Release and deployment
Local checks are `npm test` and `npm run build:assets`. The optional deploy command and `.github/workflows/deploy-worker.yml` can change remote Worker/D1 state. Never push, publish, deploy, set secrets, or apply remote migrations unless the user explicitly requests it and any required authority is present.


## React migration
Edit `src/react/` for UI changes. Keep generated `app.js`, `public/`, and `src/static-content.js` synchronized through the build rather than hand-editing generated output.

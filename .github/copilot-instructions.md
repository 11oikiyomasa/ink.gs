<!-- ai-coding-ok: v4.1.0 -->
# Copilot Instructions — ink.gs

## Required context loop
Before coding, read `AGENTS.md` and `.github/agent/memory/project-memory.md`, `decisions-log.md`, and `task-history.md`. After coding, update task history; update project memory or decisions only when facts or decisions actually change.

## Project
ink.gs is a lightweight editorial publishing and long-form reading platform backed by Cloudflare Workers and D1. The frontend is semantic HTML, CSS, and vanilla JavaScript. `src/worker.js` serves the frontend and D1-backed APIs. `public/` and `src/static-content.js` are generated from root frontend files by `npm run build:assets`. Tests use Node's built-in `node:test` runner.

## Implementation rules
- Preserve the existing architecture and brand. Prefer small, dependency-free changes.
- Use real repository/API content only. Never fabricate articles, reader counts, claims, promotions, app links, or destinations; show a clear empty/preview state when needed.
- Keep the interface responsive and accessible: semantic controls, keyboard operation, visible focus, and no horizontal overflow.
- Keep article headings bold sans-serif and long-form body copy serif. Use local/system fonts; do not weaken CSP or load remote fonts.
- Add/update tests for behavior changes. Run `npm test`; when frontend source changes, run `npm run build:assets` and check generated assets.
- Preserve D1 migrations and Worker authentication, CSRF, same-origin, and security-header protections. Never commit secrets.
- No formatter, linter, type checker, or coverage command is configured; do not claim those checks were run.
- Do not push, publish, deploy, apply remote migrations, or change remote services unless explicitly requested.

## Repository map
```text
index.html, styles.css, app.js  source frontend
src/worker.js                   Cloudflare Worker
src/static-content.js           generated Worker frontend bundle
public/                         generated static frontend
migrations/                     D1 schema migrations
scripts/                         build and local credential helpers
test/                            Node built-in tests and D1 test double
```

## Completion report
Summarize changes and affected paths, state tests/build/browser checks actually run, list limitations, and include a **Memory updates** section naming the updated records. Communicate in English unless the user asks otherwise.

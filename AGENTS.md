<!-- ai-coding-ok: v4.1.0 -->
# ink.gs — Project guide

## Required project context loop
Before coding, read this file, `.github/agent/system-prompt.md`, `.github/agent/workflows.md`, `.github/agent/coding-standards.md`, and all three files in `.github/agent/memory/`. After coding, always update `task-history.md`; update `project-memory.md` when project facts change and `decisions-log.md` when a new architectural or technical decision is made.

## Product and architecture
ink.gs is a lightweight editorial publishing and long-form reading platform backed by Cloudflare Workers and D1.

```text
Browser UI: src/react/main.jsx + src/react/App.jsx + styles.css → generated app.js
                       │ same-origin requests / ASSETS
                       ▼
Cloudflare Worker: src/worker.js ── DB binding ── Cloudflare D1
                       │                              ▲
                       └── bundled static content     │
                                         migrations/*.sql

npm run build:assets: source UI → public/ and src/static-content.js
```

- `index.html`, `styles.css`: document shell and presentation source.
- `src/react/main.jsx`, `src/react/App.jsx`: React entry point and render surface.
- `src/react/legacy-controller.js`: temporary compatibility controller during migration.
- `app.js`: generated browser bundle; do not hand-edit.
- `src/worker.js`: Worker routes, editor authentication, publishing, and public APIs.
- `src/static-content.js`: generated Worker copy of the frontend; rebuild it rather than hand-editing it.
- `migrations/`: D1 schema migrations.
- `scripts/`: asset-building and local credential-hash helpers.
- `test/`: Node.js built-in test suite and in-memory D1 test double.
- `public/`: generated static frontend; keep it synchronized with the sources.

## Commands
- Tests: `npm test`.
- Build/synchronize generated assets: `npm run build:assets`.
- Optional local Worker: build assets, apply D1 migrations locally, create ignored `.dev.vars` with a password hash (never the raw password), then run `npx --yes wrangler@latest dev`.
- No lint, formatter, type-check, or coverage command is configured.
- `npm run deploy` deploys the Worker. Do not deploy, publish, push, or apply remote migrations unless the user explicitly asks.

## Project constraints
- Preserve the `ink.gs` identity and existing project architecture; prefer small, dependency-free changes.
- Never invent stories, reader statistics, claims, app links, or destinations. When content or an action is unavailable, label it honestly and keep controls disabled or omit them.
- Keep article headings bold sans-serif and reading copy serif; use local/system fonts. Do not add Google Fonts or weaken CSP to load fonts.
- Keep controls semantic, keyboard accessible, and functional; test narrow layouts and prevent horizontal overflow.
- When changing frontend sources, run `npm run build:assets` and verify generated `public/` and Worker assets remain in sync.
- Add tests for behavior changes and run `npm test`.
- Do not commit secrets. Editor hashes and Worker secrets belong in ignored local configuration or approved deployment secrets; never put raw passwords or tokens in source.
- Keep D1 changes in migrations. Do not modify production configuration or perform remote database operations without explicit user authorization.


## React migration boundary
- New UI belongs under `src/react/`.
- Prefer React components/hooks for new behavior.
- Keep the existing DOM controller isolated in `src/react/legacy-controller.js` until each behavior is migrated and covered.
- `app.js`, `public/`, and `src/static-content.js` are generated; regenerate them with `npm run build:assets`.

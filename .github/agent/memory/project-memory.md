# ink.gs — Project Memory

Stable project facts and constraints for future work. Update this file when the product, architecture, or operational facts materially change.

## Product facts

| Field | Current knowledge |
|---|---|
| Name | ink.gs |
| Description | A lightweight editorial publishing and long-form reading platform backed by Cloudflare Workers and D1. |
| Audience size | Not recorded in the repository. |
| Release stage/version | Not recorded; verify before making release claims. |
| Design priorities | Honest editorial presentation, accessible long-form reading, responsive UI, minimal dependencies, secure publishing. |
| Language/runtime | JavaScript ES modules; Node.js 22+ for local tests/build scripts; Cloudflare Workers runtime in deployment. |
| Database | Cloudflare D1 via the Worker `DB` binding. |
| ORM | None identified. |

## Architecture

```text
Reader/editor browser
   ├── index.html + styles.css + app.js
   └── same-origin API and static assets
             ↓
      src/worker.js (Cloudflare Worker)
             ├── D1 binding → migrations/*.sql
             └── bundled UI → src/static-content.js

npm run build:assets copies root frontend files to public/ and refreshes the Worker bundle.
```

The root `index.html`, `styles.css`, and `app.js` are frontend sources. `public/` is a generated static mirror. `src/static-content.js` embeds the frontend for the Worker. `src/worker.js` serves the app and handles editor authentication, publishing, public story APIs, and reader interactions. `migrations/` defines D1 tables. `scripts/` holds asset-building and password-hash helpers. `test/` contains Node's built-in tests and an in-memory D1 test double. The existing GitHub CI runs JavaScript syntax checks, tests, the asset build/synchronization check, and SQLite migration validation.

## Data and behavior

The Worker exposes the D1-backed CMS and social APIs on the same origin. Public story listing/search is limited to published rows; `GET /api/stories` supports bounded literal search while preserving its published-only cursor pagination, and `GET /api/writers` groups actual author/publication strings from published stories only without inventing profiles or stable writer IDs. Editor listing/writes require authentication and CSRF/same-origin protections. Reader bookmarks, follows, reading progress, reader preferences, drafts, profiles, writer follows, and games remain browser-local; do not assume those records are synchronized to D1. In static-preview mode writer search covers sample-story bylines only; in API mode it searches the published catalog.

Bundled story and engagement fixtures, including the static Staff picks rail, render only when the API is disabled, are labeled as local preview samples, and are withheld from API-backed startup. When the Worker API is enabled, show live published rows or honest loading/empty/unavailable states rather than using bundled fixtures; the current Staff picks rail has no live-data source and stays hidden in API mode. Use actual repository/API data when present; otherwise preserve feed structure with a clearly labeled, non-fabricated placeholder/empty state. Never invent article stories, engagement counts, promotional promises, app links, or destinations.

## Core paths

| Path | Responsibility |
|---|---|
| `index.html`, `styles.css`, `app.js` | Source frontend and interactions |
| `src/worker.js` | Worker routing, security, publishing and APIs |
| `src/static-content.js` | Generated embedded frontend |
| `public/` | Generated static frontend |
| `migrations/` | D1 migrations |
| `scripts/` | Build and local credential utilities |
| `test/` | Automated tests and test doubles |
| `.github/workflows/ci.yml` | Existing project-specific validation workflow; preserve its behavior |
| `.github/workflows/deploy-worker.yml` | Manually dispatched remote deployment workflow; do not run without explicit authorization |

## Development commands

- `npm test` runs `node --test` with the in-memory D1 test double.
- `npm run build:assets` copies frontend sources into `public/` and regenerates `src/static-content.js`; optional `assets/` source photos are included if present.
- Optional local Worker: prepare assets, apply both migrations to local D1, set an `EDITOR_PASSWORD_HASH` in ignored `.dev.vars`, then run `npx --yes wrangler@latest dev`.
- `npm run deploy` invokes a remote deployment. No lint, formatter, type-check, or coverage script is configured.

## Constraints

1. Preserve the actual brand `ink.gs`, source content, and established architecture; avoid unnecessary dependencies.
2. Use system/local fonts; do not introduce Google Fonts or weaken CSP to load remote fonts.
3. Keep editorial headings bold sans-serif and long-form reading text serif where applicable.
4. Keep UI controls semantic, accessible, truthful, keyboard-operable, and responsive from narrow mobile to desktop.
5. Rebuild generated frontend outputs after changing their sources; do not hand-edit generated copies.
6. Keep secrets out of source and logs. Raw editor passwords must never be stored in project files; use the existing hash helper and approved secret handling.
7. Do not deploy, publish, push, change remote services, or apply remote migrations unless explicitly requested.

## Open/unknown facts

User scale, product release stage/version, and production service status are not established by checked-in files; do not infer or claim them. Verify the current Worker API/data state before describing live content availability.

## Visual-reference and UI notes

- The supplied green article passages show text selection/highlighting, not ordinary paragraph backgrounds. Do not render persistent highlights unless annotation support is actually implemented.
- Do not add membership/discount messaging or a promotion action without a verified offer and destination. Keep local preview stories clearly labeled and withhold them in API-backed loading, empty, and error states.
- Dynamic feed titles remain semantic headings containing native buttons; story thumbnails open the same reader, mobile drawer actions that launch dialogs close the drawer, and desktop navigation remains exposed to assistive technology.

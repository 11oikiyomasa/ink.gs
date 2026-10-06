# ink.gs — Technical Decisions Log

Record new architectural or technical decisions here, including context, alternatives, rationale, and consequences. Current source files and README document the existing design, but no prior ADR history was present when this memory system was initialized.

## Decision template

```markdown
### ADR-NNN: Short decision title
- Date: YYYY-MM-DD
- Status: Proposed / Accepted / Superseded

#### Context
What problem or constraint requires a decision?

#### Options
What reasonable alternatives were considered?

#### Decision and rationale
What was selected and why?

#### Consequences
What changes, trade-offs, or follow-up work result?
```

## Recorded decisions

The initial UI refinement and memory setup did not introduce a separate architecture or technology decision. ADR-001 below is the first formal project decision; add later ADRs only when new decisions are made, and do not retrofit assumptions as historical decisions.

### ADR-001: Keep bundled samples out of API-backed feeds
- Date: 2026-10-05
- Status: Accepted

#### Context
The browser contains bundled local preview stories, while API-backed pages load published content asynchronously. Showing the fixtures during that request can make sample content appear live.

#### Options
1. Render local fixtures while waiting for the Worker API.
2. In API mode, show the loading state and then API rows or an empty/unavailable state; use fixtures only when API mode is disabled.

#### Decision and rationale
Choose option 2. Local static preview keeps the bundled stories and labels them as sample content. API-backed startup does not seed the feed with fixtures and instead uses API results or the existing loading/empty/unavailable states. The static Staff picks rail is also hidden whenever API mode is enabled, including empty and unavailable responses, because it has no live-data source. The reader labels only bundled preview stories as “Sample story”; it does not claim they are member-only.

#### Consequences
API-backed pages no longer flash local sample stories before their first response or show the hard-coded Staff picks after an empty/error response. Local preview remains useful while clearly disclosing that its stories and activity are examples. The Worker, API, and storage architecture is unchanged.


### ADR-002: Search published catalog rows and keep reader preferences device-local
- Date: 2026-10-05
- Status: Accepted

#### Context
Reader progress already uses browser storage, while the existing writer finder only sees loaded story cards. The requested experience needs meaningful whole-catalog discovery without new reader accounts, invented writer profiles, cross-device sync, or disclosure of drafts/unpublished content.

#### Options
1. Add a writer-profile table/identity and a new reader-sync/authentication layer.
2. Extend the existing published-story query with bounded search and add a paginated public writer listing derived from published story author/publication strings; keep progress and reader settings in local storage.

#### Decision and rationale
Choose option 2. `GET /api/stories?q=…` retains its existing keyset pagination and published-only predicate while binding a bounded literal query as escaped `LIKE` parameters. `GET /api/writers?q=…` groups the existing published story rows by case-insensitive author string and returns only author, publication, and matching story count with a keyset cursor. Reader size, width, and progress stay in browser-local storage; normal opens remain at the top and restoring a saved normalized position requires an explicit reader action after layout.

#### Consequences
Catalog discovery now reaches published rows beyond the currently loaded page, while unpublished/local preview rows and fictional writer identities remain excluded. No migration, reader authentication, cross-device sync, or external service is introduced. Search values are bounded and parameterized; cursor pagination remains available for both result sets. Browser-local preferences and progress remain specific to that device.


### ADR-003: Migrate the browser render surface to React without replacing the Worker
- Date: 2026-10-06
- Status: Accepted

#### Context
The browser UI had accumulated a large imperative DOM controller. The requested direction was to move the frontend to React while keeping the existing Cloudflare Worker/D1 runtime.

#### Decision and rationale
Use React 19 with a local esbuild bundle. `index.html` becomes a minimal document shell, `src/react/main.jsx` owns mounting, `src/react/App.jsx` owns the current render surface, and the former imperative controller is isolated in `src/react/legacy-controller.js` as a compatibility layer. This avoids changing Worker/D1 contracts during the migration.

#### Consequences
React/ReactDOM and esbuild are now dependencies. Generated `app.js`, `public/`, and `src/static-content.js` must be synchronized by the build. Full controller-to-hooks/component migration remains follow-up work.

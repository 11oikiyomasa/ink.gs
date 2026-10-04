# ink.gs project-memory workflow (Codex)

Use this guide for coding tasks in this repository. Codex should also load the root `AGENTS.md`.

## Before work
Read `AGENTS.md`, `.github/agent/memory/project-memory.md`, `.github/agent/memory/decisions-log.md`, and `.github/agent/memory/task-history.md`. Inspect current source and local changes. Preserve the actual `ink.gs` brand, use verified repository/API content only, and avoid fabricated stories or destinations.

## Do and check
Follow `.github/agent/coding-standards.md`. Add or update tests for behavior changes. Run `npm test`; for frontend source changes run `npm run build:assets` and keep `public/` and `src/static-content.js` synchronized. Report exactly which browser/responsive checks ran. No lint, type-check, formatter, or coverage script is configured.

## After work
Always update `.github/agent/memory/task-history.md`. Update `project-memory.md` when project facts change and `decisions-log.md` when a new technical decision is made. State the memory updates in the final response.

## Safety
Do not push, publish, deploy, apply remote migrations, change remote services, or alter production data unless the user explicitly requests it. Never commit credentials or weaken the app's security protections.

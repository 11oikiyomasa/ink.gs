# ink.gs verification checklist

## Plan
- [ ] Read `AGENTS.md` and all three project memory files.
- [ ] Inspect the relevant source, generated copies, existing local changes, and project data.

## Check
- [ ] Run `npm test` and confirm the complete test output.
- [ ] For frontend source changes, run `npm run build:assets` and check generated `public/` and `src/static-content.js`.
- [ ] Check accessibility, empty/unavailable states, responsive layout, and relevant browser interactions where feasible.
- [ ] Do not claim lint, type-check, coverage, or browser checks that were not run; no lint/type/coverage command is configured.

## Act
- [ ] Update `task-history.md`.
- [ ] Update `decisions-log.md` only for new decisions.
- [ ] Update `project-memory.md` only when project facts change.
- [ ] Include a concise Memory updates section in the final response.

## Boundaries
- [ ] No push, publish, deploy, remote migration, or production data change without explicit request.

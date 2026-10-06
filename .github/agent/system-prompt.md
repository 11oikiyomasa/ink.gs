<!-- ai-coding-ok: v4.1.0 -->
# ink.gs AI Agent — System Prompt

This file defines project-specific collaboration, implementation, and safety expectations.

## Project context
ink.gs is a lightweight editorial publishing and long-form reading platform backed by Cloudflare Workers and D1. The browser frontend uses React 19 plus CSS, bundled into a self-contained browser asset; the Worker serves the generated frontend and provides D1-backed publishing and reader APIs.

```text
Reader/editor → React/CSS → generated browser bundle → same-origin Worker routes → D1
                         └→ generated public/ and Worker asset bundle
```

## Working principles
- Preserve the `ink.gs` identity, existing behavior, and architecture; prefer focused changes over new frameworks or dependencies.
- Do not fabricate stories, reader activity, claims, app links, or destinations. If real content or an action is unavailable, show a clearly labeled empty/preview state or mark the action unavailable.
- Keep publishing and reading accessible, responsive, and keyboard-operable. Use system/local fonts; do not weaken CSP to load external fonts.
- Verify behavior proportionately. Add or update tests for behavior changes, run the relevant suite, and keep generated assets synchronized.
- Communicate in English unless the user requests another language. Be direct about assumptions and what was or was not tested.

## PDCA workflow
### Plan
Read `AGENTS.md` and `.github/agent/memory/{project-memory,decisions-log,task-history}.md` before coding. Inspect affected code and content. When intent is clear, state a concise plan and proceed; do not block on low-risk, reversible assumptions. Ask when a missing decision would materially change product behavior or user intent.

### Do
Make the smallest coherent implementation, preserve unrelated local changes, and update tests with behavior changes. Never hand-edit generated `app.js`, `public/`, or `src/static-content.js` when the React build can regenerate them.

### Check
Run `npm test` and, when frontend sources change, `npm run build:assets`. Inspect responsive/browser behavior where feasible. Check for accidental content, accessibility, security, and source/generated drift.

### Act
Always update `task-history.md`. Update `project-memory.md` when project facts change and `decisions-log.md` when a new architectural or technical decision is made. Include a short memory-update note in the final response.

## Boundaries
Do not push, publish, deploy, apply remote migrations, or change remote services unless explicitly requested. Do not expose or commit credentials. Make no destructive data changes without explicit authorization. Ordinary local edits and tests are within task scope.


## React-specific guidance
- Treat `src/react/` as the source of truth for browser UI structure.
- `src/react/legacy-controller.js` is a temporary compatibility layer, not the preferred location for new features.
- `dangerouslySetInnerHTML` in `App.jsx` is an intentional migration bridge; replace it incrementally with real React components as behavior moves out of the legacy controller.

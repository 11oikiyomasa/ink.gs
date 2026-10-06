<!-- ai-coding-ok: v4.1.0 -->
# ink.gs — Coding Standards

## JavaScript and Worker code
- Use the existing ES-module style and platform Web APIs. Keep code compatible with Node.js 22 and Cloudflare Workers where applicable.
- Prefer clear names, small functions, explicit input validation, and early returns. Avoid unnecessary abstractions and dependencies.
- Preserve the project's existing formatting and patterns; no formatter, linter, or type checker is configured.
- Handle expected errors deliberately. Return appropriate HTTP status codes and avoid leaking internal details or credentials.
- Never log passwords, hashes, tokens, session identifiers, or other secrets.

## Frontend
- Use React components plus semantic HTML and native controls. Give interactive elements accessible names, keyboard behavior, visible focus, and truthful states.
- Keep layouts usable from 320px through desktop widths. Avoid horizontal overflow and respect reduced-motion preferences where animations are used.
- Use local/system font stacks. Do not add remote font dependencies or relax the Content Security Policy to load them.
- Keep article headings in the intended sans-serif style and long-form body copy in the intended serif style.
- Do not invent story content, engagement counts, claims, app links, or navigation destinations. Clearly label placeholder/empty states and unavailable actions.

## Data, security, and generated assets
- Keep D1 schema changes in ordered SQL files under `migrations/`; do not edit production data or apply remote migrations without explicit authorization.
- Validate and bound untrusted request data. Preserve authentication, CSRF, same-origin, cookie, and response-header protections in `src/worker.js`.
- Keep local secrets in ignored `.dev.vars` and deployment secrets in the configured secret store. Never commit plaintext credentials or tokens.
- `app.js`, `public/`, and `src/static-content.js` are generated from the React/frontend sources by `npm run build:assets`. Regenerate them after source changes and avoid manual edits to generated copies.

## Tests and verification
- Tests use Node's built-in `node:test` runner and the repository's in-memory D1 test double. Run them with `npm test`.
- Add regression coverage for behavior changes and use readable setup/action/assertion structure.
- Run `npm run build:assets` when frontend source files change; inspect the generated output and relevant browser states where feasible.
- No coverage, lint, type-check, or formatter command is currently configured; do not claim those checks were run.

## Git and external actions
Use Conventional Commit-style messages when requested. Do not push, publish, deploy, or change remote services unless the user explicitly asks.


## React
Prefer component composition and hooks for new UI work. Use the compatibility controller only for behavior not yet migrated, and do not add remote runtime CDN imports.

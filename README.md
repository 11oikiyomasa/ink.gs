# ink.gs — personal publishing site source archive

This archive contains the homepage, the Cloudflare Worker API, D1 migrations, tests, and the configuration/scripts needed to build and run the project. The homepage is split into semantic HTML, an external stylesheet, and an external application module. It references six local photo paths and includes client-side image fallbacks, so the photo source directory is optional. It contains no local editor password/hash, Cloudflare API token, or other credential.

## Requirements and local checks

Use Node.js 22 or newer. The project has no third-party package dependencies or lockfile; the test and asset-build commands use Node's built-in modules.

```sh
npm test
npm run build:assets
```

`npm test` runs the Worker tests using an in-memory D1 test double. `npm run build:assets` copies `index.html`, `styles.css`, and `app.js` into `public/`, then copies files from `assets/` when that optional source directory exists. When `assets/` is absent, the build still prepares the static homepage and reports that the built-in image fallbacks remain available. The generated `public/` copy is intentionally not duplicated in this archive.

Both SQL migrations can also be checked locally with SQLite. For example:

```sh
python3 - <<'PY'
import sqlite3
from pathlib import Path
connection = sqlite3.connect(':memory:')
for migration in sorted(Path('migrations').glob('*.sql')):
    connection.executescript(migration.read_text())
print(connection.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall())
PY
```

## Optional local Worker

The Wrangler CLI is not a project dependency. If needed, use an installed Wrangler or invoke it with `npx --yes wrangler@latest`. The local D1 database needs both migrations applied, and the Worker needs an `EDITOR_PASSWORD_HASH` in an ignored `.dev.vars` file. The helper reads the editor password from stdin and emits a salted PBKDF2-SHA256 hash; do not put the raw password in a command argument or project file.

In Bash, generate the local hash and write only the hash to the ignored file:

```sh
read -r -s -p 'Local editor password: ' editor_password
printf '\n'
hash=$(printf '%s' "$editor_password" | node scripts/hash-editor-password.mjs)
unset editor_password
(umask 077; printf 'EDITOR_PASSWORD_HASH=%s\n' "$hash" > .dev.vars)
unset hash
```

Then prepare assets, apply the local migrations, and start Wrangler:

```sh
npm run build:assets
npx --yes wrangler@latest d1 migrations apply medium-inspired-site-state --local
npx --yes wrangler@latest dev
```

## Deployment notes

`wrangler.jsonc` binds the Worker to the existing D1 database `medium-inspired-site-state` (`dd86809c-6ce0-4dd2-a8bb-f5d9d840a5b9`). The Worker serves the built frontend through the `ASSETS` binding and exposes the D1-backed API on the same origin, so the Worker URL is the canonical runtime for dynamic stories, editor publishing, and public social interactions. GitHub Pages remains a static mirror: local reading progress, bookmarks, following, drafts, profile, writer discovery, and games still work there, but remote CMS/auth/social APIs require the Worker runtime.

The repository contains a deployment workflow at `.github/workflows/deploy-worker.yml`. It expects these GitHub Actions secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `EDITOR_PASSWORD_HASH`
- `SOCIAL_SECRET`

The workflow builds assets, applies remote D1 migrations, sets Worker secrets, deploys, and then smoke-tests `/api/stories`. The raw editor password is never committed to the repository.

The CMS serves only published rows from `editor_stories` publicly; editor listing and writes require an authenticated session and CSRF/same-origin checks. Public reactions and responses are stored in D1 using a keyed anonymous reader fingerprint. The older `owner_state` table is retained by migration 0001 and is separate from the CMS tables; this project does not import browser-local bookmarks, follows, reading progress, or drafts into D1.

Before enabling the Worker deployment workflow, verify that the intended Cloudflare account owns the named D1 database and that the four required GitHub Actions secrets are present. Once those prerequisites exist, the workflow is the verification gate for the production Worker.

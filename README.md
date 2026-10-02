# ink.gs — personal publishing site source archive

This archive contains the homepage, the Cloudflare Worker API, D1 migrations, tests, and the configuration/scripts needed to build and run the project. The homepage references six local photo paths and includes client-side image fallbacks, so the photo source directory is optional. It contains no local editor password/hash, Cloudflare API token, or other credential.

## Requirements and local checks

Use Node.js 22 or newer. The project has no third-party package dependencies or lockfile; the test and asset-build commands use Node's built-in modules.

```sh
npm test
npm run build:assets
```

`npm test` runs the Worker tests using an in-memory D1 test double. `npm run build:assets` copies `index.html` into `public/` and copies files from `assets/` when that optional source directory exists. When `assets/` is absent, the build still prepares the static homepage and reports that the built-in image fallbacks remain available. The generated `public/` copy is intentionally not duplicated in this archive.

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

`wrangler.jsonc` binds the Worker to the existing D1 database `medium-inspired-site-state` (`dd86809c-6ce0-4dd2-a8bb-f5d9d840a5b9`). The editor API requires the `EDITOR_PASSWORD_HASH` Worker secret; the raw editor password is not part of the source. The `deploy` package script builds static assets and invokes Wrangler to publish, so it changes the remote service and is not a local check.

The current public Worker URL is <https://medium-inspired-site.andregsman.workers.dev>. The latest reported live smoke tests reached Cloudflare but returned **403 / error 1010**. The public endpoint is therefore **not claimed to be healthy or fully verified**. No live requests, remote D1 migrations, or deployment were performed while creating this archive. Before any future deployment, verify the intended Cloudflare account and database, the migration state, and the editor password hash secret.

The CMS serves only published rows from `editor_stories` publicly; editor listing and writes require an authenticated session and CSRF/same-origin checks. The older `owner_state` table is retained by migration 0001 and is separate from the CMS tables; this project does not import browser-local bookmarks, follows, reading progress, or drafts into D1.

-- Per-owner private state. The Worker derives owner_id only from verified Cloudflare Access identity.
CREATE TABLE IF NOT EXISTS owner_state (
  owner_id TEXT PRIMARY KEY NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 1),
  state_json TEXT NOT NULL CHECK (json_valid(state_json)),
  updated_at TEXT NOT NULL
);

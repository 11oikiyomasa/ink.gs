-- Legacy per-owner private state retained for schema compatibility.
-- The current Worker CMS does not import browser-local reading state into this table.
CREATE TABLE IF NOT EXISTS owner_state (
  owner_id TEXT PRIMARY KEY NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 1),
  state_json TEXT NOT NULL CHECK (json_valid(state_json)),
  updated_at TEXT NOT NULL
);

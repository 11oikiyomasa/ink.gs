-- Public story content is isolated from the pre-existing owner_state table.
-- Only rows marked with the server-owned site-editor manager key are mutable through the Worker.
CREATE TABLE IF NOT EXISTS editor_stories (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36),
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 120),
  summary TEXT NOT NULL CHECK (length(summary) <= 280),
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 120000),
  author TEXT NOT NULL CHECK (length(author) BETWEEN 1 AND 80),
  publication TEXT NOT NULL CHECK (length(publication) BETWEEN 1 AND 80),
  topic TEXT NOT NULL,
  photo TEXT NOT NULL,
  photo_alt TEXT NOT NULL CHECK (length(photo_alt) <= 180),
  published INTEGER NOT NULL CHECK (published IN (0, 1)),
  published_at TEXT,
  managed_by TEXT NOT NULL CHECK (managed_by = 'site-editor'),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK ((published = 1 AND published_at IS NOT NULL) OR (published = 0 AND published_at IS NULL))
);
CREATE INDEX IF NOT EXISTS editor_stories_public_order
  ON editor_stories (published, published_at DESC, updated_at DESC);

CREATE TABLE IF NOT EXISTS editor_sessions (
  token_hash TEXT PRIMARY KEY NOT NULL CHECK (length(token_hash) = 64),
  csrf_hash TEXT NOT NULL CHECK (length(csrf_hash) = 64),
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS editor_sessions_expiry ON editor_sessions (expires_at);

-- The client address is never stored directly; the Worker writes a keyed HMAC fingerprint.
-- Rows are limited to a 15-minute window and are cleaned on the next successful sign-in.
CREATE TABLE IF NOT EXISTS editor_login_attempts (
  ip_hash TEXT PRIMARY KEY NOT NULL CHECK (length(ip_hash) = 64),
  failures INTEGER NOT NULL CHECK (failures BETWEEN 1 AND 5),
  window_started_at INTEGER NOT NULL
);

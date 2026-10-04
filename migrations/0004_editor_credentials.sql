-- Persistent single-owner editor credential.
-- The Worker falls back to EDITOR_PASSWORD_HASH until the first successful sign-in,
-- then stores the validated hash here so the owner can change it from the CMS.
CREATE TABLE IF NOT EXISTS editor_credentials (
  owner TEXT PRIMARY KEY NOT NULL CHECK (owner = 'site-editor'),
  password_hash TEXT NOT NULL CHECK (length(password_hash) BETWEEN 80 AND 300),
  updated_at INTEGER NOT NULL
);

-- Anonymous story engagement for the public reading experience.
-- Reader identity is supplied by the browser and stored only as a keyed server hash.
CREATE TABLE IF NOT EXISTS story_social_actions (
  story_id TEXT NOT NULL,
  reader_hash TEXT NOT NULL CHECK (length(reader_hash) = 64),
  kind TEXT NOT NULL CHECK (kind IN ('applause', 'repost')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (story_id, reader_hash, kind)
);
CREATE INDEX IF NOT EXISTS story_social_actions_story_kind
  ON story_social_actions (story_id, kind);

CREATE TABLE IF NOT EXISTS story_responses (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36),
  story_id TEXT NOT NULL,
  reader_hash TEXT NOT NULL CHECK (length(reader_hash) = 64),
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 1200),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS story_responses_story_created
  ON story_responses (story_id, created_at DESC);
CREATE INDEX IF NOT EXISTS story_responses_reader_created
  ON story_responses (reader_hash, created_at DESC);

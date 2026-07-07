-- Migration number: 0001 	 2026-07-07T10:42:57.618Z

CREATE TABLE IF NOT EXISTS article_views (
  article_id TEXT PRIMARY KEY,
  view_count INTEGER NOT NULL DEFAULT 0
);

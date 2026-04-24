import { db } from './client.js';

await db.executeMultiple(`
  CREATE TABLE IF NOT EXISTS bookmarks (
    id            TEXT PRIMARY KEY,
    user_id       TEXT,
    url           TEXT,
    title         TEXT,
    memo          TEXT,
    tags          TEXT NOT NULL DEFAULT '[]',
    status        TEXT NOT NULL DEFAULT 'unread',
    content_type  TEXT NOT NULL DEFAULT 'other',
    thumbnail_url TEXT,
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_bookmarks_status ON bookmarks (status);
  CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks (created_at DESC);
`);

console.log('Migration completed.');
db.close();

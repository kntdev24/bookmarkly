import { Hono } from 'hono';
import { db } from '../db/client.js';
import type { Bookmark, BookmarkStatus, ContentType, CreateBookmarkInput, UpdateBookmarkInput } from '@bookmarkly/shared';

const app = new Hono();

function rowToBookmark(row: Record<string, unknown>): Bookmark {
  return {
    id: row.id as string,
    user_id: row.user_id as string | null,
    url: row.url as string | null,
    title: row.title as string | null,
    memo: row.memo as string | null,
    tags: JSON.parse((row.tags as string) ?? '[]') as string[],
    status: row.status as BookmarkStatus,
    content_type: row.content_type as ContentType,
    thumbnail_url: row.thumbnail_url as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// GET /api/bookmarks
app.get('/', async (c) => {
  const q = c.req.query('q');
  const status = c.req.query('status');

  let sql = 'SELECT * FROM bookmarks WHERE 1=1';
  const args: string[] = [];

  if (status) {
    sql += ' AND status = ?';
    args.push(status);
  }

  if (q) {
    sql += ' AND (title LIKE ? OR memo LIKE ? OR tags LIKE ?)';
    const like = `%${q}%`;
    args.push(like, like, like);
  }

  sql += ' ORDER BY created_at DESC';

  const result = await db.execute({ sql, args });
  return c.json(result.rows.map(r => rowToBookmark(r as Record<string, unknown>)));
});

// GET /api/bookmarks/:id
app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await db.execute({ sql: 'SELECT * FROM bookmarks WHERE id = ?', args: [id] });
  if (result.rows.length === 0) return c.json({ error: 'Not found' }, 404);
  return c.json(rowToBookmark(result.rows[0] as Record<string, unknown>));
});

// POST /api/bookmarks
app.post('/', async (c) => {
  const body = await c.req.json<CreateBookmarkInput>();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.execute({
    sql: `INSERT INTO bookmarks (id, user_id, url, title, memo, tags, status, content_type, thumbnail_url, created_at, updated_at)
          VALUES (?, NULL, ?, ?, ?, ?, 'unread', 'other', ?, ?, ?)`,
    args: [
      id,
      body.url ?? null,
      body.title ?? null,
      body.memo ?? null,
      JSON.stringify(body.tags ?? []),
      body.thumbnail_url ?? null,
      now,
      now,
    ],
  });

  const result = await db.execute({ sql: 'SELECT * FROM bookmarks WHERE id = ?', args: [id] });
  return c.json(rowToBookmark(result.rows[0] as Record<string, unknown>), 201);
});

// PATCH /api/bookmarks/:id
app.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<UpdateBookmarkInput>();
  const now = new Date().toISOString();

  const check = await db.execute({ sql: 'SELECT id FROM bookmarks WHERE id = ?', args: [id] });
  if (check.rows.length === 0) return c.json({ error: 'Not found' }, 404);

  const sets: string[] = ['updated_at = ?'];
  const args: (string | null)[] = [now];

  if (body.title !== undefined) { sets.push('title = ?'); args.push(body.title); }
  if (body.memo !== undefined) { sets.push('memo = ?'); args.push(body.memo); }
  if (body.tags !== undefined) { sets.push('tags = ?'); args.push(JSON.stringify(body.tags)); }
  if (body.status !== undefined) { sets.push('status = ?'); args.push(body.status); }

  args.push(id);
  await db.execute({ sql: `UPDATE bookmarks SET ${sets.join(', ')} WHERE id = ?`, args });

  const result = await db.execute({ sql: 'SELECT * FROM bookmarks WHERE id = ?', args: [id] });
  return c.json(rowToBookmark(result.rows[0] as Record<string, unknown>));
});

// DELETE /api/bookmarks/:id
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const check = await db.execute({ sql: 'SELECT id FROM bookmarks WHERE id = ?', args: [id] });
  if (check.rows.length === 0) return c.json({ error: 'Not found' }, 404);
  await db.execute({ sql: 'DELETE FROM bookmarks WHERE id = ?', args: [id] });
  return c.json({ success: true });
});

export default app;

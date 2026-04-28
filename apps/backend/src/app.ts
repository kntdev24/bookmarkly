import { Hono } from 'hono';
import { cors } from 'hono/cors';
import bookmarksRoute from './routes/bookmarks.js';
import ogpRoute from './routes/ogp.js';
import authRoute from './routes/auth.js';
import { db } from './db/client.js';

const app = new Hono();

app.use('*', cors());

app.get('/api/health', (c) => c.json({ ok: true }));

app.get('/api/health/db', async (c) => {
  try {
    await db.execute('SELECT 1');
    return c.json({ ok: true });
  } catch (err) {
    return c.json({ ok: false, error: String(err) }, 500);
  }
});

app.route('/api/auth', authRoute);
app.route('/api/bookmarks', bookmarksRoute);
app.route('/api/ogp', ogpRoute);

export { app };

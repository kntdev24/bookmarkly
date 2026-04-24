import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import bookmarksRoute from './routes/bookmarks.js';
import ogpRoute from './routes/ogp.js';
import authRoute from './routes/auth.js';

const app = new Hono();

app.use('*', cors());

app.route('/api/auth', authRoute);
app.route('/api/bookmarks', bookmarksRoute);
app.route('/api/ogp', ogpRoute);

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log('Backend running on http://localhost:3000');
});

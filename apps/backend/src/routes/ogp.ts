import { Hono } from 'hono';
import type { OgpInfo } from '@bookmarkly/shared';

const app = new Hono();

function extractMeta(html: string, property: string): string | null {
  const re = new RegExp(
    `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["']|` +
    `<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${property}["']`,
    'i'
  );
  const m = html.match(re);
  return m ? (m[1] ?? m[2] ?? null) : null;
}

// GET /api/ogp?url=
app.get('/', async (c) => {
  const url = c.req.query('url');
  if (!url) return c.json({ error: 'url is required' }, 400);

  const empty: OgpInfo = { title: null, thumbnail_url: null, domain: null };

  try {
    const parsed = new URL(url);
    const domain = parsed.hostname;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Bookmarkly/1.0)' },
    });
    clearTimeout(timeout);

    if (!res.ok) return c.json(empty);

    const html = await res.text();
    const title = extractMeta(html, 'og:title') ?? extractMeta(html, 'twitter:title');
    const thumbnail_url = extractMeta(html, 'og:image') ?? extractMeta(html, 'twitter:image');

    return c.json({ title, thumbnail_url, domain } satisfies OgpInfo);
  } catch {
    return c.json(empty);
  }
});

export default app;

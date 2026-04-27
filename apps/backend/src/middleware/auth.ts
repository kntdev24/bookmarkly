import type { Context, Next } from 'hono';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-please-change-in-production'
);

export async function authMiddleware(c: Context, next: Next) {
  const authorization = c.req.header('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = authorization.slice(7);
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    c.set('userId', payload.sub as string);
    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
}

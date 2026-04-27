import { Hono } from 'hono';
import { hash, compare } from 'bcryptjs';
import { SignJWT } from 'jose';
import { db } from '../db/client.js';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-please-change-in-production'
);

const app = new Hono();

// POST /api/auth/register
app.post('/register', async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>();
  if (!email || !password) return c.json({ error: 'email and password are required' }, 400);
  if (password.length < 8) return c.json({ error: 'Password must be at least 8 characters' }, 400);

  const existing = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
  if (existing.rows.length > 0) return c.json({ error: 'Email already registered' }, 409);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const password_hash = await hash(password, 10);

  await db.execute({
    sql: 'INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    args: [id, email, password_hash, now, now],
  });

  const token = await new SignJWT({ sub: id, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(JWT_SECRET);

  return c.json({ token, user: { id, email } }, 201);
});

// POST /api/auth/login
app.post('/login', async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>();
  if (!email || !password) return c.json({ error: 'email and password are required' }, 400);

  const result = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
  if (result.rows.length === 0) return c.json({ error: 'Invalid credentials' }, 401);

  const user = result.rows[0] as Record<string, unknown>;
  const valid = await compare(password, user.password_hash as string);
  if (!valid) return c.json({ error: 'Invalid credentials' }, 401);

  const token = await new SignJWT({ sub: user.id as string, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(JWT_SECRET);

  return c.json({ token, user: { id: user.id, email: user.email } });
});

export default app;

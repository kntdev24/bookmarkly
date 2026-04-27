import type { AuthUser } from '../stores/auth.js';

const BASE = '/api/auth';

export async function register(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json() as { token?: string; user?: AuthUser; error?: string };
  if (!res.ok) throw new Error(data.error ?? '登録に失敗しました');
  return data as { token: string; user: AuthUser };
}

export async function login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json() as { token?: string; user?: AuthUser; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'ログインに失敗しました');
  return data as { token: string; user: AuthUser };
}

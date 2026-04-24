import type { Bookmark, CreateBookmarkInput, UpdateBookmarkInput } from '../../../../packages/shared/types.js';

const BASE = '/api/bookmarks';

export async function listBookmarks(params?: { q?: string; status?: string }): Promise<Bookmark[]> {
  const query = new URLSearchParams();
  if (params?.q) query.set('q', params.q);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  const res = await fetch(`${BASE}${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch bookmarks');
  return res.json() as Promise<Bookmark[]>;
}

export async function getBookmark(id: string): Promise<Bookmark> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Not found');
  return res.json() as Promise<Bookmark>;
}

export async function createBookmark(input: CreateBookmarkInput): Promise<Bookmark> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create bookmark');
  return res.json() as Promise<Bookmark>;
}

export async function updateBookmark(id: string, input: UpdateBookmarkInput): Promise<Bookmark> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to update bookmark');
  return res.json() as Promise<Bookmark>;
}

export async function deleteBookmark(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete bookmark');
}

import type { OgpInfo } from '../../../../packages/shared/types.js';

export async function fetchOgp(url: string): Promise<OgpInfo> {
  const res = await fetch(`/api/ogp?url=${encodeURIComponent(url)}`);
  if (!res.ok) return { title: null, thumbnail_url: null, domain: null };
  return res.json() as Promise<OgpInfo>;
}

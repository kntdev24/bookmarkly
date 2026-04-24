import Anthropic from '@anthropic-ai/sdk';
import type { ContentType } from '@bookmarkly/shared';
import { db } from '../db/client.js';

const client = new Anthropic();

export async function tagBookmark(id: string, url: string | null, title: string | null, memo: string | null) {
  if (!process.env.ANTHROPIC_API_KEY) return;

  try {
    const domain = url ? new URL(url).hostname : null;
    const input = [
      domain && `ドメイン: ${domain}`,
      title && `タイトル: ${title}`,
      memo && `メモ: ${memo}`,
    ].filter(Boolean).join('\n');

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `以下のウェブページ情報からタグと種別を判定してください。

${input}

次のJSON形式で返してください（他のテキストは不要）:
{"tags": ["タグ1", "タグ2"], "content_type": "article"}

content_type の選択肢: article, news, book, product, memo, other
tagsは最大5件の日本語または英語の短いキーワード。`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    const json = JSON.parse(text) as { tags?: string[]; content_type?: ContentType };

    const tags = Array.isArray(json.tags) ? json.tags.slice(0, 5) : [];
    const content_type = json.content_type ?? 'other';
    const now = new Date().toISOString();

    await db.execute({
      sql: 'UPDATE bookmarks SET tags = ?, content_type = ?, updated_at = ? WHERE id = ?',
      args: [JSON.stringify(tags), content_type, now, id],
    });
  } catch {
    // タグ付けは非同期でサイレントに失敗させる
  }
}

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { createBookmark } from '../api/bookmarks.js';
import { fetchOgp } from '../api/ogp.js';
import type { OgpInfo } from '../../../../packages/shared/types.js';

const router = useRouter();
const text = ref('');
const ogp = ref<OgpInfo | null>(null);
const ogpLoading = ref(false);
const submitting = ref(false);
const error = ref('');

const URL_RE = /https?:\/\/[^\s]+/;
const TAG_RE = /#([\w぀-ヿ一-鿿０-９ａ-ｚＡ-Ｚ]+)/g;

let ogpTimer: ReturnType<typeof setTimeout> | null = null;
let lastFetchedUrl = '';

function extractTags(val: string): string[] {
  const found: string[] = [];
  let m: RegExpExecArray | null;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(val)) !== null) found.push(m[1]);
  return [...new Set(found)];
}

function extractUrl(val: string): string | null {
  const m = val.match(URL_RE);
  return m ? m[0] : null;
}

function removeTag(tag: string) {
  const re = new RegExp(`\\s?#${tag}(?=[\\s,、。！？]|$)`, 'g');
  text.value = text.value.replace(re, '').trimEnd();
}

watch(text, async (val) => {
  const url = extractUrl(val);
  if (!url || url === lastFetchedUrl || ogp.value) return;

  if (ogpTimer) clearTimeout(ogpTimer);
  ogpTimer = setTimeout(async () => {
    if (!extractUrl(text.value)) return;
    ogpLoading.value = true;
    try {
      ogp.value = await fetchOgp(url);
      lastFetchedUrl = url;
    } finally {
      ogpLoading.value = false;
    }
  }, 800);
});

async function submit() {
  const val = text.value.trim();
  if (!val) return;

  submitting.value = true;
  error.value = '';
  try {
    const url = extractUrl(val) ?? undefined;
    const tags = extractTags(val);
    const memo = val
      .replace(URL_RE, '')
      .replace(TAG_RE, '')
      .trim() || undefined;

    await createBookmark({
      url,
      title: ogp.value?.title ?? undefined,
      thumbnail_url: ogp.value?.thumbnail_url ?? undefined,
      memo,
      tags,
    });
    router.push('/');
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登録に失敗しました';
  } finally {
    submitting.value = false;
  }
}

function cancel() {
  router.back();
}
</script>

<template>
  <div class="page-content">
    <h1 class="page-title">ブックマークを追加</h1>

    <div class="entry-card">
      <div class="entry-textarea-wrap">
        <textarea
          v-model="text"
          class="entry-textarea"
          placeholder="URLやメモを入力...

例）https://zenn.dev/...
あとで読む #Vue.js #設計"
          autofocus
        ></textarea>
      </div>

      <!-- OGP loading -->
      <div v-if="ogpLoading" class="ogp-loading">
        <span class="material-symbols-outlined spinning" style="font-size:16px">progress_activity</span>
        URLの情報を取得中...
      </div>

      <!-- OGP preview -->
      <div v-if="ogp && !ogpLoading" class="ogp-preview">
        <img v-if="ogp.thumbnail_url" class="ogp-thumbnail" :src="ogp.thumbnail_url" alt="" />
        <div v-else class="ogp-thumbnail-placeholder">
          <span class="material-symbols-outlined">link</span>
        </div>
        <div class="ogp-info">
          <div class="ogp-title">{{ ogp.title ?? extractUrl(text) }}</div>
          <div class="ogp-domain">{{ ogp.domain }}</div>
        </div>
        <button class="ogp-remove" @click="ogp = null">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Tags -->
      <div v-if="extractTags(text).length > 0" class="tag-area">
        <span class="tag-area-label">タグ</span>
        <span v-for="tag in extractTags(text)" :key="tag" class="tag-pill-entry">
          {{ tag }}
          <button class="tag-pill-remove" @click="removeTag(tag)">
            <span class="material-symbols-outlined">close</span>
          </button>
        </span>
      </div>

      <div class="entry-toolbar">
        <span class="toolbar-hint">
          <span class="material-symbols-outlined">tag</span>
          <code>#キーワード</code> でタグを追加
        </span>
      </div>
    </div>

    <div v-if="error" class="error-msg">{{ error }}</div>

    <div class="entry-actions">
      <button class="btn btn-outlined" @click="cancel">キャンセル</button>
      <button class="btn btn-filled" :disabled="!text.trim() || submitting" @click="submit">
        {{ submitting ? '追加中...' : '追加する' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.page-content {
  padding: 32px 24px;
  max-width: 680px;
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
}

.entry-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.entry-textarea-wrap {
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
}

.entry-textarea {
  width: 100%;
  min-height: 120px;
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-default);
  background: transparent;
}
.entry-textarea::placeholder { color: var(--text-secondary); }

.ogp-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  font-size: 13px;
  color: var(--text-secondary);
}

.ogp-preview {
  display: flex;
  margin: 0 16px 16px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.ogp-thumbnail {
  width: 80px; height: 80px;
  object-fit: cover; flex-shrink: 0;
  background: var(--bg-secondary);
}

.ogp-thumbnail-placeholder {
  width: 80px; height: 80px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-secondary);
}

.ogp-info {
  padding: 10px 16px;
  display: flex; flex-direction: column; gap: 4px;
  justify-content: center; min-width: 0;
}

.ogp-title {
  font-size: 13px; font-weight: 700; color: var(--text-default);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.ogp-domain { font-size: 12px; color: var(--text-secondary); }

.ogp-remove {
  margin-left: auto; margin-right: 8px; align-self: flex-start; margin-top: 8px;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  border: none; background: transparent;
  border-radius: var(--radius-full); color: var(--text-secondary); flex-shrink: 0;
  transition: background 0.15s;
}
.ogp-remove:hover { background: var(--bg-secondary); }
.ogp-remove .material-symbols-outlined { font-size: 16px; }

.tag-area {
  display: flex; align-items: center; flex-wrap: wrap;
  gap: 4px; padding: 10px 16px;
  border-top: 1px solid var(--border-light);
}

.tag-area-label {
  font-size: 12px; color: var(--text-secondary); margin-right: 4px; flex-shrink: 0;
}

.tag-pill-entry {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px 3px 12px;
  background: var(--bg-brand-secondary);
  border: 1px solid var(--brand-lightest);
  border-radius: var(--radius-full);
  font-size: 12px; color: var(--text-brand); font-weight: 700;
}

.tag-pill-remove {
  display: flex; align-items: center; justify-content: center;
  width: 16px; height: 16px;
  border: none; background: transparent;
  color: var(--text-brand); padding: 0; border-radius: 50%;
  opacity: 0.7; transition: opacity 0.15s;
}
.tag-pill-remove:hover { opacity: 1; }
.tag-pill-remove .material-symbols-outlined { font-size: 14px; }

.entry-toolbar {
  display: flex; align-items: center;
  padding: 10px 16px; gap: 8px;
  border-top: 1px solid var(--border-light);
}

.toolbar-hint {
  font-size: 12px; color: var(--text-secondary);
  display: flex; align-items: center; gap: 4px;
}
.toolbar-hint .material-symbols-outlined { font-size: 14px; }
.toolbar-hint code {
  background: var(--bg-secondary); padding: 1px 5px;
  border-radius: var(--radius-xs); font-family: monospace;
  font-size: 11px; color: var(--text-brand);
}

.error-msg { margin-top: 12px; color: var(--text-negative); font-size: 13px; }

.entry-actions {
  display: flex; justify-content: flex-end;
  gap: 8px; margin-top: 16px;
}

.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .page-content { padding: 16px; padding-bottom: 72px; }
  .page-title { display: none; }
  .entry-actions {
    position: fixed; bottom: 0; left: 0; right: 0;
    margin: 0; padding: 8px 16px;
    background: var(--bg-primary);
    border-top: 1px solid var(--border-light);
    justify-content: stretch;
  }
  .entry-actions .btn { flex: 1; }
}
</style>

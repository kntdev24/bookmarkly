<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import BookmarkCard from '../components/BookmarkCard.vue';
import { listBookmarks, updateBookmark } from '../api/bookmarks.js';
import type { Bookmark, ContentType } from '../../../../packages/shared/types.js';

const bookmarks = ref<Bookmark[]>([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const statusFilter = ref('');
const contentTypeFilter = ref('');
const tagFilter = ref('');

const CONTENT_TYPE_LABELS: Record<string, string> = {
  article: '記事',
  news: 'ニュース',
  book: '本',
  product: '商品',
  memo: 'メモ',
  other: 'その他',
};

let searchTimer: ReturnType<typeof setTimeout> | null = null;

function currentParams() {
  return {
    q: searchQuery.value || undefined,
    status: statusFilter.value || undefined,
    content_type: contentTypeFilter.value || undefined,
    tag: tagFilter.value || undefined,
  };
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    bookmarks.value = await listBookmarks(currentParams());
  } catch (e) {
    error.value = e instanceof Error ? e.message : '読み込みに失敗しました';
  } finally {
    loading.value = false;
  }
}

watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(load, 300);
});

watch([statusFilter, contentTypeFilter, tagFilter], load);

async function markRead(id: string) {
  try {
    const updated = await updateBookmark(id, { status: 'read' });
    const idx = bookmarks.value.findIndex(b => b.id === id);
    if (idx !== -1) bookmarks.value[idx] = updated;
  } catch { /* ignore */ }
}

function filterByTag(tag: string) {
  tagFilter.value = tagFilter.value === tag ? '' : tag;
}

const totalCount = computed(() => bookmarks.value.length);

const allTags = computed(() => {
  const set = new Set<string>();
  for (const b of bookmarks.value) {
    for (const t of b.tags) set.add(t);
  }
  return [...set].sort();
});

onMounted(load);
</script>

<template>
  <div class="page-content">
    <h1 class="page-title">ブックマーク</h1>

    <!-- 検索 -->
    <div class="toolbar">
      <div class="search-wrap">
        <span class="material-symbols-outlined search-icon">search</span>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="タイトル・メモ・タグで検索..."
        />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- ステータスフィルタ -->
      <div class="filter-tabs">
        <button class="filter-tab" :class="{ active: statusFilter === '' }" @click="statusFilter = ''">すべて</button>
        <button class="filter-tab" :class="{ active: statusFilter === 'unread' }" @click="statusFilter = 'unread'">未読</button>
        <button class="filter-tab" :class="{ active: statusFilter === 'read' }" @click="statusFilter = 'read'">既読</button>
      </div>

      <!-- コンテンツ種別フィルタ -->
      <div class="filter-tabs">
        <button class="filter-tab" :class="{ active: contentTypeFilter === '' }" @click="contentTypeFilter = ''">すべての種別</button>
        <button
          v-for="(label, type) in CONTENT_TYPE_LABELS"
          :key="type"
          class="filter-tab"
          :class="{ active: contentTypeFilter === type }"
          @click="contentTypeFilter = contentTypeFilter === type ? '' : (type as ContentType)"
        >{{ label }}</button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <span class="material-symbols-outlined spinning">progress_activity</span>
      読み込み中...
    </div>

    <div v-else-if="error" class="error-state">{{ error }}</div>

    <template v-else>
      <!-- タグフィルタ -->
      <div v-if="allTags.length > 0" class="tag-filters">
        <button
          v-for="tag in allTags"
          :key="tag"
          class="tag-chip"
          :class="{ active: tagFilter === tag }"
          @click="filterByTag(tag)"
        >#{{ tag }}</button>
      </div>

      <div class="list-meta">{{ totalCount }}件</div>

      <div v-if="bookmarks.length === 0" class="empty-state">
        ブックマークが見つかりませんでした
      </div>

      <div v-else class="bookmark-list">
        <BookmarkCard
          v-for="b in bookmarks"
          :key="b.id"
          :bookmark="b"
          @mark-read="markRead"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-content {
  padding: 32px 24px;
  max-width: 860px;
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 18px;
  color: var(--text-secondary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 42px;
  padding: 0 40px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  font-family: inherit;
  font-size: 14px;
  color: var(--text-default);
  background: var(--bg-primary);
  outline: none;
  transition: border-color 0.15s;
}
.search-input:focus { border-color: var(--border-brand); }

.search-clear {
  position: absolute; right: 8px;
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border: none; background: transparent;
  border-radius: var(--radius-full); color: var(--text-secondary);
  transition: background 0.15s;
}
.search-clear:hover { background: var(--bg-secondary); }
.search-clear .material-symbols-outlined { font-size: 16px; }

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.filter-tab {
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 700;
  background: var(--bg-primary);
  color: var(--text-secondary);
  transition: all 0.15s;
  white-space: nowrap;
}
.filter-tab:hover { border-color: var(--border-bold); }
.filter-tab.active {
  background: var(--brand);
  color: var(--text-contrast);
  border-color: var(--brand);
}

.tag-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.tag-chip {
  height: 26px;
  padding: 0 10px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 700;
  background: var(--bg-primary);
  color: var(--text-secondary);
  transition: all 0.15s;
}
.tag-chip:hover { border-color: var(--border-brand); color: var(--brand); }
.tag-chip.active {
  background: var(--brand-light, #fce4ec);
  color: var(--brand);
  border-color: var(--brand);
}

.list-meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.bookmark-list { display: flex; flex-direction: column; gap: 8px; }

.loading-state, .error-state, .empty-state {
  display: flex; align-items: center; gap: 8px;
  color: var(--text-secondary); padding: 32px 0;
}

.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .page-content { padding: 16px; padding-bottom: 80px; }
  .page-title { font-size: 20px; margin-bottom: 16px; }
  .bookmark-list { gap: 4px; }
}
</style>

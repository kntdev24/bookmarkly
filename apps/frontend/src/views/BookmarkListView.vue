<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import BookmarkCard from '../components/BookmarkCard.vue';
import { listBookmarks, updateBookmark } from '../api/bookmarks.js';
import type { Bookmark } from '../../../../packages/shared/types.js';

const bookmarks = ref<Bookmark[]>([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const statusFilter = ref('');

let searchTimer: ReturnType<typeof setTimeout> | null = null;

async function load(q?: string, status?: string) {
  loading.value = true;
  error.value = '';
  try {
    bookmarks.value = await listBookmarks({
      q: q || undefined,
      status: status || undefined,
    });
  } catch (e) {
    error.value = e instanceof Error ? e.message : '読み込みに失敗しました';
  } finally {
    loading.value = false;
  }
}

watch(searchQuery, (val) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => load(val, statusFilter.value), 300);
});

watch(statusFilter, (val) => {
  load(searchQuery.value, val);
});

async function markRead(id: string) {
  try {
    const updated = await updateBookmark(id, { status: 'read' });
    const idx = bookmarks.value.findIndex(b => b.id === id);
    if (idx !== -1) bookmarks.value[idx] = updated;
  } catch { /* ignore */ }
}

const totalCount = computed(() => bookmarks.value.length);

onMounted(() => load());
</script>

<template>
  <div class="page-content">
    <h1 class="page-title">ブックマーク</h1>

    <!-- 検索・フィルタ -->
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

      <div class="filter-tabs">
        <button
          class="filter-tab"
          :class="{ active: statusFilter === '' }"
          @click="statusFilter = ''"
        >すべて</button>
        <button
          class="filter-tab"
          :class="{ active: statusFilter === 'unread' }"
          @click="statusFilter = 'unread'"
        >未読</button>
        <button
          class="filter-tab"
          :class="{ active: statusFilter === 'read' }"
          @click="statusFilter = 'read'"
        >既読</button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <span class="material-symbols-outlined spinning">progress_activity</span>
      読み込み中...
    </div>

    <div v-else-if="error" class="error-state">{{ error }}</div>

    <template v-else>
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
  gap: 4px;
}

.filter-tab {
  height: 32px;
  padding: 0 16px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 700;
  background: var(--bg-primary);
  color: var(--text-secondary);
  transition: all 0.15s;
}
.filter-tab:hover { border-color: var(--border-bold); }
.filter-tab.active {
  background: var(--brand);
  color: var(--text-contrast);
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

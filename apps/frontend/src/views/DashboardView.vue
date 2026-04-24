<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BookmarkCard from '../components/BookmarkCard.vue';
import { listBookmarks, updateBookmark } from '../api/bookmarks.js';
import type { Bookmark } from '../../../../packages/shared/types.js';

const router = useRouter();
const bookmarks = ref<Bookmark[]>([]);
const loading = ref(true);
const error = ref('');

const unreadBookmarks = computed(() => bookmarks.value.filter(b => b.status === 'unread'));
const recentBookmarks = computed(() => bookmarks.value.slice(0, 10));

async function load() {
  try {
    bookmarks.value = await listBookmarks();
  } catch (e) {
    error.value = e instanceof Error ? e.message : '読み込みに失敗しました';
  } finally {
    loading.value = false;
  }
}

function getDomain(url: string | null): string {
  if (!url) return 'テキストメモ';
  try { return new URL(url).hostname; } catch { return ''; }
}

async function markRead(id: string) {
  const bookmark = bookmarks.value.find(b => b.id === id);
  if (!bookmark) return;
  try {
    const updated = await updateBookmark(id, { status: 'read' });
    const idx = bookmarks.value.findIndex(b => b.id === id);
    if (idx !== -1) bookmarks.value[idx] = updated;
  } catch { /* ignore */ }
}

onMounted(load);
</script>

<template>
  <div class="page-content">
    <h1 class="page-title">ダッシュボード</h1>

    <div v-if="loading" class="loading-state">
      <span class="material-symbols-outlined spinning">progress_activity</span>
      読み込み中...
    </div>

    <div v-else-if="error" class="error-state">{{ error }}</div>

    <template v-else>
      <!-- 未読セクション -->
      <section class="section">
        <div class="section-header">
          <span class="section-title">未読</span>
          <span class="section-count">{{ unreadBookmarks.length }}</span>
          <RouterLink class="section-link" to="/bookmarks">
            すべて見る
            <span class="material-symbols-outlined">chevron_right</span>
          </RouterLink>
        </div>

        <div v-if="unreadBookmarks.length === 0" class="empty-state">
          未読のブックマークはありません
        </div>

        <div v-else class="carousel-wrap">
          <div
            v-for="b in unreadBookmarks"
            :key="b.id"
            class="unread-card"
            @click="router.push(`/bookmarks/${b.id}`)"
          >
            <div class="unread-card-thumbnail">
              <img v-if="b.thumbnail_url" :src="b.thumbnail_url" :alt="b.title ?? ''" />
              <span v-else class="material-symbols-outlined">{{ b.url ? 'article' : 'notes' }}</span>
            </div>
            <div class="unread-card-body">
              <div class="unread-card-title">{{ b.title || b.url || '(無題)' }}</div>
              <div class="unread-card-domain">{{ getDomain(b.url) }}</div>
              <div class="unread-card-footer">
                <div class="unread-card-tags">
                  <span v-for="tag in b.tags.slice(0, 2)" :key="tag" class="tag-pill-sm">{{ tag }}</span>
                </div>
                <button class="mark-read-btn" title="既読にする" @click.stop="markRead(b.id)">
                  <span class="material-symbols-outlined">check_circle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 最近追加セクション -->
      <section class="section">
        <div class="section-header">
          <span class="section-title">最近追加</span>
          <RouterLink class="section-link" to="/bookmarks">
            すべて見る
            <span class="material-symbols-outlined">chevron_right</span>
          </RouterLink>
        </div>

        <div v-if="recentBookmarks.length === 0" class="empty-state">
          ブックマークがまだありません。
          <RouterLink to="/bookmarks/entry">最初のブックマークを追加</RouterLink>してみましょう。
        </div>

        <div v-else class="recent-list">
          <BookmarkCard
            v-for="b in recentBookmarks"
            :key="b.id"
            :bookmark="b"
            @mark-read="markRead"
          />
        </div>
      </section>
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

.section { margin-bottom: 32px; }

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-title { font-size: 16px; font-weight: 700; }

.section-count {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  background: var(--brand);
  color: var(--text-contrast);
  font-size: 11px;
  font-weight: 700;
  border-radius: var(--radius-full);
}

.section-link {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-brand);
  display: flex;
  align-items: center;
  gap: 2px;
  font-weight: 700;
}
.section-link:hover { text-decoration: underline; }
.section-link .material-symbols-outlined { font-size: 14px; }

/* carousel */
.carousel-wrap {
  margin-right: calc(-1 * 24px);
  padding-right: 24px;
  padding-bottom: 8px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  display: flex;
  gap: 16px;
}
.carousel-wrap::-webkit-scrollbar { display: none; }

.unread-card {
  flex-shrink: 0;
  width: 220px;
  background: var(--bg-brand-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: border-color 0.15s;
}
.unread-card:hover { border-color: var(--border-bold); }

.unread-card-thumbnail {
  width: 100%; height: 110px;
  object-fit: cover;
  background: var(--bg-secondary);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.unread-card-thumbnail img { width: 100%; height: 100%; object-fit: cover; }
.unread-card-thumbnail .material-symbols-outlined { font-size: 36px; color: var(--text-secondary); }

.unread-card-body {
  padding: 10px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.unread-card-title {
  font-size: 13px; font-weight: 700; line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.unread-card-domain { font-size: 11px; color: var(--text-secondary); }

.unread-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: auto; padding-top: 6px;
}

.unread-card-tags { display: flex; gap: 4px; overflow: hidden; }

.tag-pill-sm {
  display: inline-flex; align-items: center;
  padding: 1px 7px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  font-size: 10px; color: var(--text-secondary);
  background: var(--bg-primary); white-space: nowrap;
}

.mark-read-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  border: none; background: transparent;
  border-radius: var(--radius-full);
  color: var(--brand); flex-shrink: 0;
  transition: background 0.15s;
}
.mark-read-btn:hover { background: var(--bg-secondary); }
.mark-read-btn .material-symbols-outlined { font-size: 20px; }

.recent-list { display: flex; flex-direction: column; gap: 8px; }

.loading-state, .error-state, .empty-state {
  display: flex; align-items: center; gap: 8px;
  color: var(--text-secondary); padding: 32px 0;
}

.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .page-content { padding: 16px; padding-bottom: 80px; }
  .page-title { font-size: 20px; margin-bottom: 16px; }
  .carousel-wrap {
    margin-right: calc(-1 * 16px);
    padding-right: 16px;
  }
  .unread-card { width: 180px; }
  .unread-card-thumbnail { height: 90px; }
  .recent-list { gap: 4px; }
}
</style>

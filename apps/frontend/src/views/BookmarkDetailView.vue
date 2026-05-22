<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getBookmark, updateBookmark, deleteBookmark } from '../api/bookmarks.js';
import type { Bookmark, BookmarkStatus } from '../../../../packages/shared/types.js';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

const bookmark = ref<Bookmark | null>(null);
const loading = ref(true);
const error = ref('');
const saving = ref(false);
const deleting = ref(false);
const showDeleteConfirm = ref(false);

// edit form state
const editTitle = ref('');
const editMemo = ref('');
const editTagsText = ref('');

const domain = computed(() => {
  if (!bookmark.value?.url) return null;
  try { return new URL(bookmark.value.url).hostname; } catch { return null; }
});

async function load() {
  try {
    const b = await getBookmark(id);
    bookmark.value = b;
    editTitle.value = b.title ?? '';
    editMemo.value = b.memo ?? '';
    editTagsText.value = b.tags.join(' ');
  } catch (e) {
    error.value = e instanceof Error ? e.message : '読み込みに失敗しました';
  } finally {
    loading.value = false;
  }
}

async function save() {
  if (!bookmark.value) return;
  saving.value = true;
  try {
    const tags = editTagsText.value.split(/[\s,、]+/).map(t => t.replace(/^#/, '').trim()).filter(Boolean);
    bookmark.value = await updateBookmark(id, {
      title: editTitle.value || null,
      memo: editMemo.value || null,
      tags,
    });
  } catch { /* ignore */ } finally {
    saving.value = false;
  }
}

async function changeStatus(status: BookmarkStatus) {
  if (!bookmark.value) return;
  bookmark.value = await updateBookmark(id, { status });
}

async function confirmDelete() {
  deleting.value = true;
  try {
    await deleteBookmark(id);
    router.push('/');
  } catch { /* ignore */ } finally {
    deleting.value = false;
  }
}

const formattedDate = computed(() => {
  if (!bookmark.value) return '';
  const d = new Date(bookmark.value.created_at);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
});

const statusLabel: Record<BookmarkStatus, string> = {
  unread: '未読',
  read: '既読',
  archived: 'アーカイブ',
};

onMounted(load);
</script>

<template>
  <div class="page-content">
    <div v-if="loading" class="loading-state">
      <span class="material-symbols-outlined spinning">progress_activity</span>
      読み込み中...
    </div>

    <div v-else-if="error" class="error-state">{{ error }}</div>

    <template v-else-if="bookmark">
      <!-- header -->
      <div class="detail-header">
        <button class="back-btn" @click="router.back()">
          <span class="material-symbols-outlined">arrow_back</span>
          一覧に戻る
        </button>
        <div class="status-badge" :class="bookmark.status">
          {{ statusLabel[bookmark.status] }}
        </div>
      </div>

      <!-- main card -->
      <div class="detail-card">
        <!-- thumbnail -->
        <div v-if="bookmark.thumbnail_url" class="detail-thumbnail">
          <img :src="bookmark.thumbnail_url" :alt="bookmark.title ?? ''" />
        </div>

        <!-- content -->
        <div class="detail-body">
          <!-- URL -->
          <div v-if="bookmark.url" class="detail-url">
            <span class="material-symbols-outlined">link</span>
            <a :href="bookmark.url" target="_blank" rel="noopener noreferrer">
              {{ bookmark.url }}
            </a>
          </div>

          <!-- title -->
          <div class="form-group">
            <label class="form-label">タイトル</label>
            <input v-model="editTitle" type="text" class="form-input" placeholder="タイトルを入力" />
          </div>

          <!-- memo -->
          <div class="form-group">
            <label class="form-label">メモ</label>
            <textarea v-model="editMemo" class="form-textarea" placeholder="メモを入力"></textarea>
          </div>

          <!-- tags -->
          <div class="form-group">
            <label class="form-label">タグ（スペース区切り）</label>
            <input v-model="editTagsText" type="text" class="form-input" placeholder="Vue.js 設計 読書" />
          </div>

          <div class="detail-meta">登録日: {{ formattedDate }}</div>

          <!-- save button -->
          <button class="btn btn-filled save-btn" :disabled="saving" @click="save">
            {{ saving ? '保存中...' : '保存する' }}
          </button>
        </div>
      </div>

      <!-- status actions -->
      <div class="action-card">
        <div class="action-card-title">ステータスを変更</div>
        <div class="action-btns">
          <button
            class="btn btn-outlined"
            :class="{ active: bookmark.status === 'unread' }"
            :disabled="bookmark.status === 'unread'"
            @click="changeStatus('unread')"
          >未読</button>
          <button
            class="btn btn-outlined"
            :class="{ active: bookmark.status === 'read' }"
            :disabled="bookmark.status === 'read'"
            @click="changeStatus('read')"
          >既読</button>
          <button
            class="btn btn-outlined"
            :class="{ active: bookmark.status === 'archived' }"
            :disabled="bookmark.status === 'archived'"
            @click="changeStatus('archived')"
          >アーカイブ</button>
        </div>
      </div>

      <!-- delete -->
      <div class="danger-zone">
        <button v-if="!showDeleteConfirm" class="btn-delete" @click="showDeleteConfirm = true">
          <span class="material-symbols-outlined">delete</span>
          削除する
        </button>
        <div v-else class="delete-confirm">
          <span>本当に削除しますか？</span>
          <button class="btn btn-outlined" @click="showDeleteConfirm = false">キャンセル</button>
          <button class="btn btn-danger" :disabled="deleting" @click="confirmDelete">
            {{ deleting ? '削除中...' : '削除する' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-content {
  padding: 32px 24px;
  max-width: 680px;
  width: 100%;
}

.loading-state, .error-state {
  display: flex; align-items: center; gap: 8px;
  color: var(--text-secondary); padding: 32px 0;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.back-btn {
  display: flex; align-items: center; gap: 4px;
  border: none; background: transparent;
  color: var(--text-brand); font-size: 14px; font-weight: 700;
  transition: opacity 0.15s;
}
.back-btn:hover { opacity: 0.7; }
.back-btn .material-symbols-outlined { font-size: 18px; }

.status-badge {
  display: inline-flex; align-items: center;
  padding: 3px 12px;
  border-radius: var(--radius-full);
  font-size: 12px; font-weight: 700;
}
.status-badge.unread { background: var(--bg-brand-secondary); color: var(--text-brand); }
.status-badge.read { background: var(--bg-secondary); color: var(--text-secondary); }
.status-badge.archived { background: var(--bg-secondary); color: var(--text-secondary); }

.detail-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 16px;
}

.detail-thumbnail img {
  width: 100%; max-height: 200px; object-fit: cover;
}

.detail-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }

.detail-url {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--text-brand);
}
.detail-url .material-symbols-outlined { font-size: 16px; flex-shrink: 0; }
.detail-url a { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.detail-url a:hover { text-decoration: underline; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 12px; font-weight: 700; color: var(--text-secondary); }

.form-input, .form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-family: inherit; font-size: 14px; color: var(--text-default);
  background: var(--bg-primary); outline: none;
  transition: border-color 0.15s;
}
.form-input:focus, .form-textarea:focus { border-color: var(--border-brand); }

.form-textarea { min-height: 100px; resize: vertical; line-height: 1.6; }

.detail-meta { font-size: 12px; color: var(--text-secondary); }

.save-btn { align-self: flex-end; }

.action-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 20px;
  margin-bottom: 16px;
}
.action-card-title { font-size: 14px; font-weight: 700; margin-bottom: 12px; }
.action-btns { display: flex; gap: 8px; }
.action-btns .btn.active {
  background: var(--brand); color: var(--text-contrast); border-color: var(--brand);
}

.danger-zone { padding: 8px 0; }

.btn-delete {
  display: flex; align-items: center; gap: 4px;
  border: none; background: transparent;
  color: var(--text-negative); font-size: 14px;
  transition: opacity 0.15s;
}
.btn-delete:hover { opacity: 0.7; }
.btn-delete .material-symbols-outlined { font-size: 18px; }

.delete-confirm {
  display: flex; align-items: center; gap: 8px;
  flex-wrap: wrap;
}
.delete-confirm span { font-size: 14px; color: var(--text-negative); }

.btn-danger {
  display: inline-flex; align-items: center; justify-content: center;
  height: 42px; padding: 0 24px;
  border-radius: var(--radius-full);
  font-size: 14px; font-weight: 700;
  background: var(--text-negative); color: var(--text-contrast);
  border: 2px solid var(--text-negative);
  transition: opacity 0.15s;
}
.btn-danger:hover:not(:disabled) { opacity: 0.8; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .page-content { padding: 16px; padding-bottom: 80px; }
}
</style>

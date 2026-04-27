<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Bookmark } from '../../../../packages/shared/types.js';

const props = defineProps<{
  bookmark: Bookmark;
}>();

const emit = defineEmits<{
  markRead: [id: string];
}>();

const router = useRouter();

const domain = computed(() => {
  if (!props.bookmark.url) return 'テキストメモ';
  try { return new URL(props.bookmark.url).hostname; } catch { return ''; }
});

const formattedDate = computed(() => {
  const d = new Date(props.bookmark.created_at);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
});

function onCardClick() {
  router.push(`/bookmarks/${props.bookmark.id}`);
}

function onMarkRead(e: Event) {
  e.stopPropagation();
  emit('markRead', props.bookmark.id);
}
</script>

<template>
  <div class="bookmark-card" :class="bookmark.status" @click="onCardClick">
    <div class="card-body">
      <div class="card-thumbnail">
        <img v-if="bookmark.thumbnail_url" :src="bookmark.thumbnail_url" :alt="bookmark.title ?? ''" />
        <span v-else class="material-symbols-outlined">
          {{ bookmark.url ? 'article' : 'notes' }}
        </span>
      </div>
      <div class="card-info">
        <div class="card-title">{{ bookmark.title || bookmark.url || '(無題)' }}</div>
        <div class="card-domain">{{ domain }}</div>
        <div v-if="bookmark.memo" class="card-memo">{{ bookmark.memo }}</div>
        <div class="card-footer">
          <span v-for="tag in bookmark.tags" :key="tag" class="tag-pill">{{ tag }}</span>
          <span class="card-date">{{ formattedDate }}</span>
        </div>
      </div>
    </div>
    <div class="card-actions">
      <button
        v-if="bookmark.status === 'unread'"
        class="card-action-btn mark-read"
        title="既読にする"
        @click="onMarkRead"
      >
        <span class="material-symbols-outlined">check_circle</span>
      </button>
      <button class="card-action-btn" title="詳細を見る" @click.stop="onCardClick">
        <span class="material-symbols-outlined">more_vert</span>
      </button>
    </div>
  </div>
</template>

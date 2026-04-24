<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useSidebar } from '../composables/useSidebar.js';
import { currentUser, clearAuth } from '../stores/auth.js';

const router = useRouter();
const { isOpen, close } = useSidebar();

function goToEntry() {
  close();
  router.push('/bookmarks/entry');
}

function logout() {
  clearAuth();
  close();
  router.push('/login');
}
</script>

<template>
  <!-- Drawer overlay -->
  <div class="drawer-overlay" :class="{ open: isOpen }" @click="close"></div>

  <!-- Sidebar -->
  <aside class="sidebar" :class="{ open: isOpen }">
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">
        <span class="material-symbols-outlined" style="font-size:18px">bookmark</span>
      </div>
      <span class="sidebar-logo-text">bookmarkly</span>
    </div>
    <nav class="sidebar-nav">
      <RouterLink class="nav-item" to="/" @click="close">
        <span class="material-symbols-outlined">dashboard</span>
        ダッシュボード
      </RouterLink>
      <RouterLink class="nav-item" to="/bookmarks" @click="close">
        <span class="material-symbols-outlined">bookmarks</span>
        ブックマーク
      </RouterLink>
    </nav>
    <div class="sidebar-footer">
      <button class="btn-add-sidebar" @click="goToEntry">
        <span class="material-symbols-outlined" style="font-size:18px">add</span>
        ブックマークを追加
      </button>
      <div v-if="currentUser" class="user-info">
        <span class="material-symbols-outlined user-icon">account_circle</span>
        <span class="user-email">{{ currentUser.email }}</span>
        <button class="logout-btn" @click="logout" title="ログアウト">
          <span class="material-symbols-outlined">logout</span>
        </button>
      </div>
    </div>
  </aside>

  <!-- FAB (mobile) -->
  <button class="fab" @click="goToEntry">
    <span class="material-symbols-outlined">add</span>
  </button>
</template>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 8px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  min-width: 0;
}

.user-icon {
  font-size: 18px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.user-email {
  flex: 1;
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}
.logout-btn:hover {
  background: var(--bg-primary);
  color: var(--text-default);
}
.logout-btn .material-symbols-outlined {
  font-size: 16px;
}
</style>

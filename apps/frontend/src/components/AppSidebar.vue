<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useSidebar } from '../composables/useSidebar.js';

const router = useRouter();
const { isOpen, close } = useSidebar();

function goToEntry() {
  close();
  router.push('/bookmarks/entry');
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
    </div>
  </aside>

  <!-- FAB (mobile) -->
  <button class="fab" @click="goToEntry">
    <span class="material-symbols-outlined">add</span>
  </button>
</template>

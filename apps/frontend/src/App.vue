<script setup lang="ts">
import { useRouter } from 'vue-router';
import AppSidebar from './components/AppSidebar.vue';
import { useSidebar } from './composables/useSidebar.js';

const router = useRouter();
const { open } = useSidebar();

function goToEntry() {
  router.push('/bookmarks/entry');
}
</script>

<template>
  <div class="app-layout">
    <AppSidebar />
    <main class="main">
      <!-- Mobile topbar (inside main so sticky works correctly) -->
      <header class="topbar">
        <button class="icon-btn" @click="open">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <span class="topbar-logo-text">bookmarkly</span>
        <button class="icon-btn" @click="goToEntry">
          <span class="material-symbols-outlined">add</span>
        </button>
      </header>
      <RouterView />
    </main>
  </div>
</template>

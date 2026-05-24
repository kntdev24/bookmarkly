<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AppSidebar from './components/AppSidebar.vue';
import { useSidebar } from './composables/useSidebar.js';

const router = useRouter();
const route = useRoute();
const { open } = useSidebar();

const noLayout = computed(() => !!route.meta.noLayout);
const hideAddButton = computed(() => !!route.meta.hideAddButton);

function goToEntry() {
  router.push('/bookmarks/entry');
}
</script>

<template>
  <div :class="noLayout ? 'app-auth' : 'app-layout'">
    <AppSidebar v-if="!noLayout" />
    <main class="main">
      <header v-if="!noLayout" class="topbar">
        <button class="icon-btn" @click="open">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <span class="topbar-logo-text">bookmarkly</span>
        <button v-if="!hideAddButton" class="icon-btn" @click="goToEntry">
          <span class="material-symbols-outlined">add</span>
        </button>
        <div v-else style="width: 40px" />
      </header>
      <RouterView />
    </main>
  </div>
</template>

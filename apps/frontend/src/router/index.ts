import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import BookmarkListView from '../views/BookmarkListView.vue';
import BookmarkEntryView from '../views/BookmarkEntryView.vue';
import BookmarkDetailView from '../views/BookmarkDetailView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: DashboardView },
    { path: '/bookmarks', component: BookmarkListView },
    { path: '/bookmarks/entry', component: BookmarkEntryView },
    { path: '/bookmarks/:id', component: BookmarkDetailView },
  ],
});

export default router;

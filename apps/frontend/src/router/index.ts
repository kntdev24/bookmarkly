import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import BookmarkListView from '../views/BookmarkListView.vue';
import BookmarkEntryView from '../views/BookmarkEntryView.vue';
import BookmarkDetailView from '../views/BookmarkDetailView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import { isAuthenticated } from '../stores/auth.js';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginView, meta: { public: true } },
    { path: '/register', component: RegisterView, meta: { public: true } },
    { path: '/', component: DashboardView },
    { path: '/bookmarks', component: BookmarkListView },
    { path: '/bookmarks/entry', component: BookmarkEntryView, meta: { hideAddButton: true } },
    { path: '/bookmarks/:id', component: BookmarkDetailView },
  ],
});

router.beforeEach((to) => {
  if (!to.meta.public && !isAuthenticated.value) {
    return '/login';
  }
  if (to.meta.public && isAuthenticated.value) {
    return '/';
  }
});

export default router;

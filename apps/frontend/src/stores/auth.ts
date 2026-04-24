import { ref, computed } from 'vue';

const TOKEN_KEY = 'bookmarkly_token';
const USER_KEY = 'bookmarkly_user';

export type AuthUser = { id: string; email: string };

const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
const user = ref<AuthUser | null>(JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'));

export const isAuthenticated = computed(() => !!token.value);
export const currentUser = computed(() => user.value);

export function getToken() {
  return token.value;
}

export function setAuth(newToken: string, newUser: AuthUser) {
  token.value = newToken;
  user.value = newUser;
  localStorage.setItem(TOKEN_KEY, newToken);
  localStorage.setItem(USER_KEY, JSON.stringify(newUser));
}

export function clearAuth() {
  token.value = null;
  user.value = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

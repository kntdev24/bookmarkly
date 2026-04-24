<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../api/auth.js';
import { setAuth } from '../stores/auth.js';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function handleSubmit() {
  error.value = '';
  loading.value = true;
  try {
    const { token, user } = await login(email.value, password.value);
    setAuth(token, user);
    await router.push('/');
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'ログインに失敗しました';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">
        <span class="material-symbols-outlined logo-icon">bookmarks</span>
        <span class="logo-text">Bookmarkly</span>
      </div>
      <h1 class="auth-title">ログイン</h1>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="field">
          <label class="field-label">メールアドレス</label>
          <input
            v-model="email"
            type="email"
            class="field-input"
            placeholder="you@example.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="field">
          <label class="field-label">パスワード</label>
          <input
            v-model="password"
            type="password"
            class="field-input"
            placeholder="8文字以上"
            autocomplete="current-password"
            required
          />
        </div>

        <div v-if="error" class="auth-error">{{ error }}</div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="material-symbols-outlined spinning">progress_activity</span>
          <span v-else>ログイン</span>
        </button>
      </form>

      <p class="auth-footer">
        アカウントをお持ちでない方は
        <RouterLink to="/register" class="auth-link">新規登録</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  padding: 24px;
}

.auth-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 40px;
  width: 100%;
  max-width: 420px;
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
  justify-content: center;
}

.logo-icon {
  font-size: 28px;
  color: var(--brand);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-default);
}

.auth-title {
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 28px;
  color: var(--text-default);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
}

.field-input {
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 14px;
  color: var(--text-default);
  background: var(--bg-primary);
  outline: none;
  transition: border-color 0.15s;
}
.field-input:focus { border-color: var(--border-brand); }

.auth-error {
  font-size: 13px;
  color: var(--error, #e53935);
  background: #fdecea;
  border-radius: var(--radius-md);
  padding: 10px 14px;
}

.btn-primary {
  height: 44px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--brand);
  color: var(--text-contrast);
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.15s;
  margin-top: 4px;
}
.btn-primary:hover:not(:disabled) { opacity: 0.88; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.auth-footer {
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 20px;
}

.auth-link {
  color: var(--brand);
  text-decoration: none;
  font-weight: 700;
}
.auth-link:hover { text-decoration: underline; }

.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>

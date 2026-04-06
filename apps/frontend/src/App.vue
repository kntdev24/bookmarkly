<script setup lang="ts">
import { ref, onMounted } from "vue";

const message = ref<string>("");
const error = ref<string>("");
const loading = ref<boolean>(true);

onMounted(async () => {
  try {
    const res = await fetch("/api/message");
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();
    message.value = data.message;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Unknown error";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <p v-if="loading">Loading...</p>
    <p v-else-if="error">Error: {{ error }}</p>
    <p v-else>{{ message }}</p>
  </div>
</template>

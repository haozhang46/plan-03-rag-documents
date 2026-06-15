<template>
  <div class="flex-1 flex items-center justify-center p-6">
    <form class="w-full max-w-sm space-y-4" @submit.prevent="onSubmit">
      <h1 class="text-2xl font-semibold text-center">注册</h1>
      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      <label class="block">
        <span class="text-sm">昵称（可选）</span>
        <input
          v-model="displayName"
          type="text"
          class="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </label>
      <label class="block">
        <span class="text-sm">邮箱</span>
        <input
          v-model="email"
          type="email"
          required
          class="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </label>
      <label class="block">
        <span class="text-sm">密码</span>
        <input
          v-model="password"
          type="password"
          required
          minlength="8"
          class="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </label>
      <button type="submit" class="btn-primary w-full" :disabled="loading">
        {{ loading ? "注册中…" : "注册" }}
      </button>
      <p class="text-center text-sm text-gray-500">
        已有账号？
        <NuxtLink to="/login" class="text-blue-600 hover:underline">登录</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
const displayName = ref("");
const email = ref("");
const password = ref("");
const error = ref<string | null>(null);
const loading = ref(false);
const auth = useAuthStore();

async function onSubmit() {
  loading.value = true;
  error.value = null;
  try {
    await auth.register(email.value, password.value, displayName.value);
    await navigateTo("/");
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}
</script>

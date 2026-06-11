<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <form class="w-full max-w-sm space-y-4" @submit.prevent="onSubmit">
      <h1 class="text-2xl font-semibold">Sign in</h1>
      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      <label class="block">
        <span class="text-sm">Email</span>
        <input
          v-model="email"
          type="email"
          required
          class="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </label>
      <label class="block">
        <span class="text-sm">Password</span>
        <input
          v-model="password"
          type="password"
          required
          minlength="8"
          class="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </label>
      <button type="submit" class="btn-primary w-full" :disabled="loading">
        {{ loading ? "Signing in…" : "Sign in" }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const email = ref("");
const password = ref("");
const error = ref<string | null>(null);
const loading = ref(false);
const auth = useAuthStore();
const route = useRoute();

async function onSubmit() {
  loading.value = true;
  error.value = null;
  try {
    await auth.login(email.value, password.value);
    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/";
    await navigateTo(redirect);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}
</script>

export default defineNuxtPlugin(() => {
  useAuthStore().loadFromStorage();
});

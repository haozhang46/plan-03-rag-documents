export default defineNuxtRouteMiddleware(async (to) => {
  // Token lives in localStorage — auth checks are client-only.
  if (import.meta.server) return;

  const auth = useAuthStore();
  if (!auth.accessToken) {
    auth.loadFromStorage();
  }

  if (to.path === "/login" || to.path === "/register") {
    if (auth.isAuthenticated) return navigateTo("/");
    return;
  }

  if (!auth.isAuthenticated) {
    return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
  }

  if (!auth.user) {
    const ok = await auth.fetchMe();
    if (!ok) return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
  }
});

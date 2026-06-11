export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();
  auth.loadFromStorage();

  if (to.path === "/login") {
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

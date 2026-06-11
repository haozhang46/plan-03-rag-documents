import { computed, ref } from "vue";
import { defineStore } from "pinia";
import type { AuthUser, LoginResponse } from "~/types";

const TOKEN_KEY = "auth:access_token";
const USER_KEY = "auth:user";

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref<string | null>(null);
  const user = ref<AuthUser | null>(null);

  const isAuthenticated = computed(() => Boolean(accessToken.value));

  function loadFromStorage() {
    accessToken.value = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    user.value = raw ? (JSON.parse(raw) as AuthUser) : null;
  }

  function setSession(token: string, authUser: AuthUser) {
    accessToken.value = token;
    user.value = authUser;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  }

  function clearSession() {
    accessToken.value = null;
    user.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function authHeaders(): Record<string, string> {
    if (!accessToken.value) return {};
    return { Authorization: `Bearer ${accessToken.value}` };
  }

  async function login(email: string, password: string): Promise<void> {
    const config = useRuntimeConfig();
    const res = await fetch(`${config.public.apiBase}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const detail = (await res.json().catch(() => ({}))) as { detail?: string };
      throw new Error(detail.detail || `Login failed: ${res.status}`);
    }
    const data = (await res.json()) as LoginResponse;
    setSession(data.access_token, data.user);
  }

  async function fetchMe(): Promise<boolean> {
    if (!accessToken.value) return false;
    const config = useRuntimeConfig();
    const res = await fetch(`${config.public.apiBase}/v1/auth/me`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      clearSession();
      return false;
    }
    user.value = (await res.json()) as AuthUser;
    localStorage.setItem(USER_KEY, JSON.stringify(user.value));
    return true;
  }

  function logout() {
    clearSession();
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    loadFromStorage,
    setSession,
    clearSession,
    authHeaders,
    login,
    fetchMe,
    logout,
  };
});

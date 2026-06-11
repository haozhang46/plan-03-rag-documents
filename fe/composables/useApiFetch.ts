import { useAuthStore } from "~/stores/useAuthStore";

const TOKEN_KEY = "auth:access_token";
const USER_KEY = "auth:user";

export function useApiFetch() {
  async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    const res = await fetch(input, { ...init, headers });
    if (res.status === 401 && token) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      try {
        useAuthStore().clearSession();
      } catch {
        // Pinia may be inactive in unit tests
      }
    }
    return res;
  }

  return { apiFetch };
}

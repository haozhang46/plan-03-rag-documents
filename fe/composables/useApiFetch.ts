import { useAuthStore } from "~/stores/useAuthStore";

export function useApiFetch() {
  const auth = useAuthStore();

  async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);
    if (import.meta.client) {
      const authHeader = auth.authHeaders();
      for (const [key, value] of Object.entries(authHeader)) {
        headers.set(key, value);
      }
    }
    const res = await fetch(input, { ...init, headers });
    if (import.meta.client && res.status === 401 && auth.isAuthenticated) {
      auth.logout();
    }
    return res;
  }

  return { apiFetch };
}

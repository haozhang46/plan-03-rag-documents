export default defineNuxtConfig({
  devtools: { enabled: true },
  telemetry: false,
  modules: ["@unocss/nuxt", "@pinia/nuxt"],
  css: ["@unocss/reset/tailwind.css"],
  typescript: { strict: true },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:8000",
    },
  },
  vite: {
    test: {
      environment: "happy-dom",
    },
  },
});

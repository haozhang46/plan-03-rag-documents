export default defineNuxtConfig({
  devtools: { enabled: true },
  telemetry: false,
  modules: ["@unocss/nuxt", "@pinia/nuxt"],
  css: ["@unocss/reset/tailwind.css"],
  typescript: { strict: true },
  build: {
    transpile: ["@agent-flow/shared-ui"],
  },
  runtimeConfig: {
    public: {
      // Dev: empty → relative /v1/* via Vite proxy; prod: set NUXT_PUBLIC_API_BASE
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "",
      defaultFlowId: process.env.NUXT_PUBLIC_DEFAULT_FLOW_ID || "rag-flow",
    },
  },
  vite: {
    server: {
      proxy: {
        "/v1": {
          target: "http://1.14.158.173:8000",
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: "happy-dom",
    },
  },
});

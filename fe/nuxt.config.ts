export default defineNuxtConfig({
  devtools: { enabled: true },
  telemetry: false,
  modules: ["@unocss/nuxt", "@pinia/nuxt"],
  css: ["@unocss/reset/tailwind.css"],
  typescript: { strict: true },
  runtimeConfig: {
    public: {
      // Dev: empty → relative /v1/* via Vite proxy; prod: set NUXT_PUBLIC_API_BASE
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "",
      ollamaBaseUrl:
        process.env.NUXT_PUBLIC_OLLAMA_BASE_URL || "http://localhost:11434",
      embeddingModel:
        process.env.NUXT_PUBLIC_EMBEDDING_MODEL || "nomic-embed-text",
      embeddingDimensions: 768,
    },
  },
  vite: {
    server: {
      proxy: {
        "/v1": {
          target: "http://localhost:8000",
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: "happy-dom",
    },
  },
});

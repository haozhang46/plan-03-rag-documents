export default defineNuxtConfig({
  devtools: { enabled: true },
  telemetry: false,
  modules: ["@unocss/nuxt", "@pinia/nuxt"],
  css: ["@unocss/reset/tailwind.css"],
  typescript: { strict: true },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:8000",
      ollamaBaseUrl:
        process.env.NUXT_PUBLIC_OLLAMA_BASE_URL || "http://localhost:11434",
      embeddingModel:
        process.env.NUXT_PUBLIC_EMBEDDING_MODEL || "nomic-embed-text",
      embeddingDimensions: 768,
    },
  },
  vite: {
    test: {
      environment: "happy-dom",
    },
  },
});

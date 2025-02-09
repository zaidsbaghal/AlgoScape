export default defineNuxtConfig({
  css: ["~/assets/main.scss"],
  plugins: [],
  modules: ["@pinia/nuxt", "nuxt-gtag"],
  build: {},
  compatibilityDate: "2025-01-13",
  app: {
    head: {
      charset: "utf-16",
      viewport: "width=device-width, initial-scale=1",
      title: "AlgoScape",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          hid: "description",
          name: "description",
          content: "Software Engineer",
        },
      ],
    },
  },
  gtag: {
    id: "G-V37Q6Z6GWH",
  },
});

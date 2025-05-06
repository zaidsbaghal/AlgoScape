import { defineNuxtConfig } from "nuxt/config";

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
          name: "description",
          content:
            "Interactive algorithm visualizations for sorting and pathfinding. Explore Merge Sort, Quick Sort, Dijkstra's, A* and more with dynamic visual representations.",
        },
        {
          name: "keywords",
          content:
            "algorithms, data structures, sorting, pathfinding, visualization, education, computer science, merge sort, quick sort, dijkstra, a*, bfs, dfs",
        },
        { name: "author", content: "Zachary Brown" },
      ],
      htmlAttrs: {
        lang: "en",
      },
    },
  },
  runtimeConfig: {
    public: {
      gtag: {
        id: "G-V37Q6Z6GWH",
      },
    },
  },
});

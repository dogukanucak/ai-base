import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 8080,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  build: {
    target: "esnext",
  },
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },
});

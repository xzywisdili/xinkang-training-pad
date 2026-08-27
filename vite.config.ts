import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 4182,
    proxy: {
      "/api": { target: "http://123.57.205.29:8000", changeOrigin: true },
      "/ws": { target: "ws://123.57.205.29:8000", ws: true, changeOrigin: true }
    }
  },
});

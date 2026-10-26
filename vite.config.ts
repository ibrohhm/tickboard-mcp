import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: "src/web",
  plugins: [react()],
  build: { outDir: "../../dist/web", emptyOutDir: true },
  server: { proxy: { "^/api/": "http://127.0.0.1:8787" } },
  test: { root: ".", include: ["src/**/*.test.ts"] },
});

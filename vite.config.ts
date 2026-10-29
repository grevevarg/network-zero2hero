import preact from "@preact/preset-vite";
import { defineConfig } from "vitest/config";
import { coursePlugin } from "./src/build/vitePlugin.ts";

export default defineConfig({
  // Relative base works for both the default github.io/<repo>/ URL and a custom domain.
  base: "./",
  plugins: [preact(), coursePlugin()],
  // No modulepreload polyfill: the page should not issue any fetch() calls of its own.
  build: { target: "es2022", modulePreload: { polyfill: false } },
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}", "scripts/lib/**/*.ts"],
      exclude: ["src/main.tsx", "src/types.ts", "src/virtual.d.ts"],
      thresholds: { functions: 100 },
    },
  },
});

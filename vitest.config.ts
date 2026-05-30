import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    setupFiles: ["./tests/setup/vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "packages/desktop/src/renderer"),
    },
  },
});

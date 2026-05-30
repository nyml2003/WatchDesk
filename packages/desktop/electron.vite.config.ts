import { defineConfig } from "electron-vite";
import solid from "vite-plugin-solid";
import { resolve } from "path";
import { conditionalCompilePlugin } from "./vite-plugin-conditional-compile";

export default defineConfig(({ command }) => {
  const cc = conditionalCompilePlugin(command);

  return {
    main: {
      plugins: [cc],
      build: {
        outDir: "dist/main",
        rollupOptions: {
          external: ["@watchdesk/native"],
        },
      },
    },
    preload: {
      plugins: [cc],
      build: {
        outDir: "dist/preload",
      },
    },
    renderer: {
      plugins: [cc, solid()],
      build: {
        outDir: "dist/renderer",
        rollupOptions: {
          input: resolve(__dirname, "src/renderer/index.html"),
        },
      },
      resolve: {
        alias: {
          "@": resolve(__dirname, "../browser/src"),
        },
      },
      server: {
        fs: {
          allow: [".."],
        },
      },
    },
  };
});

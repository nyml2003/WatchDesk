import { access } from "fs/promises";
import { resolve, dirname, parse, format } from "path";
import type { Plugin } from "vite";

export function conditionalCompilePlugin(command: "serve" | "build"): Plugin {
  const suffix = command === "serve" ? "dev" : "prod";

  return {
    name: "watchdesk:conditional-compile",
    enforce: "pre",
    async resolveId(source, importer) {
      if (!importer || !source.startsWith(".")) return null;
      if (source.includes("node_modules")) return null;

      const resolved = resolve(dirname(importer), source);
      const parsed = parse(resolved);
      parsed.name = `${parsed.name}.${suffix}`;
      parsed.base = undefined;
      const candidate = format(parsed);

      try {
        await access(candidate);
        return candidate;
      } catch {
        return null;
      }
    },
  };
}

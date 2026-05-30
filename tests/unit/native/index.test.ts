import { describe, it, expect } from "vitest";
import { resolve } from "path";
import { existsSync } from "fs";

describe("@watchdesk/native", () => {
  it("compiled JS output exists", () => {
    const distPath = resolve(__dirname, "../../../packages/native/dist");
    expect(existsSync(resolve(distPath, "index.js"))).toBe(true);
    expect(existsSync(resolve(distPath, "types.js"))).toBe(true);
    expect(existsSync(resolve(distPath, "index.d.ts"))).toBe(true);
  });

  it(".node binary exists in package root", () => {
    const nodeFile = resolve(__dirname, "../../../packages/native/watchdesk-native.node");
    expect(existsSync(nodeFile)).toBe(true);
  });

  it("api shape is correct", async () => {
    const native = await import(resolve(__dirname, "../../../packages/native/dist/index.js"));
    expect(native.native).toBeDefined();
    expect(native.native.pty).toBeDefined();
    expect(typeof native.native.pty.spawn).toBe("function");
    expect(typeof native.native.pty.write).toBe("function");
    expect(typeof native.native.pty.resize).toBe("function");
    expect(typeof native.native.pty.kill).toBe("function");
  });
});

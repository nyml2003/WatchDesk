import { resolve } from "path";

let nativeModule: Record<string, unknown> | null = null;
let loadedFrom: string | null = null;
try {
  const modulePath = resolve(__dirname, "..", "watchdesk-native.node");
  nativeModule = require(modulePath) as Record<string, unknown>;
  loadedFrom = modulePath;
  console.log("[native] Loaded from:", loadedFrom, "exports:", Object.keys(nativeModule));
  if (Object.keys(nativeModule).length === 0) {
    nativeModule = null;
  }
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[native] Failed to load native module: ${msg}`);
  nativeModule = null;
}

type PtySpawnFn = (
  shell: string,
  cwd: string,
  cols: number,
  rows: number,
  cb: (_err: null | Error, data: Uint8Array) => void,
) => number;
type PtyWriteFn = (id: number, data: Uint8Array) => void;
type PtyResizeFn = (id: number, cols: number, rows: number) => void;
type PtyKillFn = (id: number) => void;

export const native = {
  pty: {
    spawn(
      shell: string,
      cwd: string,
      cols: number,
      rows: number,
      onData: (data: Uint8Array) => void,
    ): number {
      if (!nativeModule) {
        throw new Error("Native module not available: ptySpawn");
      }
      const fn = nativeModule["ptySpawn"] as PtySpawnFn;
      return fn(shell, cwd, cols, rows, (_err, data) => {
        onData(data);
      });
    },
    write(id: number, data: Uint8Array): void {
      if (!nativeModule) {
        throw new Error("Native module not available: ptyWrite");
      }
      const fn = nativeModule["ptyWrite"] as PtyWriteFn;
      const buf = Buffer.from(data);
      if (!Buffer.isBuffer(buf)) {
        throw new Error(`write: Buffer.from() returned ${typeof buf} instead of Buffer`);
      }
      fn(id, buf);
    },
    resize(id: number, cols: number, rows: number): void {
      if (!nativeModule) {
        throw new Error("Native module not available: ptyResize");
      }
      const fn = nativeModule["ptyResize"] as PtyResizeFn;
      fn(id, cols, rows);
    },
    kill(id: number): void {
      if (!nativeModule) {
        throw new Error("Native module not available: ptyKill");
      }
      const fn = nativeModule["ptyKill"] as PtyKillFn;
      fn(id);
    },
  },
};

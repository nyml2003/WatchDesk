/**
 * Native module stub (Phase 1)
 *
 * All methods throw "not implemented" because Phase 2 (Rust napi-rs) is not yet ready.
 * The ModuleWrapper interface is documented in types.ts.
 */

import type { INativeModule } from "./types";

const NOT_IMPLEMENTED = (method: string): never => {
  throw new Error(`Native module not available: ${method} (Phase 2: napi-rs Rust)`);
};

function createStubNative(): INativeModule {
  return {
    fs: {
      readRaw: () => NOT_IMPLEMENTED("fs.readRaw"),
      writeRaw: () => NOT_IMPLEMENTED("fs.writeRaw"),
      appendRaw: () => NOT_IMPLEMENTED("fs.appendRaw"),
      stat: () => NOT_IMPLEMENTED("fs.stat"),
      listDir: () => NOT_IMPLEMENTED("fs.listDir"),
      mkdir: () => NOT_IMPLEMENTED("fs.mkdir"),
      remove: () => NOT_IMPLEMENTED("fs.remove"),
      copy: () => NOT_IMPLEMENTED("fs.copy"),
      rename: () => NOT_IMPLEMENTED("fs.rename"),
      exists: () => NOT_IMPLEMENTED("fs.exists"),
      watch: () => NOT_IMPLEMENTED("fs.watch"),
      glob: () => NOT_IMPLEMENTED("fs.glob"),
    },
    hash: {
      blake3: () => NOT_IMPLEMENTED("hash.blake3"),
      blake3Stream: () => NOT_IMPLEMENTED("hash.blake3Stream"),
      xxhash64: () => NOT_IMPLEMENTED("hash.xxhash64"),
    },
    compress: {
      zstdCompress: () => NOT_IMPLEMENTED("compress.zstdCompress"),
      zstdDecompress: () => NOT_IMPLEMENTED("compress.zstdDecompress"),
    },
  };
}

export const nativeModule: INativeModule = createStubNative();

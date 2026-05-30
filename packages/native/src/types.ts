/**
 * WatchDesk native module interface
 *
 * Phase 1: JS stub
 * Phase 2: napi-rs Rust implementation
 */

export interface INativeHash {
  blake3(data: Uint8Array): Promise<Uint8Array>;
  blake3Stream(): IHashStream;
  xxhash64(data: Uint8Array): Promise<bigint>;
}

export interface IHashStream {
  update(chunk: Uint8Array): void;
  finalize(): Promise<Uint8Array>;
}

export interface INativeCompress {
  zstdCompress(data: Uint8Array, level?: number): Promise<Uint8Array>;
  zstdDecompress(data: Uint8Array): Promise<Uint8Array>;
}

export interface INativeFileSystem {
  readRaw(path: string): Promise<Uint8Array>;
  writeRaw(path: string, data: Uint8Array): Promise<void>;
  appendRaw(path: string, data: Uint8Array): Promise<void>;
  stat(path: string): Promise<string>;
  listDir(path: string): Promise<string>;
  mkdir(path: string, recursive?: boolean): Promise<void>;
  remove(path: string, recursive?: boolean): Promise<void>;
  copy(src: string, dst: string): Promise<void>;
  rename(src: string, dst: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  watch(path: string, callback: (eventsJson: string) => void): Promise<() => void>;
  glob(pattern: string, cwd: string): Promise<string[]>;
}

export interface INativeModule {
  fs: INativeFileSystem;
  hash: INativeHash;
  compress: INativeCompress;
  pty: INativePty;
}

export interface INativePty {
  spawn(
    shell: string,
    cwd: string,
    cols: number,
    rows: number,
    onData: (data: Uint8Array) => void,
  ): number;
  write(id: number, data: Uint8Array): void;
  resize(id: number, cols: number, rows: number): void;
  kill(id: number): void;
}

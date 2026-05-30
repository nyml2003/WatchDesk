import type { TerminalSpawnHandle, FileEntryDTO } from "./dtos";

export interface ICounterService {
  getValue(): Promise<number>;
  increment(): Promise<number>;
  decrement(): Promise<number>;
  reset(): Promise<void>;
}

export interface ITerminalService {
  spawn(cols: number, rows: number): Promise<TerminalSpawnHandle>;
  write(handle: TerminalSpawnHandle, data: string): Promise<void>;
  resize(handle: TerminalSpawnHandle, cols: number, rows: number): Promise<void>;
  kill(handle: TerminalSpawnHandle): Promise<void>;
  onData(handle: TerminalSpawnHandle, callback: (data: Uint8Array) => void): () => void;
}

export interface IFileSystemService {
  selectDirectory(): Promise<string | null>;
  readFile(path: string): Promise<Uint8Array>;
  listDirectory(path: string): Promise<FileEntryDTO[]>;
}

export interface IStorageService {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

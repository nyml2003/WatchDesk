export interface ICounterRepository {
  getValue(): Promise<number>;
  increment(): Promise<number>;
  decrement(): Promise<number>;
  reset(): Promise<void>;
}

export interface IFileSystemRepository {
  listDirectory(path: string): Promise<FileNodeVM[]>;
  readRaw(path: string): Promise<Uint8Array>;
  exists(path: string): Promise<boolean>;
}

export interface FileNodeVM {
  readonly path: string;
  readonly name: string;
  readonly kind: "file" | "directory";
  readonly size: number;
  readonly modifiedAt: number;
}

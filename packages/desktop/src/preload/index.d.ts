export {};

interface FileEntryDTO {
  path: string;
  name: string;
  kind: "file" | "directory" | "symlink";
  size: number;
  modifiedAt: number;
  isHidden: boolean;
}

interface FileStatDTO {
  size: number;
  mode: number;
  modifiedAt: number;
  createdAt: number;
  accessedAt: number;
  isReadonly: boolean;
  isHidden: boolean;
}

declare global {
  interface Window {
    readonly electronAPI: {
      counter: {
        increment(id: string): Promise<{ value: number }>;
        decrement(id: string): Promise<{ value: number }>;
        get(id: string): Promise<{ value: number }>;
        reset(id: string): Promise<void>;
      };
      fs: {
        readRaw(path: string): Promise<Uint8Array>;
        writeRaw(path: string, data: Uint8Array): Promise<void>;
        listDirectory(path: string): Promise<FileEntryDTO[]>;
        getStat(path: string): Promise<FileStatDTO>;
        exists(path: string): Promise<boolean>;
      };
      app: {
        getPlatform(): Promise<"win32" | "darwin" | "linux">;
        getVersion(): Promise<string>;
        quit(): Promise<void>;
      };
    };
  }
}

export {};

interface FileEntryDTO {
  name: string;
  path: string;
  isDirectory: boolean;
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
      dialog: {
        selectDirectory(): Promise<string | null>;
      };
      terminal: {
        spawn(cols: number, rows: number, onData: (data: Uint8Array) => void): Promise<number>;
        write(id: number, data: string): Promise<void>;
        resize(id: number, cols: number, rows: number): Promise<void>;
        kill(id: number): Promise<void>;
      };
      app: {
        getPlatform(): Promise<"win32" | "darwin" | "linux">;
        getVersion(): Promise<string>;
        quit(): Promise<void>;
      };
    };
  }
}

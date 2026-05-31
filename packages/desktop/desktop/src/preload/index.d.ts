export {};

interface FileEntryDTO {
  name: string;
  path: string;
  isDirectory: boolean;
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
        listDirectory(path: string): Promise<FileEntryDTO[]>;
      };
      dialog: {
        selectDirectory(): Promise<string | null>;
      };
      terminal: {
        spawn(
          cols: number,
          rows: number,
          onData: (data: Uint8Array) => void,
        ): Promise<{ id: number; dispose(): void }>;
        write(id: number, data: string): Promise<void>;
        resize(id: number, cols: number, rows: number): Promise<void>;
        kill(id: number): Promise<void>;
      };
    };
  }
}

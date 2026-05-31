export interface FileEntryDTO {
  name: string;
  path: string;
  isDirectory: boolean;
}

export interface FileSystemService {
  selectDirectory(): Promise<string | null>;
  readRaw(path: string): Promise<Uint8Array>;
  listDirectory(path: string): Promise<FileEntryDTO[]>;
}

export function assertFileSystemService(obj: unknown): asserts obj is FileSystemService {
  if (!obj || typeof obj !== "object") throw new Error("FileSystemService: must be an object");
  const required = ["selectDirectory", "readRaw", "listDirectory"] as const;
  for (const m of required) {
    if (typeof (obj as Record<string, unknown>)[m] !== "function") {
      throw new Error(`FileSystemService: missing method "${m}"`);
    }
  }
}

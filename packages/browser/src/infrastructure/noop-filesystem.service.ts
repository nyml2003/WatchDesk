import type { FileSystemService } from "@watchdesk/ui";
import type { FileEntryDTO } from "@watchdesk/contracts";

export class NoopFileSystemService implements FileSystemService {
  async selectDirectory(): Promise<string | null> {
    console.warn("[browser] File system is not available in browser mode");
    return null;
  }

  async listDirectory(_dir: string): Promise<FileEntryDTO[]> {
    console.warn("[browser] File system is not available in browser mode");
    return [];
  }

  async readRaw(_path: string): Promise<Uint8Array> {
    console.warn("[browser] File system is not available in browser mode");
    return new Uint8Array();
  }
}

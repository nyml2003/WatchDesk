import type { FileEntryDTO } from "@watchdesk/contracts";

export const fsService = {
  async selectDirectory(): Promise<string | null> {
    return window.electronAPI.dialog.selectDirectory();
  },

  async listDirectory(dir: string): Promise<FileEntryDTO[]> {
    return window.electronAPI.fs.listDirectory(dir);
  },

  async readRaw(path: string): Promise<Uint8Array> {
    return window.electronAPI.fs.readRaw(path);
  },
};

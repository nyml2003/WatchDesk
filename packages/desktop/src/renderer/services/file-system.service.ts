export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

export const fsService = {
  async selectDirectory(): Promise<string | null> {
    return window.electronAPI.dialog.selectDirectory();
  },

  async listDirectory(dir: string): Promise<FileEntry[]> {
    const result = await window.electronAPI.fs.listDirectory(dir);
    return result;
  },

  async readRaw(path: string): Promise<Uint8Array> {
    return window.electronAPI.fs.readRaw(path);
  },
};

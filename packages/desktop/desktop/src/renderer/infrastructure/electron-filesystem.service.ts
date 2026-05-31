export class ElectronFileSystemService {
  async selectDirectory(): Promise<string | null> {
    return window.electronAPI.dialog.selectDirectory();
  }

  async listDirectory(
    dir: string,
  ): Promise<{ name: string; path: string; isDirectory: boolean }[]> {
    return window.electronAPI.fs.listDirectory(dir);
  }

  async readRaw(path: string) {
    return window.electronAPI.fs.readRaw(path);
  }
}

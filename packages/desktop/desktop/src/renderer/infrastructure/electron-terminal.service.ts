export class ElectronTerminalService {
  async spawn(
    cols: number,
    rows: number,
    onData: (data: Uint8Array) => void,
  ): Promise<{ id: number; dispose(): void }> {
    return window.electronAPI.terminal.spawn(cols, rows, onData);
  }

  async write(id: number, data: string): Promise<void> {
    return window.electronAPI.terminal.write(id, data);
  }

  async resize(id: number, cols: number, rows: number): Promise<void> {
    return window.electronAPI.terminal.resize(id, cols, rows);
  }

  async kill(id: number): Promise<void> {
    return window.electronAPI.terminal.kill(id);
  }
}

import type { TerminalSpawnHandle } from "@watchdesk/contracts";

export const terminalService = {
  spawn(
    cols: number,
    rows: number,
    onData: (data: Uint8Array) => void,
  ): Promise<TerminalSpawnHandle> {
    return window.electronAPI.terminal.spawn(cols, rows, onData);
  },

  write(id: number, data: string): Promise<void> {
    return window.electronAPI.terminal.write(id, data);
  },

  resize(id: number, cols: number, rows: number): Promise<void> {
    return window.electronAPI.terminal.resize(id, cols, rows);
  },

  kill(id: number): Promise<void> {
    return window.electronAPI.terminal.kill(id);
  },
};

import { contextBridge, ipcRenderer } from "electron";
import { IpcChannels } from "@watchdesk/contracts";

const api = {
  counter: {
    increment: (id: string): Promise<{ value: number }> =>
      ipcRenderer.invoke(IpcChannels.COUNTER_INCREMENT, { id }),
    decrement: (id: string): Promise<{ value: number }> =>
      ipcRenderer.invoke(IpcChannels.COUNTER_DECREMENT, { id }),
    get: (id: string): Promise<{ value: number }> =>
      ipcRenderer.invoke(IpcChannels.COUNTER_GET, { id }),
    reset: (id: string): Promise<void> => ipcRenderer.invoke(IpcChannels.COUNTER_RESET, { id }),
  },
  fs: {
    readRaw: (path: string): Promise<Uint8Array> =>
      ipcRenderer.invoke(IpcChannels.FS_READ_RAW, { path }),
    listDirectory: (path: string): Promise<unknown[]> =>
      ipcRenderer.invoke(IpcChannels.FS_LIST_DIRECTORY, { path }),
  },
  dialog: {
    selectDirectory: (): Promise<string | null> =>
      ipcRenderer.invoke(IpcChannels.DIALOG_SELECT_DIRECTORY),
  },
  terminal: {
    spawn: (
      cols: number,
      rows: number,
      onData: (data: Uint8Array) => void,
    ): Promise<{ id: number; dispose(): void }> => {
      const channel = `terminal-on-data:${String(Date.now())}`;
      const handler = (_event: unknown, data: Uint8Array) => {
        onData(data);
      };
      ipcRenderer.on(channel, handler);
      return ipcRenderer
        .invoke(IpcChannels.TERMINAL_SPAWN, { cols, rows, channel })
        .then((id: number) => ({
          id,
          dispose: () => {
            ipcRenderer.removeListener(channel, handler);
          },
        }));
    },
    write: (id: number, data: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.TERMINAL_WRITE, { id, data }),
    resize: (id: number, cols: number, rows: number): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.TERMINAL_RESIZE, { id, cols, rows }),
    kill: (id: number): Promise<void> => ipcRenderer.invoke(IpcChannels.TERMINAL_KILL, { id }),
  },
};

contextBridge.exposeInMainWorld("electronAPI", api);

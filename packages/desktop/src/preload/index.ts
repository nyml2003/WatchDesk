import { contextBridge, ipcRenderer } from "electron";

const api = {
  counter: {
    increment: (id: string): Promise<{ value: number }> =>
      ipcRenderer.invoke("counter:increment", { id }),
    decrement: (id: string): Promise<{ value: number }> =>
      ipcRenderer.invoke("counter:decrement", { id }),
    get: (id: string): Promise<{ value: number }> => ipcRenderer.invoke("counter:get", { id }),
    reset: (id: string): Promise<void> => ipcRenderer.invoke("counter:reset", { id }),
  },
  fs: {
    readRaw: (path: string): Promise<Uint8Array> => ipcRenderer.invoke("fs:readRaw", { path }),
    writeRaw: (path: string, data: Uint8Array): Promise<void> =>
      ipcRenderer.invoke("fs:writeRaw", { path, data }),
    listDirectory: (path: string): Promise<unknown[]> =>
      ipcRenderer.invoke("fs:listDirectory", { path }),
    getStat: (path: string): Promise<unknown> => ipcRenderer.invoke("fs:getStat", { path }),
    exists: (path: string): Promise<boolean> => ipcRenderer.invoke("fs:exists", { path }),
  },
  dialog: {
    selectDirectory: (): Promise<string | null> => ipcRenderer.invoke("dialog:selectDirectory"),
  },
  terminal: {
    spawn: (cols: number, rows: number, onData: (data: Uint8Array) => void): Promise<number> => {
      const channel = `terminal-on-data:${String(Date.now())}`;
      const handler = (_event: unknown, data: Uint8Array) => {
        onData(data);
      };
      ipcRenderer.on(channel, handler);
      return ipcRenderer.invoke("terminal:spawn", { cols, rows, channel }).then((id: number) => {
        return id;
      });
    },
    write: (id: number, data: string): Promise<void> =>
      ipcRenderer.invoke("terminal:write", { id, data }),
    resize: (id: number, cols: number, rows: number): Promise<void> =>
      ipcRenderer.invoke("terminal:resize", { id, cols, rows }),
    kill: (id: number): Promise<void> => ipcRenderer.invoke("terminal:kill", { id }),
  },
  app: {
    getPlatform: (): Promise<string> => ipcRenderer.invoke("app:getPlatform"),
    getVersion: (): Promise<string> => ipcRenderer.invoke("app:getVersion"),
    quit: (): Promise<void> => ipcRenderer.invoke("app:quit"),
  },
};

contextBridge.exposeInMainWorld("electronAPI", api);

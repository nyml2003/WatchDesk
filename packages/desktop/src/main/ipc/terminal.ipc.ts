import { ipcMain, BrowserWindow } from "electron";
import { native } from "@watchdesk/native";

interface PtyHandler {
  id: number;
  windowId: number;
  channel: string;
}

const ptyHandlers = new Map<number, PtyHandler>();

export function registerTerminalHandlers(): void {
  ipcMain.handle(
    "terminal:spawn",
    async (event, args: { cols: number; rows: number; channel: string }) => {
      const { cols, rows, channel } = args;
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win) throw new Error("No window found");

      const id = native.pty.spawn("cmd.exe", process.cwd(), cols, rows, (data: Uint8Array) => {
        win.webContents.send(channel, data);
      });

      ptyHandlers.set(id, { id, windowId: win.id, channel });
      return id;
    },
  );

  ipcMain.handle("terminal:write", async (_event, args: { id: number; data: string }) => {
    const data = new TextEncoder().encode(args.data);
    try {
      native.pty.write(args.id, data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("管道正在被关闭") || msg.includes("os error 232")) {
        return;
      }
      throw err;
    }
  });

  ipcMain.handle(
    "terminal:resize",
    async (_event, args: { id: number; cols: number; rows: number }) => {
      native.pty.resize(args.id, args.cols, args.rows);
    },
  );

  ipcMain.handle("terminal:kill", async (_event, args: { id: number }) => {
    native.pty.kill(args.id);
    ptyHandlers.delete(args.id);
  });
}

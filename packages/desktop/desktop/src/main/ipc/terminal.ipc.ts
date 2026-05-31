import { ipcMain, BrowserWindow } from "electron";
import { native } from "@watchdesk/native";
import { IpcChannels } from "../../shared/channels";
import { getWorkspaceRoot } from "./filesystem.ipc";

interface PtyHandler {
  id: number;
  windowId: number;
  channel: string;
}

const ptyHandlers = new Map<number, PtyHandler>();

function getShell(): string {
  if (process.platform === "win32") {
    return "cmd.exe";
  }
  return process.env["SHELL"] ?? "/bin/bash";
}

export function registerTerminalHandlers(): void {
  ipcMain.handle(
    IpcChannels.TERMINAL_SPAWN,
    async (event, args: { cols: number; rows: number; channel: string }) => {
      const { cols, rows, channel } = args;
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win) throw new Error("No window found");

      const cwd = getWorkspaceRoot() ?? process.cwd();
      const id = native.pty.spawn(getShell(), cwd, cols, rows, (data: Uint8Array) => {
        win.webContents.send(channel, data);
      });

      ptyHandlers.set(id, { id, windowId: win.id, channel });
      return id;
    },
  );

  ipcMain.handle(IpcChannels.TERMINAL_WRITE, async (_event, args: { id: number; data: string }) => {
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
    IpcChannels.TERMINAL_RESIZE,
    async (_event, args: { id: number; cols: number; rows: number }) => {
      native.pty.resize(args.id, args.cols, args.rows);
    },
  );

  ipcMain.handle(IpcChannels.TERMINAL_KILL, async (_event, args: { id: number }) => {
    native.pty.kill(args.id);
    ptyHandlers.delete(args.id);
  });
}

import { ipcMain, dialog } from "electron";
import { readFile, readdir, stat } from "fs/promises";
import { join, resolve as pathResolve, sep } from "path";
import { ReadRawSchema, ListDirectorySchema, createHandler } from "./schemas";
import { IpcChannels } from "../../shared/channels";

let workspaceRoot: string | null = null;
// TODO: per-window isolation when multi-window is supported

export function getWorkspaceRoot(): string | null {
  return workspaceRoot;
}

function resolveChecked(input: string): string {
  if (!workspaceRoot) {
    throw new Error("No workspace selected. Use dialog:selectDirectory first.");
  }
  const resolved = pathResolve(input);
  const normalizedRoot = pathResolve(workspaceRoot);
  if (!resolved.startsWith(normalizedRoot + sep) && resolved !== normalizedRoot) {
    throw new Error(`Access denied: "${input}" is outside the workspace.`);
  }
  return resolved;
}

export function registerFileSystemHandlers(): void {
  ipcMain.handle(
    IpcChannels.FS_READ_RAW,
    createHandler(ReadRawSchema, async ({ path }) => {
      const safe = resolveChecked(path);
      const buffer = await readFile(safe);
      return new Uint8Array(buffer);
    }),
  );

  ipcMain.handle(
    IpcChannels.FS_LIST_DIRECTORY,
    createHandler(ListDirectorySchema, async ({ path }) => {
      const safe = resolveChecked(path);
      const names = await readdir(safe);
      const results = await Promise.allSettled(
        names.map(async (name) => {
          const fullPath = join(safe, name);
          const s = await stat(fullPath);
          return {
            name,
            path: fullPath,
            isDirectory: s.isDirectory(),
          };
        }),
      );
      return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
    }),
  );

  ipcMain.handle(IpcChannels.DIALOG_SELECT_DIRECTORY, async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    workspaceRoot = result.filePaths[0] ?? null;
    return workspaceRoot;
  });
}

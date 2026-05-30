import { ipcMain, dialog } from "electron";
import { readFile, readdir, stat } from "fs/promises";
import { join } from "path";
import { ReadRawSchema, ListDirectorySchema, createHandler } from "./schemas";

export function registerFileSystemHandlers(): void {
  ipcMain.handle(
    "fs:readRaw",
    createHandler(ReadRawSchema, async ({ path }) => {
      const buffer = await readFile(path);
      return new Uint8Array(buffer);
    }),
  );

  ipcMain.handle(
    "fs:listDirectory",
    createHandler(ListDirectorySchema, async ({ path }) => {
      const names = await readdir(path);
      const results = await Promise.allSettled(
        names.map(async (name) => {
          const fullPath = join(path, name);
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

  ipcMain.handle("dialog:selectDirectory", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0] ?? null;
  });
}

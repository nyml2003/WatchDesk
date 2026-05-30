import { app, BrowserWindow, shell } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import { CounterId } from "@watchdesk/shared";
import { CounterUseCase } from "./application/counter.usecase";
import { InMemoryCounterRepository } from "./infra/counter.repo";
import { registerAllIpcHandlers } from "./ipc/index";

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    backgroundColor: "#1a1b2e",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    mainWindow.webContents.openDevTools({ mode: "detach" });
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    void mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    void mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  return mainWindow;
}

void app.whenReady().then(() => {
  const counterRepo = new InMemoryCounterRepository();
  const counterUseCase = new CounterUseCase(counterRepo);

  const DEFAULT_COUNTER_ID = CounterId.of("default");
  void counterUseCase.create(DEFAULT_COUNTER_ID, "WatchDesk Counter");

  registerAllIpcHandlers({ counterUseCase });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

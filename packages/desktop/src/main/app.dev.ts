import "./app";

import { BrowserWindow } from "electron";

const interval = setInterval(() => {
  const wins = BrowserWindow.getAllWindows();
  if (wins.length > 0 && wins[0]) {
    wins[0].webContents.openDevTools({ mode: "detach" });
    clearInterval(interval);
  }
}, 100);

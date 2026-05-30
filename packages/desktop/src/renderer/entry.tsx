import { render } from "solid-js/web";
import { App } from "@watchdesk/ui";
import { ElectronCounterService } from "./infrastructure/electron-counter.service";
import { ElectronFileSystemService } from "./infrastructure/electron-filesystem.service";
import { XtermTerminalView } from "./views/xterm-terminal";
import { settingsService } from "./infrastructure/settings.service";
import "./styles/tokens.css";
import "./styles/global.css";

document.documentElement.setAttribute("data-theme", "dark");

const counterService = new ElectronCounterService();
const fsService = new ElectronFileSystemService();

const root = document.getElementById("app");
if (!root) throw new Error("Root element #app not found");
render(
  () => (
    <App
      counterService={counterService}
      fsService={fsService}
      settingsService={settingsService}
      terminalView={XtermTerminalView}
    />
  ),
  root,
);

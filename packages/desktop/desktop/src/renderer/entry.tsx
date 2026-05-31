import { render } from "solid-js/web";
import { App, PageRegistry } from "@watchdesk/shell";
import { createDashboardPage } from "@watchdesk/page-dashboard";
import { createMarkdownReaderPage } from "@watchdesk/page-reader";
import { createTerminalPage } from "@watchdesk/page-terminal";
import { createSettingsPage } from "@watchdesk/page-settings";
import { createTicTacToePage } from "@watchdesk/page-tictactoe";
import { ElectronCounterService } from "./infrastructure/electron-counter.service";
import { ElectronFileSystemService } from "./infrastructure/electron-filesystem.service";
import { XtermTerminalView } from "./views/xterm-terminal";
import { settingsService } from "./infrastructure/settings.service";
import "./styles/tokens.css";
import "./styles/global.css";

document.documentElement.setAttribute("data-theme", "dark");

const counterService = new ElectronCounterService();
const fsService = new ElectronFileSystemService();

const registry = new PageRegistry([
  createDashboardPage(counterService),
  createMarkdownReaderPage(fsService),
  createTerminalPage(),
  createTicTacToePage(),
  createSettingsPage(settingsService),
]);

const root = document.getElementById("app");
if (!root) throw new Error("Root element #app not found");
render(() => <App registry={registry} terminalView={XtermTerminalView} />, root);

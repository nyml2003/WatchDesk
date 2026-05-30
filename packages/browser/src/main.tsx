import { render } from "solid-js/web";
import { App, PageRegistry } from "@watchdesk/shell";
import {
  createDashboardPage,
  createMarkdownReaderPage,
  createTerminalPage,
  createTicTacToePage,
  createSettingsPage,
} from "@watchdesk/ui";
import { createDependencies } from "./infrastructure/di";
import "./styles/tokens.css";
import "./styles/global.css";

document.documentElement.setAttribute("data-theme", "dark");

const deps = createDependencies();

const registry = new PageRegistry([
  createDashboardPage(deps.counterService),
  createMarkdownReaderPage(deps.fsService),
  createTerminalPage(),
  createTicTacToePage(),
  createSettingsPage(deps.settingsService),
]);

const root = document.getElementById("app");
if (!root) throw new Error("Root element #app not found");
render(() => <App registry={registry} terminalView={null} />, root);

import { render } from "solid-js/web";
import { App, PageRegistry } from "@watchdesk/shell";
import { createDashboardPage } from "@watchdesk/page-dashboard";
import { createSettingsPage } from "@watchdesk/page-settings";
import { createTicTacToePage } from "@watchdesk/page-tictactoe";
import { createBrowserCounterService } from "./infrastructure/browser-counter.service";
import { BrowserSettingsService } from "./infrastructure/browser-settings.service";
import "./styles/tokens.css";
import "./styles/global.css";

document.documentElement.setAttribute("data-theme", "dark");

const registry = new PageRegistry([
  createDashboardPage(createBrowserCounterService()),
  createSettingsPage(new BrowserSettingsService()),
  createTicTacToePage(),
]);

const root = document.getElementById("app");
if (!root) throw new Error("Root element #app not found");
render(() => <App registry={registry} terminalView={null} />, root);

import { render } from "solid-js/web";
import { App } from "@watchdesk/ui";
import { createDependencies } from "./infrastructure/di";
import "./styles/tokens.css";
import "./styles/global.css";

document.documentElement.setAttribute("data-theme", "dark");

const deps = createDependencies();

const root = document.getElementById("app");
if (!root) throw new Error("Root element #app not found");
render(
  () => (
    <App
      counterService={deps.counterService}
      fsService={deps.fsService}
      settingsService={deps.settingsService}
      terminalView={null}
    />
  ),
  root,
);

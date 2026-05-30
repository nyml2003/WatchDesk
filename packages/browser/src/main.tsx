import { render } from "solid-js/web";
import { createSignal } from "solid-js";
import { createDependencies } from "./infrastructure/di";
import { appConfig } from "./app.config";
import { WatchDeskLayout } from "./layout/WatchDeskLayout";
import { Sidebar } from "./layout/Sidebar";
import { DashboardPage } from "./features/counter/DashboardPage";
import { MarkdownReaderPage } from "./features/reader/MarkdownReaderPage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { TerminalPage } from "./features/terminal/TerminalPage";
import "./styles/tokens.css";
import "./styles/global.css";

document.documentElement.setAttribute("data-theme", "dark");

const deps = createDependencies();

type Page = "dashboard" | "files" | "terminal" | "settings";

function App() {
  const [activePage, setActivePage] = createSignal<Page>("dashboard");
  const [theme, setTheme] = createSignal<"light" | "dark">("dark");

  const toggleTheme = () => {
    const next = theme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
  };

  const cfg = appConfig.features;

  return (
    <WatchDeskLayout
      sidebar={
        <Sidebar
          active={activePage()}
          theme={theme()}
          onNavigate={setActivePage}
          onToggleTheme={toggleTheme}
        />
      }
    >
      {cfg.counter && activePage() === "dashboard" && <DashboardPage deps={deps} />}
      {cfg.files && activePage() === "files" && <MarkdownReaderPage />}
      {cfg.terminal && activePage() === "terminal" && <TerminalPage theme={theme()} />}
      {cfg.settings && activePage() === "settings" && <SettingsPage />}
    </WatchDeskLayout>
  );
}

const root = document.getElementById("app");
if (!root) throw new Error("Root element #app not found");
render(() => <App />, root);

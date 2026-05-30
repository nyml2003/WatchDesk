import { render } from "solid-js/web";
import { createSignal, Switch, Match } from "solid-js";
import { createDependencies } from "./infrastructure/di";
import { AppLayout } from "./layouts/AppLayout";
import { Sidebar } from "./layouts/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { MarkdownReader } from "./pages/MarkdownReader";
import { SettingsPage } from "./pages/Settings";
import "./tokens.css";
import "./global.css";

document.documentElement.setAttribute("data-theme", "dark");

const deps = createDependencies();

type Page = "dashboard" | "files" | "settings";

function App() {
  const [activePage, setActivePage] = createSignal<Page>("dashboard");
  const [theme, setTheme] = createSignal<"light" | "dark">("dark");

  const toggleTheme = () => {
    const next = theme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
  };

  return (
    <AppLayout
      sidebar={
        <Sidebar
          active={activePage()}
          theme={theme()}
          onNavigate={setActivePage}
          onToggleTheme={toggleTheme}
        />
      }
    >
      <Switch>
        <Match when={activePage() === "dashboard"}>
          <Dashboard deps={deps} />
        </Match>
        <Match when={activePage() === "files"}>
          <MarkdownReader />
        </Match>
        <Match when={activePage() === "settings"}>
          <SettingsPage />
        </Match>
      </Switch>
    </AppLayout>
  );
}

const root = document.getElementById("app");
if (!root) throw new Error("Root element #app not found");
render(() => <App />, root);

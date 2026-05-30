import { createSignal } from "solid-js";
import { WatchDeskLayout } from "./layouts/WatchDeskLayout";
import { Sidebar } from "./layouts/Sidebar";
import { DashboardPage } from "./pages/Dashboard";
import { MarkdownReaderPage } from "./pages/MarkdownReader";
import { SettingsPage } from "./pages/Settings";
import { TerminalPage } from "./pages/Terminal";
import { TerminalViewCtx } from "./context/terminal-view.context";
import type { CounterService } from "./components/WatchCounter";
import type { FileSystemService } from "./pages/MarkdownReader";
import type { SettingsService } from "./pages/Settings";
import type { Page } from "@watchdesk/contracts";
import type { TerminalViewContextValue } from "@watchdesk/contracts";

const navItems = [
  { id: "dashboard" as const, label: "仪表盘", icon: "📊" },
  { id: "files" as const, label: "文件", icon: "📄" },
  { id: "terminal" as const, label: "终端", icon: "⚡" },
  { id: "settings" as const, label: "设置", icon: "⚙" },
];

export interface AppServices {
  counterService: CounterService;
  fsService: FileSystemService;
  settingsService: SettingsService;
  terminalView: TerminalViewContextValue["TerminalView"];
}

export function App(props: AppServices) {
  const [activePage, setActivePage] = createSignal<Page>("dashboard");
  const [theme, setTheme] = createSignal<"light" | "dark">("dark");

  const toggleTheme = () => {
    const next = theme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
  };

  return (
    <TerminalViewCtx.Provider value={{ TerminalView: props.terminalView }}>
      <WatchDeskLayout
        sidebar={
          <Sidebar
            active={activePage()}
            theme={theme()}
            onNavigate={setActivePage}
            onToggleTheme={toggleTheme}
            navItems={navItems}
          />
        }
      >
        {activePage() === "dashboard" && <DashboardPage counterService={props.counterService} />}
        {activePage() === "files" && <MarkdownReaderPage fsService={props.fsService} />}
        {activePage() === "terminal" && <TerminalPage clipboard={navigator.clipboard} />}
        {activePage() === "settings" && <SettingsPage settingsService={props.settingsService} />}
      </WatchDeskLayout>
    </TerminalViewCtx.Provider>
  );
}

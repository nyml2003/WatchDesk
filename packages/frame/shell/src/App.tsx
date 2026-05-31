import { createSignal } from "solid-js";
import { WatchDeskLayout } from "./layouts/WatchDeskLayout";
import { Sidebar } from "./layouts/Sidebar";
import { TerminalViewCtx } from "./context/terminal-view.context";
import type { TerminalViewContextValue } from "./context/terminal-view.context";
import type { PageRegistry } from "./page-registry";

interface AppProps {
  registry: PageRegistry;
  terminalView: TerminalViewContextValue["TerminalView"];
}

export function App(props: AppProps) {
  const navItems = props.registry.getNavItems();
  const [activeId, setActiveId] = createSignal(navItems[0]?.id ?? "");
  const [theme, setTheme] = createSignal<"light" | "dark">("dark");

  const toggleTheme = () => {
    const next = theme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
  };

  const handleNavigate = (id: string) => {
    setActiveId(props.registry.navigate(id, activeId()));
  };

  const page = () => props.registry.get(activeId());

  return (
    <TerminalViewCtx.Provider value={{ TerminalView: props.terminalView }}>
      <WatchDeskLayout
        sidebar={
          <Sidebar
            active={activeId()}
            theme={theme()}
            onNavigate={handleNavigate}
            onToggleTheme={toggleTheme}
            navItems={navItems}
          />
        }
      >
        {page()?.render()}
      </WatchDeskLayout>
    </TerminalViewCtx.Provider>
  );
}

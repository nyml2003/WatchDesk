import { For } from "solid-js";
import type { Page, NavItem } from "@watchdesk/contracts";

interface SidebarProps {
  active: Page;
  theme: "light" | "dark";
  onNavigate: (id: Page) => void;
  onToggleTheme: () => void;
  navItems: readonly NavItem[];
}

const sidebar = {
  width: "220px",
  display: "flex",
  "flex-direction": "column",
  "border-right": "1px solid var(--wd-colors-border)",
  background: "var(--wd-colors-surface)",
} as const;

const logo = {
  padding: "16px",
  "font-size": "16px",
  "font-weight": "700",
  color: "var(--wd-colors-accent)",
  "border-bottom": "1px solid var(--wd-colors-border)",
} as const;

const nav = {
  flex: 1,
  padding: "8px 0",
} as const;

const navItem = {
  display: "flex",
  "align-items": "center",
  gap: "10px",
  width: "100%",
  padding: "10px 16px",
  border: "none",
  background: "transparent",
  color: "var(--wd-colors-text)",
  cursor: "pointer",
  "font-size": "14px",
  "text-align": "left",
} as const;

const navItemActive = {
  ...navItem,
  background: "var(--wd-colors-surface-active)",
  color: "var(--wd-colors-accent)",
} as const;

const footer = {
  padding: "8px 0",
  "border-top": "1px solid var(--wd-colors-border)",
} as const;

export function Sidebar(props: SidebarProps) {
  return (
    <nav style={sidebar}>
      <div style={logo}>WatchDesk</div>
      <div style={nav}>
        <For each={props.navItems}>
          {(item) => (
            <button
              style={props.active === item.id ? navItemActive : navItem}
              onClick={() => {
                props.onNavigate(item.id);
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )}
        </For>
      </div>
      <div style={footer}>
        <button style={navItem} onClick={props.onToggleTheme}>
          <span>{props.theme === "dark" ? "☀" : "☾"}</span>
          <span>{props.theme === "dark" ? "浅色模式" : "深色模式"}</span>
        </button>
      </div>
    </nav>
  );
}

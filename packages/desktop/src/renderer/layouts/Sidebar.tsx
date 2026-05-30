import { For } from "solid-js";
import styles from "./sidebar.module.css";

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "工作台", icon: "📋" },
  { id: "files", label: "文件浏览器", icon: "📄" },
  { id: "settings", label: "设置", icon: "⚙️" },
];

interface SidebarProps {
  active: string;
  theme: "light" | "dark";
  onNavigate: (id: string) => void;
  onToggleTheme: () => void;
}

export function Sidebar(props: SidebarProps) {
  return (
    <nav class={styles["sidebar"]}>
      <div class={styles["logo"]}>WatchDesk</div>
      <div class={styles["nav"]}>
        <For each={navItems}>
          {(item) => (
            <button
              class={
                props.active === item.id
                  ? String(styles["navItem"]) + " " + String(styles["navItemActive"])
                  : String(styles["navItem"])
              }
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
      <div class={styles["footer"]}>
        <button class={styles["navItem"]} onClick={props.onToggleTheme}>
          <span>{props.theme === "dark" ? "☀" : "☾"}</span>
          <span>{props.theme === "dark" ? "浅色模式" : "深色模式"}</span>
        </button>
      </div>
    </nav>
  );
}

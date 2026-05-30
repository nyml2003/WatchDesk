import { For } from "solid-js";
import styles from "../styles/sidebar.module.css";
import { appConfig } from "../app.config";

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  active: string;
  theme: "light" | "dark";
  onNavigate: (id: string) => void;
  onToggleTheme: () => void;
  navItems?: readonly NavItem[];
}

export function Sidebar(props: SidebarProps) {
  const nav = props.navItems ?? appConfig.nav;
  return (
    <nav class={styles["sidebar"]}>
      <div class={styles["logo"]}>WatchDesk</div>
      <div class={styles["nav"]}>
        <For each={nav}>
          {(item) => (
            <button
              class={
                props.active === item.id
                  ? `${styles["navItem"]} ${styles["navItemActive"]}`
                  : styles["navItem"]
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

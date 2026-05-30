import type { JSX } from "solid-js";
import styles from "../styles/layout.module.css";

interface WatchDeskLayoutProps {
  sidebar: JSX.Element;
  children: JSX.Element;
}

export function WatchDeskLayout(props: WatchDeskLayoutProps) {
  return (
    <div class={styles.layout}>
      {props.sidebar}
      <div class={styles.content}>{props.children}</div>
    </div>
  );
}

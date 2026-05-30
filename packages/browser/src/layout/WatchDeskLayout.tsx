import type { JSX } from "solid-js";
import styles from "../styles/layout.module.css";

interface WatchDeskLayoutProps {
  sidebar: JSX.Element;
  children: JSX.Element;
}

export function WatchDeskLayout(props: WatchDeskLayoutProps) {
  return (
    <div class={styles["layout"]}>
      {props.sidebar}
      {props.children}
    </div>
  );
}

import type { JSX } from "solid-js";
import styles from "./layout.module.css";

interface AppLayoutProps {
  sidebar: JSX.Element;
  children: JSX.Element;
}

export function AppLayout(props: AppLayoutProps) {
  return (
    <div class={styles["layout"]}>
      {props.sidebar}
      {props.children}
    </div>
  );
}

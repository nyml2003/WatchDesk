import type { JSX } from "solid-js";

interface WatchDeskLayoutProps {
  sidebar: JSX.Element;
  children: JSX.Element;
}

export function WatchDeskLayout(props: WatchDeskLayoutProps) {
  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {props.sidebar}
      <div style={{ flex: 1, overflow: "auto", "min-width": "0" }}>{props.children}</div>
    </div>
  );
}

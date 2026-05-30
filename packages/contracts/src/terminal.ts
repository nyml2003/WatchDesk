import type { Component } from "solid-js";

export type TerminalViewComponent = Component<{
  containerRef: HTMLElement;
}>;

export interface TerminalViewContextValue {
  TerminalView: TerminalViewComponent | null;
}

import { createContext, useContext } from "solid-js";
import type { Component } from "solid-js";

export type TerminalViewComponent = Component<{
  containerRef: HTMLElement;
}>;

export interface TerminalViewContextValue {
  TerminalView: TerminalViewComponent | null;
}

const TerminalViewCtx = createContext<TerminalViewContextValue>({
  TerminalView: null,
});

export function useTerminalView() {
  return useContext(TerminalViewCtx);
}

export { TerminalViewCtx };

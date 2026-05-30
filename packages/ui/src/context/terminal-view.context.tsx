import { createContext, useContext } from "solid-js";
import type { TerminalViewContextValue } from "@watchdesk/contracts";

const TerminalViewCtx = createContext<TerminalViewContextValue>({
  TerminalView: null,
});

export function useTerminalView() {
  return useContext(TerminalViewCtx);
}

export { TerminalViewCtx };

import type { CounterUseCase } from "@watchdesk/core";
import { registerCounterHandlers } from "./counter.ipc";
import { registerFileSystemHandlers } from "./filesystem.ipc";
import { registerTerminalHandlers } from "./terminal.ipc";

export function registerAllIpcHandlers(deps: { counterUseCase: CounterUseCase }): void {
  registerCounterHandlers(deps.counterUseCase);
  registerFileSystemHandlers();
  registerTerminalHandlers();
}

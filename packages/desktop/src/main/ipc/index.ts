import type { CounterUseCase } from "../application/counter.usecase";
import { registerCounterHandlers } from "./counter.ipc";
import { registerFileSystemHandlers } from "./filesystem.ipc";

export function registerAllIpcHandlers(deps: { counterUseCase: CounterUseCase }): void {
  registerCounterHandlers(deps.counterUseCase);
  registerFileSystemHandlers();
}

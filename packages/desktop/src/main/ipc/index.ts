import type { CounterUseCase } from "../application/counter.usecase";
import { registerCounterHandlers } from "./counter.ipc";

export function registerAllIpcHandlers(deps: { counterUseCase: CounterUseCase }): void {
  registerCounterHandlers(deps.counterUseCase);
}

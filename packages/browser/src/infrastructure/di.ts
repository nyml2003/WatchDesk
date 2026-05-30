import { CounterUseCase } from "../application/CounterUseCase";
import { BrowserCounterRepository } from "./counter.browser-repository";
import { ElectronCounterRepository } from "./counter.electron-repository";
import type { ICounterRepository } from "../domain/repositories";

export interface Dependencies {
  counterUseCase: CounterUseCase;
}

export function createDependencies(): Dependencies {
  const isElectron = typeof window !== "undefined" && "electronAPI" in window;

  const counterRepo: ICounterRepository = isElectron
    ? new ElectronCounterRepository()
    : new BrowserCounterRepository();

  return {
    counterUseCase: new CounterUseCase(counterRepo),
  };
}

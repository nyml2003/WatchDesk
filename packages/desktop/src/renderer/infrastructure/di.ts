import { CounterUseCase } from "../application/counter.usecase";
import { ElectronCounterRepository } from "./counter.repo";
import { BrowserCounterRepository } from "./counter.repo.browser";
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

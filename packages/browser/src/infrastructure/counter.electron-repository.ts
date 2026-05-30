import type { ICounterRepository } from "../domain/repositories";

export class ElectronCounterRepository implements ICounterRepository {
  async getValue(): Promise<number> {
    const dto = await window.electronAPI.counter.get("default");
    return dto.value;
  }

  async increment(): Promise<number> {
    const dto = await window.electronAPI.counter.increment("default");
    return dto.value;
  }

  async decrement(): Promise<number> {
    const dto = await window.electronAPI.counter.decrement("default");
    return dto.value;
  }

  async reset(): Promise<void> {
    await window.electronAPI.counter.reset("default");
  }
}

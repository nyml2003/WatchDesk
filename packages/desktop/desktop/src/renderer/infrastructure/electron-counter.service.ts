export class ElectronCounterService {
  async getValue(): Promise<number> {
    const result = await window.electronAPI.counter.get("default");
    return result.value;
  }

  async increment(): Promise<number> {
    const result = await window.electronAPI.counter.increment("default");
    return result.value;
  }

  async decrement(): Promise<number> {
    const result = await window.electronAPI.counter.decrement("default");
    return result.value;
  }

  async reset(): Promise<void> {
    await window.electronAPI.counter.reset("default");
  }
}

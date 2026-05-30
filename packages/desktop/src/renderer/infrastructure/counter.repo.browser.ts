import type { ICounterRepository } from "../domain/repositories";

export class BrowserCounterRepository implements ICounterRepository {
  private readonly key = "watchdesk:counter:default";

  getValue(): Promise<number> {
    const raw = localStorage.getItem(this.key);
    return Promise.resolve(raw ? Number(raw) : 0);
  }

  async increment(): Promise<number> {
    const next = (await this.getValue()) + 1;
    localStorage.setItem(this.key, String(next));
    return next;
  }

  async decrement(): Promise<number> {
    const next = (await this.getValue()) - 1;
    localStorage.setItem(this.key, String(next));
    return next;
  }

  reset(): Promise<void> {
    localStorage.setItem(this.key, "0");
    return Promise.resolve();
  }
}

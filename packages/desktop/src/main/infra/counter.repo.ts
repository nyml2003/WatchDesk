import type { CounterId, Counter } from "../domain/entities";
import type { ICounterRepository } from "../domain/repositories";

export class InMemoryCounterRepository implements ICounterRepository {
  private readonly store = new Map<string, Counter>();

  get(id: CounterId): Promise<Counter | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  save(counter: Counter): Promise<void> {
    this.store.set(counter.id, counter);
    return Promise.resolve();
  }
}

import type { Counter } from "../domain/entities";
import type { CounterId } from "../domain/entities";
import type { ICounterRepository } from "../domain/repositories";
import { ok, err, counterError, type CounterError, type Result } from "../domain/errors";

export class CounterUseCase {
  constructor(private readonly repo: ICounterRepository) {}

  async increment(id: CounterId): Promise<Result<Counter, CounterError>> {
    const counter = await this.repo.get(id);
    if (!counter) {
      return err(counterError(`Counter not found: ${id}`, "NOT_FOUND"));
    }
    const updated: Counter = { ...counter, value: counter.value + 1 };
    await this.repo.save(updated);
    return ok(updated);
  }

  async decrement(id: CounterId): Promise<Result<Counter, CounterError>> {
    const counter = await this.repo.get(id);
    if (!counter) {
      return err(counterError(`Counter not found: ${id}`, "NOT_FOUND"));
    }
    const updated: Counter = { ...counter, value: counter.value - 1 };
    await this.repo.save(updated);
    return ok(updated);
  }

  async get(id: CounterId): Promise<Result<Counter, CounterError>> {
    const counter = await this.repo.get(id);
    if (!counter) {
      return err(counterError(`Counter not found: ${id}`, "NOT_FOUND"));
    }
    return ok(counter);
  }

  async reset(id: CounterId): Promise<Result<Counter, CounterError>> {
    const counter = await this.repo.get(id);
    if (!counter) {
      return err(counterError(`Counter not found: ${id}`, "NOT_FOUND"));
    }
    const updated: Counter = { ...counter, value: 0 };
    await this.repo.save(updated);
    return ok(updated);
  }

  async create(id: CounterId, label: string): Promise<void> {
    const counter: Counter = { id, value: 0, label };
    await this.repo.save(counter);
  }
}

import type { ICounterRepository } from "../domain/repositories";

export class CounterUseCase {
  constructor(private readonly repo: ICounterRepository) {}

  async increment(): Promise<number> {
    return this.repo.increment();
  }

  async decrement(): Promise<number> {
    return this.repo.decrement();
  }

  async getValue(): Promise<number> {
    return this.repo.getValue();
  }

  async reset(): Promise<void> {
    return this.repo.reset();
  }
}

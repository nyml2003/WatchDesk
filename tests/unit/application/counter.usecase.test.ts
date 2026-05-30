import { describe, it, expect } from "vitest";

class StubCounterRepository {
  private value: number = 0;

  getValue(): Promise<number> {
    return Promise.resolve(this.value);
  }

  increment(): Promise<number> {
    return Promise.resolve(++this.value);
  }

  decrement(): Promise<number> {
    return Promise.resolve(--this.value);
  }

  reset(): Promise<void> {
    this.value = 0;
    return Promise.resolve();
  }
}

import { CounterUseCase } from "../../../packages/desktop/src/renderer/application/counter.usecase";

describe("CounterUseCase", () => {
  it("increment: 0 -> 1", async () => {
    const repo = new StubCounterRepository();
    const uc = new CounterUseCase(repo);

    expect(await uc.increment()).toBe(1);
  });

  it("decrement: 1 -> 0", async () => {
    const repo = new StubCounterRepository();
    const uc = new CounterUseCase(repo);

    await uc.increment();
    expect(await uc.decrement()).toBe(0);
  });

  it("reset", async () => {
    const repo = new StubCounterRepository();
    const uc = new CounterUseCase(repo);

    await uc.increment();
    await uc.increment();
    await uc.reset();

    expect(await uc.getValue()).toBe(0);
  });
});

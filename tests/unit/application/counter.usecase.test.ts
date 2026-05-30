import { describe, it, expect } from "vitest";
import type { Counter, CounterId, ICounterRepository } from "@watchdesk/core";
import { CounterUseCase, CounterId as Cid } from "@watchdesk/core";

class InMemoryRepository implements ICounterRepository {
  private store = new Map<string, Counter>();

  get(id: CounterId): Promise<Counter | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  save(counter: Counter): Promise<void> {
    this.store.set(counter.id, counter);
    return Promise.resolve();
  }
}

describe("CounterUseCase", () => {
  const DEFAULT_ID = Cid.of("test");

  it("increment", async () => {
    const repo = new InMemoryRepository();
    const uc = new CounterUseCase(repo);
    await uc.create(DEFAULT_ID, "test-counter");

    const result = await uc.increment(DEFAULT_ID);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe(1);
    }
  });

  it("decrement", async () => {
    const repo = new InMemoryRepository();
    const uc = new CounterUseCase(repo);
    await uc.create(DEFAULT_ID, "test-counter");
    await uc.increment(DEFAULT_ID);
    await uc.increment(DEFAULT_ID);

    const result = await uc.decrement(DEFAULT_ID);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe(1);
    }
  });

  it("reset", async () => {
    const repo = new InMemoryRepository();
    const uc = new CounterUseCase(repo);
    await uc.create(DEFAULT_ID, "test-counter");
    await uc.increment(DEFAULT_ID);
    await uc.increment(DEFAULT_ID);
    await uc.reset(DEFAULT_ID);

    const result = await uc.get(DEFAULT_ID);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe(0);
    }
  });

  it("returns error for non-existent counter", async () => {
    const repo = new InMemoryRepository();
    const uc = new CounterUseCase(repo);

    const result = await uc.increment(Cid.of("missing"));
    expect(result.ok).toBe(false);
  });
});

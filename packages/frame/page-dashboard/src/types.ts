export interface CounterService {
  getValue(): Promise<number>;
  increment(): Promise<number>;
  decrement(): Promise<number>;
  reset(): Promise<void>;
}

export function assertCounterService(obj: unknown): asserts obj is CounterService {
  if (!obj || typeof obj !== "object") throw new Error("CounterService: must be an object");
  const required = ["getValue", "increment", "decrement", "reset"] as const;
  for (const m of required) {
    if (typeof (obj as Record<string, unknown>)[m] !== "function") {
      throw new Error(`CounterService: missing method "${m}"`);
    }
  }
}

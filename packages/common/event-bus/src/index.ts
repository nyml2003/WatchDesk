import type { EventName } from "./ids";

export class EventBus<PayloadMap extends Record<string, unknown> = Record<string, unknown>> {
  private listeners = new Map<EventName, Set<(payload: unknown) => void>>();

  emit<E extends keyof PayloadMap & string>(event: E & EventName, payload: PayloadMap[E]): void {
    const handlers = this.listeners.get(event);
    if (!handlers || handlers.size === 0) return;

    for (const handler of handlers) {
      handler(payload);
    }
  }

  on<E extends keyof PayloadMap & string>(
    event: E & EventName,
    handler: (payload: PayloadMap[E]) => void,
  ): () => void {
    const set = this.listeners.get(event) ?? new Set<(payload: unknown) => void>();
    set.add(handler as (payload: unknown) => void);
    this.listeners.set(event, set);

    return () => {
      set.delete(handler as (payload: unknown) => void);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  once<E extends keyof PayloadMap & string>(
    event: E & EventName,
    handler: (payload: PayloadMap[E]) => void,
  ): () => void {
    let cancelled = false;
    const off = this.on(event, (payload) => {
      if (!cancelled) {
        cancelled = true;
        off();
        handler(payload);
      }
    });
    return off;
  }

  clear(): void {
    this.listeners.clear();
  }
}

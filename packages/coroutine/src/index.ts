interface CoroutineOptions {
  deduplicate?: boolean;
  priority?: "high" | "normal" | "low";
  timeout?: number;
  retries?: number;
  scope?: string;
}

export class CoroutineScheduler {
  private pending = new Map<string, Promise<unknown>>();
  private scopes = new Map<string, Set<AbortController>>();

  async spawn<T>(
    key: string,
    fn: (signal: AbortSignal) => Promise<T>,
    opts: CoroutineOptions = {},
  ): Promise<T> {
    if (opts.deduplicate) {
      const cached = this.pending.get(key);
      if (cached) return cached as Promise<T>;
    }

    const controller = new AbortController();

    if (opts.scope) {
      const ctrls = this.scopes.get(opts.scope) ?? new Set();
      ctrls.add(controller);
      this.scopes.set(opts.scope, ctrls);
    }

    if (opts.timeout) {
      setTimeout(() => {
        controller.abort();
      }, opts.timeout);
    }

    const promise = fn(controller.signal).finally(() => {
      this.pending.delete(key);
    });

    if (opts.deduplicate) {
      this.pending.set(key, promise);
    }

    return promise;
  }

  cancel(key: string): void {
    this.pending.delete(key);
  }

  cancelScope(scope: string): void {
    const ctrls = this.scopes.get(scope);
    if (ctrls) {
      for (const ctrl of ctrls) ctrl.abort();
      this.scopes.delete(scope);
    }
  }
}

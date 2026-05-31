export function createBrowserCounterService() {
  const key = "watchdesk:counter:default";

  return {
    async getValue(): Promise<number> {
      const raw = localStorage.getItem(key);
      return raw ? Number(raw) : 0;
    },
    async increment(): Promise<number> {
      const next = (await this.getValue()) + 1;
      localStorage.setItem(key, String(next));
      return next;
    },
    async decrement(): Promise<number> {
      const next = (await this.getValue()) - 1;
      localStorage.setItem(key, String(next));
      return next;
    },
    async reset(): Promise<void> {
      localStorage.setItem(key, "0");
    },
  };
}

import type { PageDefinition } from "@watchdesk/ui";

export class PageRegistry {
  #pages: Map<string, PageDefinition>;

  constructor(pages: PageDefinition[]) {
    this.#pages = new Map(pages.map((p) => [p.id, p]));
  }

  getNavItems(): { id: string; label: string; icon: string }[] {
    return [...this.#pages.values()].map((p) => ({
      id: p.id,
      label: p.label,
      icon: p.icon,
    }));
  }

  get(id: string): PageDefinition | undefined {
    return this.#pages.get(id);
  }

  navigate(requested: string, fallback: string): string {
    return this.#pages.has(requested) ? requested : fallback;
  }
}

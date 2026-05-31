import type { CounterId, Counter } from "./entities";

export interface ICounterRepository {
  get(id: CounterId): Promise<Counter | null>;
  save(counter: Counter): Promise<void>;
}

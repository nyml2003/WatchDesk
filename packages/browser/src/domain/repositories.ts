export interface ICounterRepository {
  getValue(): Promise<number>;
  increment(): Promise<number>;
  decrement(): Promise<number>;
  reset(): Promise<void>;
}

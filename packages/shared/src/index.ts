export type Brand<T, B extends string> = T & { readonly __brand: B };

export function brand<B extends string>() {
  return {
    of(raw: string): Brand<string, B> {
      return raw as Brand<string, B>;
    },
  };
}

export function brandN<B extends string>() {
  return {
    of(raw: number): Brand<number, B> {
      return raw as Brand<number, B>;
    },
  };
}

export type { Logger } from "./logger";

import { ipcMain } from "electron";
import {
  IncrementSchema,
  DecrementSchema,
  GetCounterSchema,
  ResetCounterSchema,
  createHandler,
} from "./schemas";
import { CounterId } from "@watchdesk/shared";
import type { CounterUseCase } from "../application/counter.usecase";

function unwrap(
  result: { ok: true; value: { value: number } } | { ok: false; error: { message: string } },
): { value: number } {
  if (!result.ok) {
    throw new Error(result.error.message);
  }
  return { value: result.value.value };
}

export function registerCounterHandlers(useCase: CounterUseCase): void {
  ipcMain.handle(
    "counter:increment",
    createHandler(IncrementSchema, async ({ id }) => {
      const result = await useCase.increment(CounterId.of(id));
      return unwrap(result);
    }),
  );

  ipcMain.handle(
    "counter:decrement",
    createHandler(DecrementSchema, async ({ id }) => {
      const result = await useCase.decrement(CounterId.of(id));
      return unwrap(result);
    }),
  );

  ipcMain.handle(
    "counter:get",
    createHandler(GetCounterSchema, async ({ id }) => {
      const result = await useCase.get(CounterId.of(id));
      return unwrap(result);
    }),
  );

  ipcMain.handle(
    "counter:reset",
    createHandler(ResetCounterSchema, async ({ id }) => {
      const result = await useCase.reset(CounterId.of(id));
      return unwrap(result);
    }),
  );
}

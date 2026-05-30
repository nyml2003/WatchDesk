import { z } from "zod";
import type { IpcMainInvokeEvent } from "electron";

export const CounterIdSchema = z.string().min(1).max(64);
export const FilePathSchema = z.string().min(1);

export const IncrementSchema = z.object({ id: CounterIdSchema });
export const DecrementSchema = z.object({ id: CounterIdSchema });
export const GetCounterSchema = z.object({ id: CounterIdSchema });
export const ResetCounterSchema = z.object({ id: CounterIdSchema });

export function createHandler<I, O>(
  schema: z.ZodSchema<I>,
  fn: (input: I) => Promise<O>,
): (event: IpcMainInvokeEvent, raw: unknown) => Promise<O> {
  return async (_event, raw) => {
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message).join("; ");
      throw new Error(`Validation failed: ${messages}`);
    }
    return fn(parsed.data);
  };
}

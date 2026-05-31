import type { Brand } from "@watchdesk/shared";
import { brand } from "@watchdesk/shared";

export type EventName = Brand<string, "EventName">;
export const EventName = {
  of(module: string, event: string): EventName {
    return brand<"EventName">().of(`${module}:${event}`);
  },
};

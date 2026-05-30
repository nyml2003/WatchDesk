import { createContext, useContext, onCleanup, type JSX } from "solid-js";
import type { EventBus } from "@watchdesk/event-bus";

const EventBusContext = createContext<EventBus>();

export function EventBusProvider(props: { bus: EventBus; children: JSX.Element }): JSX.Element {
  return <EventBusContext.Provider value={props.bus}>{props.children}</EventBusContext.Provider>;
}

export function useEventBus(): EventBus {
  const bus = useContext(EventBusContext);
  if (!bus) throw new Error("useEventBus must be used within EventBusProvider");
  return bus;
}

export function useEvent(
  bus: EventBus,
  event: Parameters<EventBus["on"]>[0],
  handler: Parameters<EventBus["on"]>[1],
): void {
  const off = bus.on(event, handler);
  onCleanup(off);
}

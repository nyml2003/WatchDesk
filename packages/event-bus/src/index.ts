import type { EventName } from "@watchdesk/shared";

type FileChangeEventDTO = {
  path: string;
  kind: "created" | "modified" | "deleted" | "renamed";
  oldPath?: string;
  timestamp: number;
};

type UpdateStatusDTO = {
  status: "checking" | "available" | "not-available" | "downloading" | "ready";
  version?: string;
  progress?: number;
  error?: string;
};

type EventPayloadMap = {
  "counter:changed": number;
  "fs:file-selected": string;
  "fs:file-opened": string;
  "fs:directory-refresh": string;
  "fs:watch-event": FileChangeEventDTO;
  "tab:switch": string;
  "tab:closed": string;
  "layout:resize": { direction: "horizontal" | "vertical"; sizes: number[] };
  "workflow:run": string;
  "workflow:step-done": { workflowId: string; taskId: string };
  "updater:progress": UpdateStatusDTO;
  "app:theme-changed": "light" | "dark";
};

export type RegisteredEventName = keyof EventPayloadMap;
export type EventPayload<E extends RegisteredEventName = RegisteredEventName> = EventPayloadMap[E];

export class EventBus {
  private listeners = new Map<EventName, Set<(payload: unknown) => void>>();

  emit<E extends RegisteredEventName>(event: E & EventName, payload: EventPayload<E>): void {
    const handlers = this.listeners.get(event);
    if (!handlers || handlers.size === 0) return;

    for (const handler of handlers) {
      handler(payload);
    }
  }

  on<E extends RegisteredEventName>(
    event: E & EventName,
    handler: (payload: EventPayload<E>) => void,
  ): () => void {
    const set = this.listeners.get(event) ?? new Set<(payload: unknown) => void>();
    set.add(handler as (payload: unknown) => void);
    this.listeners.set(event, set);

    return () => {
      set.delete(handler as (payload: unknown) => void);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  once<E extends RegisteredEventName>(
    event: E & EventName,
    handler: (payload: EventPayload<E>) => void,
  ): () => void {
    let cancelled = false;
    const off = this.on(event, (payload) => {
      if (!cancelled) {
        cancelled = true;
        off();
        handler(payload);
      }
    });
    return off;
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const EVENT_NAMES = {
  COUNTER_CHANGED: "counter:changed" as const,
  FS_FILE_SELECTED: "fs:file-selected" as const,
  FS_FILE_OPENED: "fs:file-opened" as const,
  FS_DIRECTORY_REFRESH: "fs:directory-refresh" as const,
  FS_WATCH_EVENT: "fs:watch-event" as const,
  TAB_SWITCH: "tab:switch" as const,
  TAB_CLOSED: "tab:closed" as const,
  LAYOUT_RESIZE: "layout:resize" as const,
  WORKFLOW_RUN: "workflow:run" as const,
  WORKFLOW_STEP_DONE: "workflow:step-done" as const,
  UPDATER_PROGRESS: "updater:progress" as const,
  APP_THEME_CHANGED: "app:theme-changed" as const,
} as const;

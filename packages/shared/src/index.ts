export type Brand<T, B extends string> = T & { readonly __brand: B };

export type CounterId = Brand<string, "CounterId">;
export type FilePath = Brand<string, "FilePath">;
export type FileNodeId = Brand<string, "FileNodeId">;
export type FileName = Brand<string, "FileName">;
export type TaskId = Brand<string, "TaskId">;
export type WorkflowId = Brand<string, "WorkflowId">;
export type EdgeId = Brand<string, "EdgeId">;
export type HashHex = Brand<string, "HashHex">;
export type TimestampMs = Brand<number, "TimestampMs">;
export type ProcessId = Brand<number, "ProcessId">;

export const CounterId = {
  of(raw: string): CounterId {
    return raw as CounterId;
  },
};

export const FilePath = {
  of(raw: string): FilePath {
    return raw as FilePath;
  },
};

export const FileNodeId = {
  of(raw: string): FileNodeId {
    return raw as FileNodeId;
  },
};

export const FileName = {
  of(raw: string): FileName {
    return raw as FileName;
  },
};

export const TaskId = {
  of(raw: string): TaskId {
    return raw as TaskId;
  },
};

export const WorkflowId = {
  of(raw: string): WorkflowId {
    return raw as WorkflowId;
  },
};

export const EdgeId = {
  of(raw: string): EdgeId {
    return raw as EdgeId;
  },
};

export const HashHex = {
  of(raw: string): HashHex {
    return raw as HashHex;
  },
};

export const TimestampMs = {
  of(n: number): TimestampMs {
    return n as TimestampMs;
  },
};

export type EventName = Brand<string, "EventName">;

export const EventName = {
  of(module: string, event: string): EventName {
    return `${module}:${event}` as EventName;
  },
};

export { log, type Logger } from "./logger";

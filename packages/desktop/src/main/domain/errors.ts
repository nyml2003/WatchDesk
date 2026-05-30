export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export function ok<T>(value: T): { ok: true; value: T } {
  return { ok: true, value };
}

export function err<E>(error: E): { ok: false; error: E } {
  return { ok: false, error };
}

export type ErrorKind =
  | "NOT_FOUND"
  | "PERMISSION_DENIED"
  | "INVALID_INPUT"
  | "ALREADY_EXISTS"
  | "IO_ERROR"
  | "NATIVE_ERROR"
  | "UNKNOWN";

export type CounterError = {
  code: "COUNTER_ERROR";
  kind: ErrorKind;
  message: string;
  timestamp: number;
};

export type ReadError = {
  code: "FS_READ_ERROR";
  kind: ErrorKind;
  message: string;
  timestamp: number;
};

export type WriteError = {
  code: "FS_WRITE_ERROR";
  kind: ErrorKind;
  message: string;
  timestamp: number;
};

export type StatError = {
  code: "FS_STAT_ERROR";
  kind: ErrorKind;
  message: string;
  timestamp: number;
};

export type ListDirError = {
  code: "FS_LISTDIR_ERROR";
  kind: ErrorKind;
  message: string;
  timestamp: number;
};

export type WatchError = {
  code: "FS_WATCH_ERROR";
  kind: ErrorKind;
  message: string;
  timestamp: number;
};

export type GlobError = {
  code: "FS_GLOB_ERROR";
  kind: ErrorKind;
  message: string;
  timestamp: number;
};

export type InvalidInputError = {
  code: "INVALID_INPUT";
  kind: ErrorKind;
  message: string;
  timestamp: number;
};

export function counterError(message: string, kind: ErrorKind): CounterError {
  return { code: "COUNTER_ERROR", kind, message, timestamp: Date.now() };
}

export function readError(message: string, kind: ErrorKind = "IO_ERROR"): ReadError {
  return { code: "FS_READ_ERROR", kind, message, timestamp: Date.now() };
}

export function writeError(message: string, kind: ErrorKind = "IO_ERROR"): WriteError {
  return { code: "FS_WRITE_ERROR", kind, message, timestamp: Date.now() };
}

export function statError(message: string, kind: ErrorKind = "IO_ERROR"): StatError {
  return { code: "FS_STAT_ERROR", kind, message, timestamp: Date.now() };
}

export function listDirError(message: string, kind: ErrorKind = "IO_ERROR"): ListDirError {
  return { code: "FS_LISTDIR_ERROR", kind, message, timestamp: Date.now() };
}

export function watchError(message: string, kind: ErrorKind = "IO_ERROR"): WatchError {
  return { code: "FS_WATCH_ERROR", kind, message, timestamp: Date.now() };
}

export function globError(message: string, kind: ErrorKind = "INVALID_INPUT"): GlobError {
  return { code: "FS_GLOB_ERROR", kind, message, timestamp: Date.now() };
}

export function invalidInputError(message: string): InvalidInputError {
  return { code: "INVALID_INPUT", kind: "INVALID_INPUT", message, timestamp: Date.now() };
}

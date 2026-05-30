export type { Brand } from "@watchdesk/shared";

export {
  CounterId,
  FilePath,
  FileNodeId,
  FileName,
  TaskId,
  WorkflowId,
  EdgeId,
  HashHex,
  TimestampMs,
  ProcessId,
} from "./ids";

export type { Counter, FileNode, FileKind, FileStat, FileChangeEvent } from "./domain/entities";

export type { Result, CounterError, ErrorKind } from "./domain/errors";
export { ok, err } from "./domain/errors";
export {
  counterError,
  readError,
  writeError,
  statError,
  listDirError,
  watchError,
  globError,
  invalidInputError,
} from "./domain/errors";

export type { ICounterRepository } from "./domain/repositories";

export { CounterUseCase } from "./application/counter.usecase";

export { log } from "./logger";

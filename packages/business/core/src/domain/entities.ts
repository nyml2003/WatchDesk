import type {
  CounterId,
  FilePath,
  FileNodeId,
  FileName,
  ProcessId,
  TaskId,
  WorkflowId,
  EdgeId,
  HashHex,
  TimestampMs,
} from "../ids";

export type { Brand } from "@watchdesk/shared";
export type {
  CounterId,
  FilePath,
  FileNodeId,
  FileName,
  ProcessId,
  TaskId,
  WorkflowId,
  EdgeId,
  HashHex,
  TimestampMs,
};

export interface Counter {
  readonly id: CounterId;
  readonly value: number;
  readonly label: string;
}

export interface FileNode {
  readonly id: FileNodeId;
  readonly path: FilePath;
  readonly name: FileName;
  readonly kind: FileKind;
  readonly stat: FileStat;
}

export type FileKind = "file" | "directory" | "symlink";

export interface FileStat {
  readonly size: number;
  readonly mode: number;
  readonly modifiedAt: TimestampMs;
  readonly createdAt: TimestampMs;
  readonly accessedAt: TimestampMs;
  readonly isReadonly: boolean;
  readonly isHidden: boolean;
}

export interface FileChangeEvent {
  readonly path: FilePath;
  readonly kind: "created" | "modified" | "deleted" | "renamed";
  readonly oldPath?: FilePath;
  readonly timestamp: TimestampMs;
}

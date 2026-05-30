import type { Brand } from "@watchdesk/shared";
import { brand, brandN } from "@watchdesk/shared";

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

export const CounterId = brand<"CounterId">();
export const FilePath = brand<"FilePath">();
export const FileNodeId = brand<"FileNodeId">();
export const FileName = brand<"FileName">();
export const TaskId = brand<"TaskId">();
export const WorkflowId = brand<"WorkflowId">();
export const EdgeId = brand<"EdgeId">();
export const HashHex = brand<"HashHex">();
export const TimestampMs = brandN<"TimestampMs">();
export const ProcessId = brandN<"ProcessId">();

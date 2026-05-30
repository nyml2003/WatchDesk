export interface CounterValueDTO {
  value: number;
}

export interface FileEntryDTO {
  name: string;
  path: string;
  isDirectory: boolean;
}

export interface TerminalSpawnHandle {
  id: number;
  dispose(): void;
}

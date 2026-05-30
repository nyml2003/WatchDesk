export type Brand<T, B extends string> = T & { readonly __brand: B };

export type CounterId = Brand<string, "CounterId">;
export type EventName = Brand<string, "EventName">;

export const CounterId = {
  of(raw: string): CounterId {
    return raw as CounterId;
  },
};

export const EventName = {
  of(module: string, event: string): EventName {
    return `${module}:${event}` as EventName;
  },
};

export const IpcChannels = {
  COUNTER_INCREMENT: "counter:increment",
  COUNTER_DECREMENT: "counter:decrement",
  COUNTER_GET: "counter:get",
  COUNTER_RESET: "counter:reset",

  FS_READ_RAW: "fs:readRaw",
  FS_LIST_DIRECTORY: "fs:listDirectory",

  DIALOG_SELECT_DIRECTORY: "dialog:selectDirectory",

  TERMINAL_SPAWN: "terminal:spawn",
  TERMINAL_WRITE: "terminal:write",
  TERMINAL_RESIZE: "terminal:resize",
  TERMINAL_KILL: "terminal:kill",
} as const;

export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels];

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

export interface ElectronAPI {
  counter: {
    increment(id: string): Promise<CounterValueDTO>;
    decrement(id: string): Promise<CounterValueDTO>;
    get(id: string): Promise<CounterValueDTO>;
    reset(id: string): Promise<void>;
  };
  fs: {
    readRaw(path: string): Promise<Uint8Array>;
    listDirectory(path: string): Promise<FileEntryDTO[]>;
  };
  dialog: {
    selectDirectory(): Promise<string | null>;
  };
  terminal: {
    spawn(
      cols: number,
      rows: number,
      onData: (data: Uint8Array) => void,
    ): Promise<TerminalSpawnHandle>;
    write(id: number, data: string): Promise<void>;
    resize(id: number, cols: number, rows: number): Promise<void>;
    kill(id: number): Promise<void>;
  };
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export interface AppConfig {
  app: { name: string };
  nav: NavItem[];
  features: {
    counter: boolean;
    files: boolean;
    terminal: boolean;
    settings: boolean;
  };
}

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

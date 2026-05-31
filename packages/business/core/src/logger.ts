import type { Logger } from "@watchdesk/shared";

function createConsoleLogger(): Logger {
  return {
    error(...args: unknown[]) {
      console.error(new Date().toISOString(), ...args);
    },
    warn(...args: unknown[]) {
      console.warn(new Date().toISOString(), ...args);
    },
    info(...args: unknown[]) {
      console.info(new Date().toISOString(), ...args);
    },
    debug(...args: unknown[]) {
      console.debug(new Date().toISOString(), ...args);
    },
  };
}

export const log: Logger = createConsoleLogger();

export interface Logger {
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
  debug(...args: unknown[]): void;
}

function formatArgs(args: unknown[]): unknown[] {
  return [new Date().toISOString(), ...args];
}

function createConsoleLogger(): Logger {
  return {
    error(...args: unknown[]) {
      console.error(...formatArgs(args));
    },
    warn(...args: unknown[]) {
      console.warn(...formatArgs(args));
    },
    info(...args: unknown[]) {
      console.info(...formatArgs(args));
    },
    debug(...args: unknown[]) {
      console.debug(...formatArgs(args));
    },
  };
}

export const log: Logger = createConsoleLogger();

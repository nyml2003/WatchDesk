export interface SettingsService {
  terminalFont: string;
  terminalFontSize: number;
  resetTerminalSettings(): void;
}

export function assertSettingsService(obj: unknown): asserts obj is SettingsService {
  if (!obj || typeof obj !== "object") throw new Error("SettingsService: must be an object");
  const required = ["terminalFont", "terminalFontSize", "resetTerminalSettings"] as const;
  for (const m of required) {
    if (!(m in (obj as Record<string, unknown>))) {
      throw new Error(`SettingsService: missing property "${m}"`);
    }
  }
  if (typeof (obj as Record<string, unknown>).resetTerminalSettings !== "function") {
    throw new Error('SettingsService: "resetTerminalSettings" must be a function');
  }
}

import { settings as store } from "../core/settings-store";

export const settingsService = {
  get terminalFont(): string {
    return store.terminalFont;
  },
  set terminalFont(value: string) {
    store.terminalFont = value;
  },
  get terminalFontSize(): number {
    return store.terminalFontSize;
  },
  set terminalFontSize(value: number) {
    store.terminalFontSize = value;
  },
  resetTerminalSettings(): void {
    store.reset("terminalFont");
    store.reset("terminalFontSize");
  },
};

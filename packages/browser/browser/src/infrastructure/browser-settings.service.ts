const PREFIX = "watchdesk:settings:";

function getString(key: string, fallback: string): string {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw !== null ? raw : fallback;
  } catch {
    return fallback;
  }
}

function getNumber(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw !== null ? Number(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setValue(key: string, value: string | number): void {
  try {
    localStorage.setItem(PREFIX + key, String(value));
  } catch {
    /* ignore */
  }
}

const defaults = {
  terminalFont: [
    '"CaskaydiaCove Nerd Font"',
    '"MesloLGS NF"',
    '"FiraCode Nerd Font"',
    '"JetBrainsMono Nerd Font"',
    '"Cascadia Code"',
    '"Consolas"',
    "monospace",
  ].join(", "),
  terminalFontSize: 14,
} as const;

export class BrowserSettingsService {
  get terminalFont(): string {
    return getString("terminalFont", defaults.terminalFont);
  }
  set terminalFont(value: string) {
    setValue("terminalFont", value);
  }
  get terminalFontSize(): number {
    return getNumber("terminalFontSize", defaults.terminalFontSize);
  }
  set terminalFontSize(value: number) {
    setValue("terminalFontSize", value);
  }
  resetTerminalSettings(): void {
    setValue("terminalFont", defaults.terminalFont);
    setValue("terminalFontSize", defaults.terminalFontSize);
  }
}

import { createSignal } from "solid-js";

export interface SettingsService {
  terminalFont: string;
  terminalFontSize: number;
  resetTerminalSettings(): void;
}

interface SettingsPageProps {
  settingsService: SettingsService;
}

export function SettingsPage(props: SettingsPageProps) {
  const [font, setFont] = createSignal(props.settingsService.terminalFont);
  const [fontSize, setFontSize] = createSignal(String(props.settingsService.terminalFontSize));
  const [saved, setSaved] = createSignal(false);

  const handleSave = () => {
    props.settingsService.terminalFont = font();
    props.settingsService.terminalFontSize = Number(fontSize()) || 14;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    props.settingsService.resetTerminalSettings();
    setFont(props.settingsService.terminalFont);
    setFontSize(String(props.settingsService.terminalFontSize));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: "24px" }}>
      <div>
        <h2 style={{ "font-size": "20px", "font-weight": "600", "margin-bottom": "24px" }}>设置</h2>

        <section style={{ "margin-bottom": "24px" }}>
          <h3 style={{ "font-size": "16px", "font-weight": "500", "margin-bottom": "16px" }}>
            终端
          </h3>

          <label style={{ display: "flex", "flex-direction": "column", "margin-bottom": "16px" }}>
            <span style={{ "margin-bottom": "4px", "font-size": "14px" }}>字体</span>
            <input
              type="text"
              value={font()}
              onInput={(event) => setFont(event.currentTarget.value)}
              placeholder="Cascadia Code, monospace"
              style={{
                padding: "8px",
                "border-radius": "4px",
                border: "1px solid var(--wd-colors-border)",
                background: "var(--wd-colors-surface)",
                color: "var(--wd-colors-text)",
                "font-size": "14px",
              }}
            />
            <span style={{ "font-size": "12px", "margin-top": "4px", opacity: 0.6 }}>
              多个字体用逗号分隔，按优先级排列。推荐安装 Nerd Font。
            </span>
          </label>

          <label style={{ display: "flex", "flex-direction": "column", "margin-bottom": "16px" }}>
            <span style={{ "margin-bottom": "4px", "font-size": "14px" }}>字号</span>
            <input
              type="number"
              value={fontSize()}
              onInput={(event) => setFontSize(event.currentTarget.value)}
              min="10"
              max="32"
              style={{
                width: "80px",
                padding: "8px",
                "border-radius": "4px",
                border: "1px solid var(--wd-colors-border)",
                background: "var(--wd-colors-surface)",
                color: "var(--wd-colors-text)",
                "font-size": "14px",
              }}
            />
          </label>

          <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
            <button
              onClick={handleSave}
              style={{
                padding: "8px 16px",
                "border-radius": "4px",
                background: "var(--wd-colors-accent)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              保存
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: "8px 16px",
                "border-radius": "4px",
                background: "transparent",
                color: "var(--wd-colors-text)",
                border: "1px solid var(--wd-colors-border)",
                cursor: "pointer",
              }}
            >
              恢复默认
            </button>
            {saved() && (
              <span style={{ "font-size": "14px", color: "var(--wd-colors-accent)" }}>已保存</span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

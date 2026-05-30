import { createSignal } from "solid-js";
import styles from "../../styles/settings.module.css";
import pageStyles from "../../styles/page.module.css";
import { settingsService } from "./settings.service";

export function SettingsPage() {
  const [font, setFont] = createSignal(settingsService.terminalFont);
  const [fontSize, setFontSize] = createSignal(String(settingsService.terminalFontSize));
  const [saved, setSaved] = createSignal(false);

  const handleSave = () => {
    settingsService.terminalFont = font();
    settingsService.terminalFontSize = Number(fontSize()) || 14;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    settingsService.resetTerminalSettings();
    setFont(settingsService.terminalFont);
    setFontSize(String(settingsService.terminalFontSize));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div class={pageStyles["content"]}>
      <div class={styles["settings"]}>
        <h2 class={styles["title"]}>设置</h2>

        <section class={styles["section"]}>
          <h3 class={styles["sectionTitle"]}>终端</h3>

          <label class={styles["field"]}>
            <span class={styles["label"]}>字体</span>
            <input
              type="text"
              class={styles["input"]}
              value={font()}
              onInput={(event) => setFont(event.currentTarget.value)}
              placeholder="Cascadia Code, monospace"
            />
            <span class={styles["hint"]}>
              多个字体用逗号分隔，按优先级排列。推荐安装 Nerd Font 以获得完整 glyph 支持。
            </span>
          </label>

          <label class={styles["field"]}>
            <span class={styles["label"]}>字号</span>
            <input
              type="number"
              class={styles["input"]}
              value={fontSize()}
              onInput={(event) => setFontSize(event.currentTarget.value)}
              min="10"
              max="32"
              style={{ width: "80px" }}
            />
          </label>

          <div class={styles["actions"]}>
            <button class={styles["btn"]} onClick={handleSave}>
              保存
            </button>
            <button class={styles["btnSecondary"]} onClick={handleReset}>
              恢复默认
            </button>
            {saved() && <span class={styles["success"]}>已保存</span>}
          </div>
        </section>
      </div>
    </div>
  );
}

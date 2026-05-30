import { createSignal } from "solid-js";
import type { PageDefinition } from "../page-definition";
import styles from "../styles/settings.module.css";

export const PAGE_ID = "settings";

export function createSettingsPage(settingsService: SettingsService): PageDefinition {
  return {
    id: PAGE_ID,
    label: "设置",
    icon: "⚙",
    render: () => <SettingsPage settingsService={settingsService} />,
  };
}

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
    <div class={styles.settings}>
      <h2 class={styles.title}>设置</h2>

      <section>
        <h3 class={styles.sectionTitle}>终端</h3>

        <label class={styles.field}>
          <span class={styles.label}>字体</span>
          <input
            type="text"
            class={styles.input}
            value={font()}
            onInput={(event) => setFont(event.currentTarget.value)}
            placeholder="Cascadia Code, monospace"
          />
          <span class={styles.hint}>多个字体用逗号分隔，按优先级排列。推荐安装 Nerd Font。</span>
        </label>

        <label class={styles.field}>
          <span class={styles.label}>字号</span>
          <input
            type="number"
            class={styles.inputSmall}
            value={fontSize()}
            onInput={(event) => setFontSize(event.currentTarget.value)}
            min="10"
            max="32"
          />
        </label>

        <div class={styles.actions}>
          <button class={styles.btn} onClick={handleSave}>
            保存
          </button>
          <button class={styles.btnSecondary} onClick={handleReset}>
            恢复默认
          </button>
          {saved() && <span class={styles.saved}>已保存</span>}
        </div>
      </section>
    </div>
  );
}

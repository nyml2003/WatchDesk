import styles from "./page.module.css";

export function SettingsPage() {
  return (
    <div class={styles["content"]}>
      <h2>设置</h2>
      <p style={{ color: "var(--wd-colors-text-muted)", "margin-top": "1rem" }}>
        设置页面将在后续版本中实现。
      </p>
    </div>
  );
}

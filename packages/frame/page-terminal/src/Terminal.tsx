import { createSignal } from "solid-js";
import { useTerminalView } from "@watchdesk/shell";
import styles from "../styles/terminal.module.css";

export function TerminalPage() {
  let containerRef!: HTMLDivElement;
  const { TerminalView } = useTerminalView();
  const [copyToast, setCopyToast] = createSignal(false);
  const [mounted, setMounted] = createSignal(false);

  const showCopyToast = () => {
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 1500);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText("");
    showCopyToast();
  };

  return (
    <div class={styles.terminal}>
      <div class={styles.toolbar}>
        <span class={styles.toolbarHint}>Ctrl+Shift+C 复制 &nbsp;|&nbsp; Ctrl+Shift+V 粘贴</span>
        <button
          class={styles.toolbarBtn}
          onClick={() => {
            handleCopy().catch(() => {});
          }}
        >
          复制
        </button>
      </div>
      {TerminalView ? (
        <div
          ref={(el) => {
            containerRef = el;
            setMounted(true);
          }}
          class={styles.terminalContainer}
        >
          {mounted() && <TerminalView containerRef={containerRef} />}
        </div>
      ) : (
        <div class={styles.terminalNotAvailable}>Terminal is not available in browser mode</div>
      )}
      {copyToast() && <div class={styles.copyToast}>已复制到剪贴板</div>}
    </div>
  );
}

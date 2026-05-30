import { createSignal } from "solid-js";
import { useTerminalView } from "../context/terminal-view.context";
import type { PageDefinition } from "../page-definition";
import styles from "../styles/terminal.module.css";

export const PAGE_ID = "terminal";

export function createTerminalPage(): PageDefinition {
  return {
    id: PAGE_ID,
    label: "终端",
    icon: "⚡",
    render: () => <TerminalPage clipboard={navigator.clipboard} />,
  };
}

export interface TerminalService {
  spawn(
    cols: number,
    rows: number,
    onData: (data: Uint8Array) => void,
  ): Promise<{ id: number; dispose(): void }>;
  write(id: number, data: string): Promise<void>;
  resize(id: number, cols: number, rows: number): Promise<void>;
  kill(id: number): Promise<void>;
}

interface TerminalPageProps {
  clipboard: {
    writeText(text: string): Promise<void>;
  };
}

export function TerminalPage(props: TerminalPageProps) {
  let containerRef!: HTMLDivElement;
  const { TerminalView } = useTerminalView();
  const [copyToast, setCopyToast] = createSignal(false);
  const [mounted, setMounted] = createSignal(false);

  const showCopyToast = () => {
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 1500);
  };

  const handleCopy = async () => {
    await props.clipboard.writeText("");
    showCopyToast();
  };

  return (
    <div class={styles.terminal}>
      <div class={styles.toolbar}>
        <span class={styles.toolbarHint}>Ctrl+Shift+C 复制 &nbsp;|&nbsp; Ctrl+Shift+V 粘贴</span>
        <button class={styles.toolbarBtn} onClick={handleCopy}>
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

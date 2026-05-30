import { createSignal } from "solid-js";
import { useTerminalView } from "../context/terminal-view.context";

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
    <div
      style={{
        position: "relative",
        padding: "0",
        height: "100%",
        display: "flex",
        "flex-direction": "column",
      }}
    >
      <div
        style={{
          display: "flex",
          "align-items": "center",
          padding: "4px 12px",
          "border-bottom": "1px solid var(--wd-colors-border)",
          background: "var(--wd-colors-surface)",
        }}
      >
        <span
          style={{
            "font-size": "12px",
            color: "var(--wd-colors-text-muted)",
            flex: 1,
          }}
        >
          Ctrl+Shift+C 复制 &nbsp;|&nbsp; Ctrl+Shift+V 粘贴
        </span>
        <button onClick={handleCopy} style={{ "font-size": "12px" }}>
          复制
        </button>
      </div>
      {TerminalView ? (
        <div
          ref={(el) => {
            containerRef = el;
            setMounted(true);
          }}
          style={{ flex: 1, overflow: "hidden" }}
        >
          {mounted() && <TerminalView containerRef={containerRef} />}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            opacity: 0.5,
            "font-size": "14px",
          }}
        >
          Terminal is not available in browser mode
        </div>
      )}
      {copyToast() && (
        <div
          style={{
            position: "absolute",
            top: "48px",
            right: "12px",
            padding: "6px 14px",
            background: "var(--wd-colors-accent)",
            color: "#fff",
            "border-radius": "4px",
            "font-size": "13px",
            "z-index": "10",
            opacity: 0.95,
          }}
        >
          已复制到剪贴板
        </div>
      )}
    </div>
  );
}

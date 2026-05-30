import { onMount, onCleanup, createEffect, on, createSignal } from "solid-js";
import { Terminal as Xterm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import styles from "./terminal.module.css";
import pageStyles from "./page.module.css";
import { settingsService } from "../services/settings.service";
import { terminalService } from "../services/terminal.service";
import { log } from "@watchdesk/shared";
import "@xterm/xterm/css/xterm.css";

const darkTheme = {
  background: "#1a1b2e",
  foreground: "#e2e4f0",
  cursor: "#6366f1",
  selectionBackground: "#3a3d5c",
};

const lightTheme = {
  background: "#ffffff",
  foreground: "#1d1d1f",
  cursor: "#0071e3",
  selectionBackground: "#dcdce0",
};

interface TerminalPageProps {
  theme: "light" | "dark";
}

export function TerminalPage(props: TerminalPageProps) {
  let container!: HTMLDivElement;
  let xterm: Xterm | null = null;
  let fitAddon: FitAddon | null = null;
  let ptyId: number | null = null;
  let dispose: (() => void) | null = null;
  const [copyToast, setCopyToast] = createSignal(false);

  const showCopyToast = () => {
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 1500);
  };

  const handleCopy = async () => {
    if (!xterm) return;
    const sel = xterm.getSelection();
    if (sel) {
      await navigator.clipboard.writeText(sel);
      showCopyToast();
    }
  };

  createEffect(
    on(
      () => props.theme,
      (t) => {
        if (xterm) {
          xterm.options.theme = t === "dark" ? darkTheme : lightTheme;
        }
      },
    ),
  );

  onMount(() => {
    xterm = new Xterm({
      theme: props.theme === "dark" ? darkTheme : lightTheme,
      fontSize: settingsService.terminalFontSize,
      fontFamily: settingsService.terminalFont,
      cursorBlink: true,
      allowProposedApi: true,
    });

    fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(container);

    const doFit = () => {
      if (!fitAddon) return;
      try {
        fitAddon.fit();
      } catch {
        /* ignore */
      }
    };
    setTimeout(doFit, 100);

    const resizeObserver = new ResizeObserver(() => {
      doFit();
      if (ptyId !== null && xterm) {
        terminalService.resize(ptyId, xterm.cols, xterm.rows).catch(() => {});
      }
    });
    resizeObserver.observe(container);

    terminalService
      .spawn(xterm.cols, xterm.rows, (data) => xterm?.write(data))
      .then((result) => {
        ptyId = result.id;
        dispose = () => {
          result.dispose();
        };
      })
      .catch((err: unknown) => {
        log.error(err);
      });

    xterm.onData((data) => {
      if (ptyId !== null) {
        terminalService.write(ptyId, data).catch(() => {});
      }
    });

    xterm.attachCustomKeyEventHandler((e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        handleCopy().catch(() => {});
        return false;
      }
      return true;
    });

    onCleanup(() => {
      resizeObserver.disconnect();
      const id = ptyId;
      ptyId = null;
      dispose?.();
      dispose = null;
      xterm?.dispose();
      if (id !== null) {
        terminalService.kill(id).catch(() => {});
      }
    });
  });

  return (
    <div class={pageStyles["content"]} style={{ position: "relative", padding: "0" }}>
      <div
        style={{
          display: "flex",
          "align-items": "center",
          padding: "4px 12px",
          "border-bottom": "1px solid var(--wd-colors-border)",
          background: "var(--wd-colors-surface)",
        }}
      >
        <span style={{ "font-size": "12px", color: "var(--wd-colors-text-muted)", flex: 1 }}>
          Ctrl+Shift+C 复制 &nbsp;|&nbsp; Ctrl+Shift+V 粘贴
        </span>
        <button onClick={handleCopy} style={{ "font-size": "12px" }}>
          复制
        </button>
      </div>
      <div
        class={styles["terminal"]}
        ref={(el) => {
          container = el;
        }}
      />
      {copyToast() && (
        <div
          style={{
            position: "absolute",
            top: "48px",
            right: "12px",
            padding: "6px 14px",
            background: "var(--wd-colors-accent)",
            color: "#fff",
            "border-radius": "var(--wd-radii-md)",
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

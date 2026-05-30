import { onCleanup, onMount } from "solid-js";
import { Terminal as Xterm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { settingsService } from "../infrastructure/settings.service";
import { ElectronTerminalService } from "../infrastructure/electron-terminal.service";

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

function getTheme(): "light" | "dark" {
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
}

interface XtermTerminalProps {
  containerRef: HTMLElement;
}

export function XtermTerminalView(props: XtermTerminalProps) {
  let xterm: Xterm | null = null;
  let fitAddon: FitAddon | null = null;
  let ptyId: number | null = null;
  let dispose: (() => void) | null = null;

  const terminalService = new ElectronTerminalService();

  const handleCopy = async () => {
    if (!xterm) return;
    const selection = xterm.getSelection();
    if (selection) {
      await navigator.clipboard.writeText(selection);
    }
  };

  onMount(() => {
    xterm = new Xterm({
      theme: getTheme() === "dark" ? darkTheme : lightTheme,
      fontSize: settingsService.terminalFontSize,
      fontFamily: settingsService.terminalFont,
      cursorBlink: true,
      allowProposedApi: true,
    });

    fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(props.containerRef);

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
    resizeObserver.observe(props.containerRef);

    terminalService
      .spawn(xterm.cols, xterm.rows, (data) => xterm?.write(data))
      .then((result) => {
        ptyId = result.id;
        dispose = () => {
          result.dispose();
        };
      })
      .catch(() => {});

    xterm.onData((data) => {
      if (ptyId !== null) {
        terminalService.write(ptyId, data).catch(() => {});
      }
    });

    xterm.attachCustomKeyEventHandler((event) => {
      if (event.ctrlKey && event.shiftKey && event.key === "C") {
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

  return null;
}

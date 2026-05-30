import { createSignal, For } from "solid-js";
import type { FileEntryDTO } from "@watchdesk/contracts";

export interface FileSystemService {
  selectDirectory(): Promise<string | null>;
  readRaw(path: string): Promise<Uint8Array>;
  listDirectory(path: string): Promise<FileEntryDTO[]>;
}

interface MarkdownReaderPageProps {
  fsService: FileSystemService;
}

export function MarkdownReaderPage(props: MarkdownReaderPageProps) {
  const [currentDir, setCurrentDir] = createSignal("");
  const [entries, setEntries] = createSignal<FileEntryDTO[]>([]);
  const [selectedFile, setSelectedFile] = createSignal("");
  const [selectedFileName, setSelectedFileName] = createSignal("");
  const [fileContent, setFileContent] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const loadDirectory = async (dir: string) => {
    setLoading(true);
    setCurrentDir(dir);
    try {
      const result = await props.fsService.listDirectory(dir);
      const files = result
        .filter((entry) => entry.isDirectory || entry.name.endsWith(".md"))
        .sort((a, b) => {
          if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      setEntries(files);
    } catch (err) {
      console.error("Failed to list directory:", err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDirectory = async () => {
    try {
      const dir = await props.fsService.selectDirectory();
      if (dir) {
        await loadDirectory(dir);
        setSelectedFile("");
        setFileContent("");
      }
    } catch (err) {
      console.error("Failed to select directory:", err);
    }
  };

  const handleClickEntry = async (entry: FileEntryDTO) => {
    if (entry.isDirectory) {
      await loadDirectory(entry.path);
      return;
    }

    setLoading(true);
    try {
      const data = await props.fsService.readRaw(entry.path);
      const content = new TextDecoder().decode(data);
      setSelectedFile(entry.path);
      setSelectedFileName(entry.name);
      setFileContent(content);
    } catch (err) {
      console.error("Failed to read file:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedFile("");
    setSelectedFileName("");
    setFileContent("");
  };

  const styles = {
    splitPanel: { display: "flex", height: "100%", "min-height": "0" },
    fileListPanel: {
      width: "280px",
      "border-right": "1px solid var(--wd-colors-border)",
      display: "flex",
      "flex-direction": "column",
    },
    fileList: { flex: 1, overflow: "auto", padding: "8px 0" },
    fileItem: {
      display: "flex",
      "align-items": "center",
      gap: "8px",
      padding: "6px 12px",
      cursor: "pointer",
      border: "none",
      background: "transparent",
      color: "var(--wd-colors-text)",
      width: "100%",
      "text-align": "left",
      "font-size": "14px",
    },
    directoryItem: {
      display: "flex",
      "align-items": "center",
      gap: "8px",
      padding: "6px 12px",
      cursor: "pointer",
      border: "none",
      background: "transparent",
      color: "var(--wd-colors-text)",
      width: "100%",
      "text-align": "left",
      "font-size": "14px",
    },
    fileContentPanel: {
      flex: 1,
      display: "flex",
      "flex-direction": "column",
      "min-width": "0",
    },
    toolbar: {
      display: "flex",
      "align-items": "center",
      gap: "8px",
      padding: "8px 12px",
      "border-bottom": "1px solid var(--wd-colors-border)",
      "font-size": "13px",
    },
    currentPath: {
      flex: 1,
      overflow: "hidden",
      "text-overflow": "ellipsis",
      "white-space": "nowrap",
      "font-size": "12px",
      opacity: 0.7,
    },
    contentPre: {
      flex: 1,
      margin: 0,
      padding: "16px",
      overflow: "auto",
      "font-size": "14px",
      "line-height": "1.6",
      "white-space": "pre-wrap",
      "word-break": "break-word",
    },
    emptyHint: {
      padding: "24px",
      "text-align": "center",
      opacity: 0.5,
      "font-size": "14px",
    },
  } as const;

  return (
    <div style={{ padding: "0", height: "100%", display: "flex", "flex-direction": "column" }}>
      <div style={styles.splitPanel}>
        <div style={styles.fileListPanel}>
          <div style={styles.toolbar}>
            <span style={styles.currentPath}>{currentDir()}</span>
            <button
              onClick={() => {
                handleSelectDirectory().catch(() => {});
              }}
            >
              选择目录
            </button>
            <button
              onClick={() => {
                loadDirectory(currentDir()).catch(() => {});
              }}
            >
              刷新
            </button>
          </div>
          {!loading() && entries().length === 0 ? (
            <div style={styles.emptyHint}>当前目录没有 Markdown 文件</div>
          ) : (
            <div style={styles.fileList}>
              <For each={entries()}>
                {(entry) => (
                  <button
                    style={{
                      ...(entry.isDirectory ? styles.directoryItem : styles.fileItem),
                      ...(selectedFile() === entry.path
                        ? { background: "var(--wd-colors-surface-active)" }
                        : {}),
                    }}
                    onClick={() => {
                      handleClickEntry(entry).catch(() => {});
                    }}
                  >
                    <span>{entry.isDirectory ? "📁" : "📄"}</span>
                    <span>{entry.name}</span>
                  </button>
                )}
              </For>
            </div>
          )}
        </div>

        <div style={styles.fileContentPanel}>
          {selectedFile() ? (
            <>
              <div style={styles.toolbar}>
                <button onClick={handleBack}>← 返回列表</button>
                <span style={styles.currentPath}>{selectedFileName()}</span>
              </div>
              <pre style={styles.contentPre}>{fileContent()}</pre>
            </>
          ) : (
            <div style={styles.emptyHint}>选择左侧文件以查看内容</div>
          )}
        </div>
      </div>
    </div>
  );
}

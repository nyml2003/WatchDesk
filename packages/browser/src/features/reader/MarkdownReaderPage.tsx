import { createSignal, For } from "solid-js";
import type { FileEntryDTO } from "@watchdesk/contracts";
import styles from "../../styles/reader.module.css";
import pageStyles from "../../styles/page.module.css";
import { fsService } from "./file-system.service";

export function MarkdownReaderPage() {
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
      const result = await fsService.listDirectory(dir);
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
      const dir = await fsService.selectDirectory();
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
      const data = await fsService.readRaw(entry.path);
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

  return (
    <div class={pageStyles["content"]}>
      <div class={styles["splitPanel"]}>
        <div class={styles["fileListPanel"]}>
          <div class={styles["toolbar"]}>
            <span class={styles["currentPath"]}>{currentDir()}</span>
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
            <div class={styles["emptyHint"]}>当前目录没有 Markdown 文件</div>
          ) : (
            <div class={styles["fileList"]}>
              <For each={entries()}>
                {(entry) => (
                  <button
                    class={entry.isDirectory ? styles["directoryItem"] : styles["fileItem"]}
                    style={
                      selectedFile() === entry.path
                        ? { background: "var(--wd-colors-surface-active)" }
                        : undefined
                    }
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

        <div class={styles["fileContentPanel"]}>
          {selectedFile() ? (
            <>
              <div class={styles["toolbar"]}>
                <button onClick={handleBack}>← 返回列表</button>
                <span class={styles["currentPath"]}>{selectedFileName()}</span>
              </div>
              <pre class={styles["contentPre"]}>{fileContent()}</pre>
            </>
          ) : (
            <div class={styles["emptyHint"]}>选择左侧文件以查看内容</div>
          )}
        </div>
      </div>
    </div>
  );
}

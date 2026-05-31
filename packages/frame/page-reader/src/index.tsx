import type { PageDefinition } from "@watchdesk/shell";
import type { FileSystemService } from "./types";
import { assertFileSystemService } from "./types";
import { MarkdownReaderPage } from "./MarkdownReader";

export function createMarkdownReaderPage(service: unknown): PageDefinition {
  assertFileSystemService(service);
  return {
    id: "files",
    label: "文件",
    icon: "📄",
    render: () => <MarkdownReaderPage fsService={service} />,
  };
}

export type { FileSystemService };

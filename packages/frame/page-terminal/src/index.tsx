import type { PageDefinition } from "@watchdesk/shell";
import { TerminalPage } from "./Terminal";

export function createTerminalPage(): PageDefinition {
  return {
    id: "terminal",
    label: "终端",
    icon: "⚡",
    render: () => <TerminalPage />,
  };
}

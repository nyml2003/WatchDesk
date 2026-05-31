import type { PageDefinition } from "@watchdesk/shell";
import type { SettingsService } from "./types";
import { assertSettingsService } from "./types";
import { SettingsPage } from "./Settings";

export function createSettingsPage(service: unknown): PageDefinition {
  assertSettingsService(service);
  return {
    id: "settings",
    label: "设置",
    icon: "⚙",
    render: () => <SettingsPage settingsService={service} />,
  };
}

export type { SettingsService };

import type { PageDefinition } from "@watchdesk/shell";
import type { CounterService } from "./types";
import { assertCounterService } from "./types";
import { DashboardPage } from "./Dashboard";

export function createDashboardPage(service: unknown): PageDefinition {
  assertCounterService(service);
  return {
    id: "dashboard",
    label: "仪表盘",
    icon: "📊",
    render: () => <DashboardPage counterService={service} />,
  };
}

export type { CounterService };

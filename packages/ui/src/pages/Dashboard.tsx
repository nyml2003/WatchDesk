import type { CounterService } from "../components/WatchCounter";
import { WatchCounter } from "../components/WatchCounter";
import type { PageDefinition } from "../page-definition";
import styles from "../styles/dashboard.module.css";

export const PAGE_ID = "dashboard";

export function createDashboardPage(counterService: CounterService): PageDefinition {
  return {
    id: PAGE_ID,
    label: "仪表盘",
    icon: "📊",
    render: () => <DashboardPage counterService={counterService} />,
  };
}

interface DashboardPageProps {
  counterService: CounterService;
}

export function DashboardPage(props: DashboardPageProps) {
  return (
    <div class={styles.dashboard}>
      <WatchCounter service={props.counterService} label="WatchDesk Counter" />
    </div>
  );
}

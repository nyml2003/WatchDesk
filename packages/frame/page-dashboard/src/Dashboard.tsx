import type { CounterService } from "./types";
import { WatchCounter } from "./WatchCounter";
import styles from "../styles/dashboard.module.css";

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

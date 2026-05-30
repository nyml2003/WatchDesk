import type { CounterService } from "../components/WatchCounter";
import { WatchCounter } from "../components/WatchCounter";

interface DashboardPageProps {
  counterService: CounterService;
}

export function DashboardPage(props: DashboardPageProps) {
  return (
    <div style={{ padding: "24px" }}>
      <WatchCounter service={props.counterService} label="WatchDesk Counter" />
    </div>
  );
}

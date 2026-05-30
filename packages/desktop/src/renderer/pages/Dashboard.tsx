import { WatchCounter } from "../components/watch-counter";
import type { Dependencies } from "../infrastructure/di";
import styles from "./page.module.css";

interface DashboardProps {
  deps: Dependencies;
}

export function Dashboard(props: DashboardProps) {
  return (
    <div class={styles["content"]}>
      <WatchCounter useCase={props.deps.counterUseCase} label="WatchDesk Counter" />
    </div>
  );
}

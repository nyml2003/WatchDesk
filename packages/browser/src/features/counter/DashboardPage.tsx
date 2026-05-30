import styles from "../../styles/page.module.css";
import type { Dependencies } from "../../infrastructure/di";
import { WatchCounter } from "./WatchCounter";

interface DashboardPageProps {
  deps: Dependencies;
}

export function DashboardPage(props: DashboardPageProps) {
  return (
    <div class={styles["content"]}>
      <WatchCounter useCase={props.deps.counterUseCase} label="WatchDesk Counter" />
    </div>
  );
}

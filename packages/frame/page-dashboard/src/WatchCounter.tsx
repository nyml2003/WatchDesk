import { createSignal, onMount } from "solid-js";
import type { CounterService } from "./types";
import styles from "../styles/counter.module.css";

interface CounterProps {
  service: CounterService;
  label: string;
}

export function WatchCounter(props: CounterProps) {
  const [count, setCount] = createSignal(0);

  onMount(() => {
    (async () => {
      const initial = await props.service.getValue();
      setCount(initial);
    })().catch(() => {});
  });

  const handleIncrement = async () => {
    const newValue = await props.service.increment();
    setCount(newValue);
  };

  const handleDecrement = async () => {
    const newValue = await props.service.decrement();
    setCount(newValue);
  };

  const handleReset = async () => {
    await props.service.reset();
    setCount(0);
  };

  return (
    <div class={styles.counter}>
      <span class={styles.label}>{props.label}</span>
      <span class={styles.value} data-testid="counter-value">
        {count()}
      </span>
      <div class={styles.buttons}>
        <button
          class={styles.button}
          onClick={() => {
            handleDecrement().catch(() => {});
          }}
        >
          -
        </button>
        <button
          class={styles.button}
          onClick={() => {
            handleReset().catch(() => {});
          }}
        >
          Reset
        </button>
        <button
          class={styles.button}
          onClick={() => {
            handleIncrement().catch(() => {});
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

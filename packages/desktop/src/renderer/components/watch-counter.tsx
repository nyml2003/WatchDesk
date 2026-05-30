import { createSignal, onMount } from "solid-js";
import type { CounterUseCase } from "../application/counter.usecase";
import styles from "./watch-counter.module.css";

interface CounterProps {
  useCase: CounterUseCase;
  label: string;
}

export function WatchCounter(props: CounterProps) {
  const [count, setCount] = createSignal(0);

  onMount(async () => {
    const initial = await props.useCase.getValue();
    setCount(initial);
  });

  const handleIncrement = async () => {
    const newValue = await props.useCase.increment();
    setCount(newValue);
  };

  const handleDecrement = async () => {
    const newValue = await props.useCase.decrement();
    setCount(newValue);
  };

  const handleReset = async () => {
    await props.useCase.reset();
    setCount(0);
  };

  return (
    <div class={styles["counter"]}>
      <span class={styles["label"]}>{props.label}</span>
      <span class={styles["value"]}>{count()}</span>
      <div class={styles["buttons"]}>
        <button class={styles["button"]} onClick={handleDecrement}>
          -
        </button>
        <button class={styles["button"]} onClick={handleReset}>
          Reset
        </button>
        <button class={styles["button"]} onClick={handleIncrement}>
          +
        </button>
      </div>
    </div>
  );
}

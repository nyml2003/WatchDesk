import { createSignal, onMount } from "solid-js";

export interface CounterService {
  getValue(): Promise<number>;
  increment(): Promise<number>;
  decrement(): Promise<number>;
  reset(): Promise<void>;
}

interface CounterProps {
  service: CounterService;
  label: string;
}

export function WatchCounter(props: CounterProps) {
  const [count, setCount] = createSignal(0);

  onMount(async () => {
    const initial = await props.service.getValue();
    setCount(initial);
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
    <div class="counter">
      <span class="label">{props.label}</span>
      <span class="value" data-testid="counter-value">
        {count()}
      </span>
      <div class="buttons">
        <button class="button" onClick={handleDecrement}>
          -
        </button>
        <button class="button" onClick={handleReset}>
          Reset
        </button>
        <button class="button" onClick={handleIncrement}>
          +
        </button>
      </div>
    </div>
  );
}

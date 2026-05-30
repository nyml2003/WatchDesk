import { render } from "solid-js/web";
import { createSignal } from "solid-js";
import { createDependencies } from "./infrastructure/di";
import { WatchCounter } from "./components/watch-counter";
import "./tokens.css";
import "./global.css";

document.documentElement.setAttribute("data-theme", "dark");

const deps = createDependencies();

function App() {
  const [theme, setTheme] = createSignal<"light" | "dark">("dark");

  const toggleTheme = () => {
    const next = theme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
  };

  return (
    <>
      <WatchCounter useCase={deps.counterUseCase} label="WatchDesk Counter" />
      <button
        onClick={toggleTheme}
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          padding: "0.5rem 1rem",
          cursor: "pointer",
          background: "var(--wd-colors-surface)",
          color: "var(--wd-colors-text-secondary)",
          border: "1px solid var(--wd-colors-border)",
          "border-radius": "var(--wd-radii-md)",
        }}
      >
        {theme() === "dark" ? "☀" : "☾"}
      </button>
    </>
  );
}

const root = document.getElementById("app");
if (!root) throw new Error("Root element #app not found");
render(() => <App />, root);

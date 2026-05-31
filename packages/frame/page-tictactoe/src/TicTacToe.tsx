import { createSignal } from "solid-js";
import styles from "../styles/tictactoe.module.css";

type Cell = "X" | "O" | null;
type Board = readonly Cell[];

const emptyBoard = (): Board => Array<Cell>(9).fill(null);

const lines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

function checkWinner(board: Board): Cell {
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function isDraw(board: Board): boolean {
  return board.every((c) => c !== null);
}

function makeMove(board: Board, pos: number, player: "X" | "O"): Board {
  if (board[pos] !== null) return board;
  const next = [...board];
  next[pos] = player;
  return next;
}

type GameStatus = "playing" | "won" | "draw";

export function TicTacToePage() {
  const [board, setBoard] = createSignal<Board>(emptyBoard());
  const [player, setPlayer] = createSignal<"X" | "O">("X");
  const winner = () => checkWinner(board());
  const status = (): GameStatus => {
    const w = winner();
    if (w) return "won";
    if (isDraw(board())) return "draw";
    return "playing";
  };

  const handleClick = (pos: number) => {
    if (status() !== "playing") return;
    const next = makeMove(board(), pos, player());
    if (next === board()) return;
    setBoard(next);
    setPlayer((p) => (p === "X" ? "O" : "X"));
  };

  const handleReset = () => {
    setBoard(emptyBoard());
    setPlayer("X");
  };

  const statusText = () => {
    const s = status();
    const w = winner();
    if (s === "won" && w) return `${w} 获胜！`;
    if (s === "draw") return "平局";
    return `当前回合: ${player()}`;
  };

  return (
    <div class={styles.page}>
      <h2 class={styles.title}>井字棋</h2>
      <div class={status() === "won" ? styles.statusActive : styles.statusMuted}>
        {statusText()}
      </div>
      <div class={styles.grid}>
        {board().map((cell, i) => (
          <button
            class={cell === null ? `${styles.cell} ${styles.cellHover}` : styles.cell}
            onClick={() => {
              handleClick(i);
            }}
          >
            {cell ?? ""}
          </button>
        ))}
      </div>
      <button class={styles.resetBtn} onClick={handleReset}>
        新对局
      </button>
    </div>
  );
}

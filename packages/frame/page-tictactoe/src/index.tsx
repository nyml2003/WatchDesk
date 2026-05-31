import type { PageDefinition } from "@watchdesk/shell";
import { TicTacToePage } from "./TicTacToe";

export function createTicTacToePage(): PageDefinition {
  return {
    id: "tictactoe",
    label: "井字棋",
    icon: "🎮",
    render: () => <TicTacToePage />,
  };
}

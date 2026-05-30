export { type PageDefinition } from "./page-definition";

export { WatchCounter, type CounterService } from "./components/WatchCounter";
export { WatchDeskLayout } from "./layouts/WatchDeskLayout";
export { Sidebar } from "./layouts/Sidebar";
export { TerminalViewCtx, useTerminalView } from "./context/terminal-view.context";
export type {
  TerminalViewComponent,
  TerminalViewContextValue,
} from "./context/terminal-view.context";

export { DashboardPage, createDashboardPage } from "./pages/Dashboard";
export {
  MarkdownReaderPage,
  createMarkdownReaderPage,
  type FileSystemService,
} from "./pages/MarkdownReader";
export { SettingsPage, createSettingsPage, type SettingsService } from "./pages/Settings";
export { TerminalPage, createTerminalPage, type TerminalService } from "./pages/Terminal";
export { TicTacToePage, createTicTacToePage } from "./pages/TicTacToe";

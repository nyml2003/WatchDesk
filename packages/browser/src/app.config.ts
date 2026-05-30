interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface AppConfig {
  app: { name: string };
  nav: NavItem[];
  features: {
    counter: boolean;
    files: boolean;
    terminal: boolean;
    settings: boolean;
  };
}

const isElectron = typeof window !== "undefined" && "electronAPI" in window;

const allNav = [
  { id: "dashboard", label: "工作台", icon: "📋" },
  { id: "files", label: "文件浏览器", icon: "📄" },
  { id: "terminal", label: "命令行", icon: "💻" },
  { id: "settings", label: "设置", icon: "⚙️" },
] as const;

function filterNav(items: typeof allNav): NavItem[] {
  return items.filter((item) => {
    if (item.id === "files" && !isElectron) return false;
    if (item.id === "terminal" && !isElectron) return false;
    return true;
  });
}

export const appConfig: AppConfig = {
  app: { name: "WatchDesk" },
  nav: filterNav(allNav),
  features: {
    counter: true,
    files: isElectron,
    terminal: isElectron,
    settings: true,
  },
};

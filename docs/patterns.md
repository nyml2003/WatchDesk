# 设计模式

## 页面插件化

### 问题

App 硬编码 4 个具体页面的 import + 条件渲染，新增页面需改 App.tsx、Sidebar、navItems 三处。

### 方案

每页自描述（`PageDefinition`），编排层通过 `PageRegistry` 动态管理。

```typescript
// 协议 — ui/src/page-definition.ts
export interface PageDefinition {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  render(): JSX.Element;
}
```

```typescript
// 页面工厂 — ui/src/pages/TicTacToe.tsx
export const PAGE_ID = "tictactoe";

export function createTicTacToePage(): PageDefinition {
  return {
    id: PAGE_ID,
    label: "井字棋",
    icon: "🎮",
    render: () => <TicTacToePage />,
  };
}
```

```typescript
// 注册 — 入口文件
const registry = new PageRegistry([
  createDashboardPage(deps.counterService),
  createTicTacToePage(), // ← 一行上线
]);
```

### 为什么 PageRegistry 在 shell 而非 contracts

- `contracts` 是零依赖的纯协议层，不放运行时代码
- `PageRegistry` 是对 `PageDefinition[]` 的运行时封装（Map 查找、安全导航）
- `App` 依赖 `PageRegistry`，两者在同一层天然合理

### 为什么 PageDefinition 在 ui 而非 contracts

- `PageDefinition.render(): JSX.Element` 需要 `solid-js` 类型
- `contracts` 零运行时依赖，不应依赖 `solid-js`
- `ui` 已经依赖 `solid-js`，放这里是唯一正确的位置

---

## 品牌类型 (Brand Types)

### 问题

`CounterId`、`FilePath` 都是 `string`，可以互相赋值，编译器不报错。

### 方案

`Brand<T, B>` 名义类型 + `brand<B>()` 工厂。

```typescript
// shared/src/index.ts  — 全局唯一 `as` 出口
export type Brand<T, B extends string> = T & { readonly __brand: B };

export function brand<B extends string>() {
  return {
    of(raw: string): Brand<string, B> {
      return raw as Brand<string, B>;
    },
  };
}
```

```typescript
// core/src/ids.ts  — 声明品牌类型，不出现 `as`
export type CounterId = Brand<string, "CounterId">;
export const CounterId = brand<"CounterId">();
```

```typescript
// 使用
const id: CounterId = CounterId.of("abc"); // 类型安全
const path: FilePath = CounterId.of("abc"); // ❌ 编译错误
```

### ESLint 强制

仓库禁止 `as TypeName`，仅 `shared/src/brand.ts` 放行。所有品牌类型必须通过 `brand<B>()()` 构造。

---

## 终端桥接

### 问题

`@xterm/xterm` 是 Electron 端专属的依赖。`ui` 不能依赖它，否则纯浏览器端白拉一个没用的大体积包。

### 方案

终端渲染组件通过 `TerminalViewContext` 注入。

```typescript
// ui/src/context/terminal-view.context.tsx
export type TerminalViewComponent = Component<{ containerRef: HTMLElement }>;
export interface TerminalViewContextValue {
  TerminalView: TerminalViewComponent | null;
}
```

```typescript
// ui/src/pages/Terminal.tsx — 消费 context
const { TerminalView } = useTerminalView();
// 有注入 → 渲染桥接组件；null → 显示"不可用"
```

```typescript
// desktop/src/renderer/views/xterm-terminal.tsx — Electron 实现
export function XtermTerminalView(props: { containerRef: HTMLElement }) {
  // 完整的 xterm 初始化、resize、PTY 通信
}
```

```typescript
// desktop 入口 — 注入
<App registry={registry} terminalView={XtermTerminalView} />

// browser 入口 — 注入 null
<App registry={registry} terminalView={null} />
```

### 数据流

```
TerminalPage (ui)          ← 页面外壳 + 复制按钮
  └─ TerminalViewContext   ← 桥
       ├─ browser: null    → "不可用"
       └─ desktop: XtermTerminalView → xterm → electronAPI → PTY
```

---

## 服务接口

### 问题

页面组件直接调用 `window.electronAPI.*` / `localStorage.*` / `navigator.clipboard.*`，耦合平台 API。

### 方案

页面依赖抽象接口，两端各自实现。

```typescript
// contracts/src/services.ts
export interface ICounterService {
  getValue(): Promise<number>;
  increment(): Promise<number>;
  decrement(): Promise<number>;
  reset(): Promise<void>;
}
```

```typescript
// browser/infrastructure/browser-counter.service.ts
export class BrowserCounterService implements ICounterService {
  // localStorage 实现
}

// desktop/renderer/infrastructure/electron-counter.service.ts
export class ElectronCounterService implements ICounterService {
  // window.electronAPI.counter.* 实现
}
```

```typescript
// 页面工厂接收接口类型
export function createDashboardPage(counterService: CounterService): PageDefinition { ... }
```

### 当前已定义的服务接口

| 接口              | 位置                             | browser 实现           | desktop 实现              |
| ----------------- | -------------------------------- | ---------------------- | ------------------------- |
| CounterService    | `ui/components/WatchCounter.tsx` | BrowserCounterService  | ElectronCounterService    |
| FileSystemService | `ui/pages/MarkdownReader.tsx`    | NoopFileSystemService  | ElectronFileSystemService |
| SettingsService   | `ui/pages/Settings.tsx`          | BrowserSettingsService | settings.service.ts       |
| TerminalService   | `ui/pages/Terminal.tsx`          | (未使用)               | ElectronTerminalService   |

# 包说明

## 总览

| 包          | 层       | 职责                                          | 依赖                      |
| ----------- | -------- | --------------------------------------------- | ------------------------- |
| `shared`    | 基础设施 | Brand 泛型、`brand()` 工厂、Logger 接口       | —                         |
| `contracts` | 基础设施 | IPC channels、DTO、ElectronAPI、服务接口      | —                         |
| `event-bus` | 基础设施 | 类型安全事件总线 (EventBus + lexer/parser)    | shared                    |
| `core`      | 业务核心 | Domain 实体、错误、仓储接口、Application 用例 | shared                    |
| `ui`        | 视图     | 页面/组件/布局/上下文/PageDefinition          | contracts + solid-js      |
| `shell`     | 编排     | PageRegistry + App 路由                       | ui + contracts + solid-js |
| `browser`   | 入口     | Web 端 Infrastructure 实现 + 入口             | shell + ui + solid-js     |
| `desktop`   | 入口     | Electron 端（Main + Preload + Renderer 入口） | 全部 + electron + xterm   |
| `native`    | 原生     | Rust/NAPI-RS PTY 模块                         | —                         |

---

## `@watchdesk/shared`

纯类型构造工具。不声明任何具象 branded 类型（CounterId、FilePath 等均不在此）。

### 核心文件

```
src/
├── index.ts       Brand<T,B> + brand<B>() + brandN<B>() + Logger 类型
└── logger.ts      Logger 接口（不含 console 实现）
```

### 对外 API

```typescript
export type Brand<T, B extends string> = T & { readonly __brand: B };

// 全局唯一的 `as` 出口
export function brand<B extends string>(): {
  of(raw: string): Brand<string, B>;
};
export function brandN<B extends string>(): {
  of(raw: number): Brand<number, B>;
};

export type { Logger } from "./logger";
```

### 被依赖

core, event-bus

---

## `@watchdesk/contracts`

跨端协议。零运行时依赖，只放接口和常量。

### 核心文件

```
src/
├── index.ts       IpcChannels、ElectronAPI、NavItem、AppConfig
├── dtos.ts         CounterValueDTO、FileEntryDTO、TerminalSpawnHandle
└── services.ts    ICounterService、ITerminalService、IFileSystemService、IStorageService
```

### 对外 API

```typescript
// IPC 通道常量（唯一源）
export const IpcChannels = { COUNTER_INCREMENT: "counter:increment", ... };

// 服务接口（Renderer 侧消费）
export interface ICounterService { getValue(): Promise<number>; increment(): Promise<number>; ... }
export interface IFileSystemService { selectDirectory(): Promise<string | null>; ... }
export interface ITerminalService { spawn(...): Promise<TerminalSpawnHandle>; ... }
export interface IStorageService { getItem(key: string): string | null; ... }
```

### 被依赖

ui, shell, browser, desktop (main + preload + renderer)

---

## `@watchdesk/event-bus`

类型安全的事件发布/订阅。事件名格式 `module:event`，通过 lexer/parser 编译期验证。

### 核心文件

```
src/
├── index.ts       EventBus 类、EventPayloadMap、EVENT_NAMES
├── ids.ts         EventName 品牌类型（用 brand() 构造）
├── lexer.ts       Lexer — 词法分析
├── parser.ts      Parser — 语法分析
└── event-name/
    └── index.ts    EventName 工具函数 (parse, toString, moduleOf, eventOf)
```

### 对外 API

```typescript
export class EventBus {
  emit<E extends RegisteredEventName>(
    event: E & EventName,
    payload: EventPayload<E>,
  ): void;
  on<E>(
    event: E & EventName,
    handler: (payload: EventPayload<E>) => void,
  ): () => void;
  once<E>(
    event: E & EventName,
    handler: (payload: EventPayload<E>) => void,
  ): () => void;
  clear(): void;
}
```

### 被依赖

desktop (main)

---

## `@watchdesk/core`

端无关的纯业务逻辑。Domain 实体、错误工厂、仓储接口、Application 用例全部在此。

### 核心文件

```
src/
├── index.ts       统一 re-export
├── ids.ts         业务品牌类型：CounterId, FilePath, FileNodeId, ...
├── logger.ts      console Logger 实现
├── domain/
│   ├── entities.ts     Counter、FileNode、FileStat 实体
│   ├── errors.ts       Result<T,E>、ErrorKind、错误工厂（timestamp 参数注入）
│   └── repositories.ts ICounterRepository（操作 Counter 实体）
└── application/
    └── counter.usecase.ts  CounterUseCase（create, increment, 含校验）
```

### 对外 API

```typescript
// 实体
export interface Counter {
  readonly id: CounterId;
  readonly value: number;
  readonly label: string;
}

// Result 模式
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
export function ok<T>(value: T): { ok: true; value: T };
export function err<E>(error: E): { ok: false; error: E };

// 仓储接口
export interface ICounterRepository {
  get(id: CounterId): Promise<Counter | null>;
  save(counter: Counter): Promise<void>;
}

// 用例
export class CounterUseCase {
  increment(id: CounterId): Promise<Result<Counter, CounterError>>;
  create(id: CounterId, label: string): Promise<void>;
}
```

### 设计要点

- `errors.ts` 中 `Date.now()` 已清除——timestamp 由调用方注入
- Main 进程的 `InMemoryCounterRepository` 实现此包的 `ICounterRepository`
- Renderer 不直接依赖 core，通过 contracts 的服务接口间接消费

### 被依赖

desktop (main)

---

## `@watchdesk/ui`

SolidJS 视图层。页面组件、布局、上下文、CSS Modules。零页面耦合——每个页面自声明 ID 并导出工厂函数。

### 核心文件

```
src/
├── index.ts              统一 re-export
├── page-definition.ts    PageDefinition 接口
├── css-modules.d.ts      CSS Module 类型声明
├── pages/
│   ├── Dashboard.tsx     仪表盘
│   ├── MarkdownReader.tsx 文件浏览器
│   ├── Terminal.tsx       终端（桥接模式）
│   ├── Settings.tsx       设置
│   └── TicTacToe.tsx      井字棋
├── components/
│   └── WatchCounter.tsx   计数器组件
├── layouts/
│   ├── Sidebar.tsx        侧边栏
│   └── WatchDeskLayout.tsx 布局壳
├── context/
│   └── terminal-view.context.tsx  终端渲染上下文
└── styles/
    └── *.module.css       CSS Modules
```

### 页面工厂模式

每个页面导出三个要素：

```typescript
export const PAGE_ID = "tictactoe";                    // 唯一标识
export function TicTacToePage() { ... }                // 组件（可选导出）
export function createTicTacToePage(): PageDefinition { // 工厂函数
  return { id: PAGE_ID, label: "井字棋", icon: "🎮", render: () => <TicTacToePage /> };
}
```

### 终端桥接

`ui` 不依赖 `@xterm/xterm`。终端页面通过 `TerminalViewContext` 注入渲染组件：

```
ui/TerminalPage  →  TerminalViewContext  →  desktop: XtermTerminalView
                                          →  browser: null (不可用提示)
```

### 被依赖

shell, browser, desktop (renderer)

---

## `@watchdesk/shell`

编排层。运行时页面注册、校验、路由。

### 核心文件

```
src/
├── index.ts
├── page-registry.ts   PageRegistry 类
└── App.tsx            App 组件（布局 + 路由 + 主题）
```

### PageRegistry

```typescript
export class PageRegistry {
  constructor(pages: PageDefinition[]); // 注册页面
  getNavItems(): { id; label; icon }[]; // 侧边栏数据
  get(id: string): PageDefinition | undefined; // 查询页面
  navigate(requested: string, fallback: string): string; // 安全导航（运行时校验）
}
```

### App 组件

```typescript
interface AppProps {
  registry: PageRegistry;
  terminalView: TerminalViewComponent | null;
}
```

不 import 任何具体页面组件。页面通过 `registry.get(id)?.render()` 渲染。Sidebar 从 `registry.getNavItems()` 派生。

### 被依赖

browser, desktop (renderer)

---

## `@watchdesk/browser`

纯 Web 端入口 + Infrastructure 实现。

### 核心文件

```
src/
├── main.tsx                            入口：DI + 页面注册 + render
├── infrastructure/
│   ├── di.ts                           创建 browser 服务实例
│   ├── browser-counter.service.ts      localStorage 计数器
│   ├── browser-settings.service.ts     localStorage 设置
│   └── noop-filesystem.service.ts      文件系统 no-op 实现
└── styles/
    ├── tokens.css                       CSS 变量
    └── global.css                       全局样式
```

### 入口

```typescript
const registry = new PageRegistry([
  createDashboardPage(deps.counterService),
  createMarkdownReaderPage(deps.fsService),
  createTerminalPage(),
  createTicTacToePage(),
  createSettingsPage(deps.settingsService),
]);
render(() => <App registry={registry} terminalView={null} />, root);
```

---

## `@watchdesk/desktop`

Electron 端完整应用。Main + Preload + Renderer 三进程。

### Main 进程

```
src/main/
├── app.ts                    窗口创建、用例初始化
├── app.dev.ts                开发变体
├── infra/
│   └── counter.repo.ts       InMemoryCounterRepository
└── ipc/
    ├── index.ts              注册所有 handlers
    ├── schemas.ts            Zod 校验
    ├── counter.ipc.ts        计数器 IPC
    ├── filesystem.ipc.ts     文件系统 IPC
    └── terminal.ipc.ts       终端 IPC（调用 @watchdesk/native）
```

Main 从 `@watchdesk/core` import 用例和实体，从 `@watchdesk/contracts` import IpcChannels。

### Preload

```
src/preload/
├── index.ts     contextBridge.exposeInMainWorld("electronAPI", ...)
└── index.d.ts
```

从 `@watchdesk/contracts` import IpcChannels，不 import main 源码。

### Renderer

```
src/renderer/
├── entry.tsx                              入口：DI + 页面注册 + render
├── infrastructure/
│   ├── electron-counter.service.ts       调用 electronAPI
│   ├── electron-filesystem.service.ts    调用 electronAPI
│   ├── electron-terminal.service.ts      调用 electronAPI
│   └── settings.service.ts              localStorage
├── views/
│   └── xterm-terminal.tsx                xterm 终端渲染组件（注入到 TerminalViewContext）
└── styles/
    ├── tokens.css
    └── global.css
```

与 browser 入口的唯一区别：`terminalView={XtermTerminalView}`。

---

## `@watchdesk/native`

Rust/NAPI-RS 开发的 PTY 模块。`native.pty.spawn()` / `write()` / `resize()` / `kill()` 由 `desktop/main/ipc/terminal.ipc.ts` 调用。

### 核心文件

```
src/
├── index.ts      JS wrapper
├── types.ts      TypeScript 接口
├── lib.rs        Rust 入口
└── pty.rs        PTY 实现
```

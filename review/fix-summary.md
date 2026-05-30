# WatchDesk 架构重整方案

> 基于 `review/architecture-review.md` 的 9 类问题，给出完整的包重组织方案和逐项修复结论。

---

## 零、目标包结构

```
packages/
├── shared/          纯基础设施（Brand 泛型 + brand() 工厂 + Logger 接口 + 纯工具）
│                    不含任何具象 branded 类型声明
├── core/            新建。端无关业务逻辑（Domain 实体、错误、仓储接口、Application 用例）
├── contracts/       跨端协议（DTO、IPC channels、UI 服务接口、NavItem）
├── event-bus/       类型安全的事件总线（现状保留）
├── ui/              新建。SolidJS 视图层（页面、组件、布局、样式、context）
├── native/          Rust PTY 原生模块（现状保留）
├── browser/         纯 Web 端 Infrastructure 实现 + 入口组装
├── desktop/         Electron 端 Main 进程 + Preload + Infrastructure 实现 + 入口组装
│
├── coroutine/       ✗ 删除（零消费者）
├── desktop-shell/   ✗ 删除（无源码的骨架）
└── desktop-ui-web/  ✗ 删除（空目录）
```

---

## 一、依赖图

```
shared （纯类型构造能力，不含任何具象 branded 类型）
  ├── event-bus        （自声明 EventName）
  ├── core             （自声明 CounterId、FilePath 等全部业务类型）
  │     └── desktop/main  （Main 进程消费 core 的用例和实体）
  ├── contracts        （依赖 shared + core + event-bus，消费其类型）
  │     └── ui
  │           ├── browser
  │           └── desktop/renderer
  └── native
        └── desktop/main
```

方向：全部向下，单向依赖。无循环，无同级互相依赖。

- `shared` → 叶子，零依赖，零业务感知，零具象类型声明
- `core` → 只依赖 `shared`（消费 Brand 泛型和 brand() 工厂）
- `event-bus` → 只依赖 `shared`（消费 Brand 泛型和 brand() 工厂，自声明 EventName）
- `contracts` → 依赖 `shared` + `core`（消费 Brand、CounterId、FilePath 等）
- `ui` → 依赖 `shared` + `contracts` + `event-bus` + `solid-js`（零端相关依赖）
- `browser` → 依赖 `shared` + `contracts` + `ui` + `event-bus` + `solid-js`
- `desktop` → 依赖 `shared` + `core` + `contracts` + `ui` + `event-bus` + `native` + `solid-js` + `@xterm/xterm`

---

## 二、各包职责与内容

### 2.1 `shared` — 纯类型基础设施

**定位**：最底层的类型构造工具。不感知任何具体领域概念，不声明任何具象 branded 类型。职责是**提供类型构造能力** + **锁死 `as` 语法**。

**内容**：

```
shared/src/
├── brand.ts               Brand<T, B> 泛型 + brand<B>()() 工厂函数
│                          —— 整个仓库唯一允许出现 `as` 的文件
├── utils/                 纯工具函数（如有）
└── logger.ts              Logger 接口（纯类型），不在此提供 console 实现
```

**运行时依赖**：

| 来源 | 包  | 用途                   |
| ---- | --- | ---------------------- |
| —    | —   | 纯类型包，零运行时依赖 |

**Dev 依赖**：`typescript`

**各包如何声明自己的 branded 类型**（范式）：

```typescript
// core/src/ids.ts
import { Brand, brand } from "@watchdesk/shared";
export type CounterId = Brand<string, "CounterId">;
export const CounterId = brand<"CounterId">();

// event-bus/src/ids.ts
import { Brand, brand } from "@watchdesk/shared";
export type EventName = Brand<string, "EventName">;
export const EventName = brand<"EventName">();
```

声明不出现 `as`，`as` 只在 `shared/src/brand.ts` 中。

---

### 2.2 `core` — 端无关业务逻辑

**定位**：应用的纯业务核心。Domain 实体、Domain 错误、仓储接口、Application 用例——全部放在这里。端无关、框架无关。Main 进程直接调用。

**内容**：

```
core/src/
├── ids.ts                 CounterId、FilePath、FileNodeId、FileName、
│                          TaskId、WorkflowId、EdgeId、HashHex、
│                          TimestampMs、ProcessId
│                          （所需 branded 类型全部在此声明，
│                            通过 shared 的 brand() 工厂构造）
├── domain/
│   ├── entities.ts        Counter 实体（id, value, version）及其他业务实体
│   ├── errors.ts          错误工厂（counterError, readError, writeError 等）
│   │                      —— timestamp 改为参数注入，移除 Date.now()
│   └── repositories.ts    ICounterRepository 等仓储接口
│                          （操作 Counter 实体，非裸 number）
├── application/
│   └── counter.usecase.ts CounterUseCase（create, increment，含业务校验，
│                           返回 Result<Counter, CounterError>）
└── result.ts              Result<T, E> 类型（如尚未定义）
```

**运行时依赖**：

| 来源      | 包                  | 用途                     |
| --------- | ------------------- | ------------------------ |
| workspace | `@watchdesk/shared` | Brand 泛型、brand() 工厂 |

**Dev 依赖**：`typescript`

**关键修复**：

- 从 `desktop/src/main/domain/` 和 `browser/src/domain/` 提取业务实体和仓储接口
- 从 `desktop/src/main/application/` 迁移 CounterUseCase，移除 Date.now()
- 从 `shared` 迁入所有 branded 类型声明 → `core/src/ids.ts`（File、Counter、Task、Workflow 等）
- Renderer 侧不直接依赖 `core`——通过 `contracts` 接口间接使用
- ID 声明用 `brand<'CounterId'>()` 构造，不出现 `as`

---

### 2.3 `contracts` — 跨端协议

**定位**：定义 Main ↔ Renderer、UI ↔ Infrastructure 之间的契约。所有跨进程、跨端通信的类型和常量在此统一定义。

**内容**：

```
contracts/src/
├── ipc-channels.ts        IpcChannels 常量对象（唯一源，10 个 channel）
├── dtos.ts                CounterValueDTO, FileEntryDTO, TerminalSpawnHandle
├── services.ts            Renderer 侧服务接口：
│                          ICounterService, ITerminalService,
│                          IFileSystemService, IStorageService
├── terminal.ts            Terminal 渲染桥接类型（TerminalViewComponent 等）
├── electron-api.ts        ElectronAPI 类型 shape
├── app.ts                 NavItem, AppConfig
└── index.ts               统一 re-export
```

**运行时依赖**：

| 来源      | 包                     | 用途                 |
| --------- | ---------------------- | -------------------- |
| workspace | `@watchdesk/shared`    | Brand 泛型           |
| workspace | `@watchdesk/core`      | CounterId 等业务类型 |
| workspace | `@watchdesk/event-bus` | EventName 类型       |

**Dev 依赖**：`typescript`

---

### 2.4 `event-bus` — 现状保留

**内容**：`EventBus` 类、`EventPayloadMap`、lexer/parser。新增 `ids.ts` 自行声明 `EventName` 类型（从 shared 迁移，用 `brand<'EventName'>()` 构造）。

**运行时依赖**：

| 来源      | 包                  | 用途                     |
| --------- | ------------------- | ------------------------ |
| workspace | `@watchdesk/shared` | Brand 泛型、brand() 工厂 |

**Dev 依赖**：`typescript`

---

### 2.5 `native` — 现状保留

**内容**：Rust/NAPI-RS 的 PTY 模块，不变。

**运行时依赖**：无（原生 addon，运行时不依赖任何 npm 包）

**Dev 依赖**：`@napi-rs/cli`、`typescript`、Rust 工具链

---

### 2.6 `ui` — SolidJS 视图层

**定位**：所有渲染端共享的 UI 组件，端无关。**不依赖任何端相关的库。** browser 和 desktop/renderer 都从此包 import 页面和组件。

**内容**：

```
ui/src/
├── pages/
│   ├── Dashboard.tsx          从 browser/features/counter/DashboardPage.tsx 迁移
│   ├── MarkdownReader.tsx     从 browser/features/reader/MarkdownReaderPage.tsx 迁移
│   ├── Terminal.tsx           页面外壳，terminal 渲染区通过 TerminalViewContext 注入
│   └── Settings.tsx           从 browser/features/settings/SettingsPage.tsx 迁移
├── components/
│   └── WatchCounter.tsx       从 browser/features/counter/WatchCounter.tsx 迁移
├── layouts/
│   ├── WatchDeskLayout.tsx    从 browser/layout/WatchDeskLayout.tsx 迁移
│   └── Sidebar.tsx            从 browser/layout/Sidebar.tsx 迁移
├── context/
│   ├── event-bus.context.tsx  从 desktop/renderer/application/ 迁移
│   └── terminal-view.context.tsx  TerminalViewContext 定义
├── styles/                    从 browser/styles/ 迁移全部 CSS
└── index.ts                   统一 re-export
```

**运行时依赖**：

| 来源      | 包                     | 用途                   |
| --------- | ---------------------- | ---------------------- |
| workspace | `@watchdesk/shared`    | Brand 泛型             |
| workspace | `@watchdesk/contracts` | 服务接口、DTO、NavItem |
| workspace | `@watchdesk/event-bus` | EventBus 类、EventName |
| npm       | `solid-js`             | UI 框架                |
| npm       | `solid-element`        | Custom Element 注册    |

**不依赖**：`@xterm/xterm`（terminal 渲染通过 TerminalViewContext 桥接注入）

**Dev 依赖**：`typescript`

**关键修复**：

- Terminal 页面：只提供外壳和容器 div，ANSI 终端渲染组件通过 TerminalViewContext 注入。desktop 注入 xterm 组件，browser 注入 null
- 页面组件中禁止直接调用 `window.electronAPI.*`、`navigator.clipboard`、`TextDecoder`、`localStorage`——全部改为通过 `contracts` 中定义的服务接口消费

---

### 2.7 `browser` — 纯 Web 端组装

**定位**：Web 端特有的 Infrastructure 实现 + DI 组装 + 入口。不包含任何 Electron 代码。

**内容**：

```
browser/src/
├── infrastructure/
│   ├── browser-counter.service.ts   本地 state 实现 ICounterService
│   ├── browser-filesystem.service.ts  实现 IFileSystemService（Web API 或 no-op）
│   ├── browser-terminal.service.ts  实现 ITerminalService（no-op）
│   └── local-storage.service.ts     实现 IStorageService（各端自有）
├── di.ts                            createDependencies()，注入 browser 实现
├── entry.tsx                        App 入口，import ui 的页面和布局，组装路由
│                                    注入 TerminalViewContext: { TerminalView: null }
├── index.html
└── env.d.ts / css-modules.d.ts
```

**运行时依赖**：

| 来源      | 包                     | 用途                   |
| --------- | ---------------------- | ---------------------- |
| workspace | `@watchdesk/shared`    | Brand 泛型             |
| workspace | `@watchdesk/contracts` | 服务接口、DTO          |
| workspace | `@watchdesk/ui`        | 页面、组件、布局、样式 |
| workspace | `@watchdesk/event-bus` | EventBus               |
| npm       | `solid-js`             | UI 框架                |

**不依赖**：任何 Electron 相关包

**Dev 依赖**：`vite`、`vite-plugin-solid`、`typescript`

**关键修复**：

- 删除 `domain/`、`application/`——业务逻辑已移至 `core`
- 删除 `features/` 下的所有 Presentation 文件——已移至 `ui`
- 删除 `infrastructure/counter.electron-repository.ts`——Electron 代码不应在 browser
- 删除 `layout/`——已移至 `ui`
- 删除 `styles/`——已移至 `ui`
- 删除 `app.config.ts`——NavItem/AppConfig 类型在 contracts，配置内联到 entry.tsx
- `terminal.service.ts`、`file-system.service.ts`：改为实现 contracts 的服务接口，只做纯 Web 版本

---

### 2.8 `desktop` — Electron 端组装

**定位**：Main 进程完整逻辑 + Preload + Electron 端特有的 Infrastructure 实现 + DI 组装 + 入口。

**内容**：

```
desktop/src/
├── main/
│   ├── infrastructure/
│   │   └── counter.repo.ts          InMemoryCounterRepository
│   │                                （实现 core 的 ICounterRepository）
│   ├── ipc/
│   │   ├── index.ts                 registerAllIpcHandlers()
│   │   ├── schemas.ts               Zod 校验 + createHandler()
│   │   ├── counter.ipc.ts           调用 core 的 CounterUseCase
│   │   ├── filesystem.ipc.ts
│   │   └── terminal.ipc.ts          调用 @watchdesk/native
│   ├── app.ts                       窗口创建
│   └── app.dev.ts                   开发变体
├── preload/
│   ├── index.ts                     contextBridge，import contracts 的 IpcChannels
│   └── index.d.ts
└── renderer/
    ├── infrastructure/
    │   ├── electron-counter.service.ts    调 electronAPI 实现 ICounterService
    │   ├── electron-filesystem.service.ts  调 electronAPI 实现 IFileSystemService
    │   ├── electron-terminal.service.ts    调 electronAPI 实现 ITerminalService
    │   └── local-storage.service.ts        实现 IStorageService
    ├── views/
    │   └── xterm-terminal.tsx             封装 xterm 的 ANSI 终端渲染组件
    │                                      通过 TerminalViewContext 注入给 ui
    ├── di.ts                               注入 electron 实现
    ├── entry.ts                            import ui，组装应用
    │                                       注入 TerminalViewContext: { TerminalView: XtermTerminal }
    └── index.html
```

**运行时依赖**：

| 来源      | 包                     | 用途                                                |
| --------- | ---------------------- | --------------------------------------------------- |
| workspace | `@watchdesk/shared`    | Brand 泛型、Logger 接口                             |
| workspace | `@watchdesk/core`      | Counter 实体、CounterUseCase、仓储接口              |
| workspace | `@watchdesk/contracts` | IpcChannels、DTO、服务接口                          |
| workspace | `@watchdesk/ui`        | 页面、组件、布局、样式                              |
| workspace | `@watchdesk/event-bus` | EventBus                                            |
| workspace | `@watchdesk/native`    | PTY 原生模块                                        |
| npm       | `solid-js`             | UI 框架                                             |
| npm       | `solid-element`        | Custom Element 注册                                 |
| npm       | `@xterm/xterm`         | ANSI 终端渲染 → `renderer/views/xterm-terminal.tsx` |
| npm       | `@xterm/addon-fit`     | xterm 自适应插件                                    |
| npm       | `zod`                  | IPC 参数校验 → `main/ipc/schemas.ts`                |

**Dev 依赖**：`electron`、`electron-vite`、`electron-builder`、`electron-updater`、`vite`、`vite-plugin-solid`、`@playwright/test`、`typescript`

**关键修复**：

- **删除 `main/domain/`**——entities、errors、repositories 移至 `core`；Main 侧从 core import
- **删除 `main/application/`**——CounterUseCase 移至 `core`；IPC handler 调用 core 的 UseCase
- **删除 `main/ipc/channels.ts`**——IpcChannels 唯一源在 contracts
- **删除 `renderer/domain/`**——已移至 core
- **删除 `renderer/application/`**——counter.usecase 至 core，event-bus.context 至 ui
- **删除 `renderer/pages/`、`components/`、`layouts/`、`styles/`、`main.tsx`**——在 ui 中
- **删除 `renderer/core/`**——转为 infrastructure 中的 IStorageService 实现
- **删除 `renderer/services/`**——转为 renderer/infrastructure/ 中的 Electron 实现
- **删除 `renderer/infrastructure/` 中的 browser repo**——纯 Web 实现在 browser 包
- **新增 `renderer/views/xterm-terminal.tsx`**——通过 TerminalViewContext 桥接给 ui

**平台硬编码修复（同在 desktop/main/ipc/ 下）**：

- `terminal.ipc.ts`：`"cmd.exe"` → `process.platform === "win32" ? "cmd.exe" : process.env.SHELL || "/bin/bash"`
- `filesystem.ipc.ts`：`"\\"` → `path.sep`
- `terminal.ipc.ts`：`process.cwd()` → workspace root 路径
- `filesystem.ipc.ts`：`let workspaceRoot` → 暂不处理多窗口隔离，加 `// TODO: per-window isolation`

---

## 三、删除清单

| 删除项                                                               | 理由                                               |
| -------------------------------------------------------------------- | -------------------------------------------------- |
| `packages/coroutine/`                                                | 全仓库零 import                                    |
| `packages/desktop-shell/`                                            | 无 src/，与 desktop 定位重叠                       |
| `packages/desktop-ui-web/`                                           | 空目录                                             |
| `packages/browser/src/domain/`                                       | 移至 core                                          |
| `packages/browser/src/application/`                                  | 移至 core                                          |
| `packages/browser/src/features/*/` 中 \*.tsx 页面/组件               | 移至 ui                                            |
| `packages/browser/src/layout/`                                       | 移至 ui                                            |
| `packages/browser/src/styles/`                                       | 移至 ui                                            |
| `packages/browser/src/app.config.ts`                                 | 配置内联 entry，类型在 contracts                   |
| `packages/browser/src/infrastructure/counter.electron-repository.ts` | Electron 代码不应在 browser                        |
| `packages/browser/src/features/reader/file-system.service.ts`        | 改为 infrastructure 实现                           |
| `packages/browser/src/features/terminal/terminal.service.ts`         | 改为 infrastructure 实现                           |
| `packages/browser/src/features/settings/settings.service.ts`         | 改为 infrastructure 实现                           |
| `packages/desktop/src/main/domain/`                                  | 移至 core                                          |
| `packages/desktop/src/main/application/`                             | 移至 core                                          |
| `packages/desktop/src/main/ipc/channels.ts`                          | 唯一源在 contracts                                 |
| `packages/desktop/src/renderer/domain/`                              | 移至 core                                          |
| `packages/desktop/src/renderer/application/`                         | counter.usecase→core，event-bus.context→ui         |
| `packages/desktop/src/renderer/infrastructure/`                      | DI 和 browser repo 删除，保留 electron 实现        |
| `packages/desktop/src/renderer/pages/`                               | 移至 ui                                            |
| `packages/desktop/src/renderer/components/`                          | 移至 ui                                            |
| `packages/desktop/src/renderer/layouts/`                             | 移至 ui                                            |
| `packages/desktop/src/renderer/styles/`                              | 移至 ui                                            |
| `packages/desktop/src/renderer/services/`                            | 转为 renderer/infrastructure/                      |
| `packages/desktop/src/renderer/core/`                                | 转为 renderer/infrastructure/ 的 IStorageService   |
| `packages/desktop/src/renderer/main.tsx`                             | 死代码                                             |
| `packages/desktop/src/main/workers/`                                 | 空目录                                             |
| `packages/shared/src/ids.ts`                                         | 全部具象 branded 类型移至归属包（core、event-bus） |
| `packages/contracts/src/` Brand/CounterId/EventName 重复定义         | 分别从 shared / core / event-bus import            |

---

## 四、迁移路径（按操作顺序）

### 4.1 新建 `core` 包

1. 创建 `packages/core/`，含 `package.json`、`tsconfig.json`
2. 根 `tsconfig.json` references 增加 core
3. 新增 `core/src/ids.ts`：声明 CounterId、FilePath、FileNodeId 等全部业务 branded 类型，用 `brand<B>()()` 构造
4. 从 `desktop/src/main/domain/` 迁移 entities、errors、repositories → `core/src/domain/`
5. 从 `desktop/src/main/application/` 迁移 CounterUseCase → `core/src/application/`
6. 修复 `errors.ts`：`Date.now()` 改为参数注入

### 4.2 重整 `shared`

1. 删除 `ids.ts`，移除全部具象 branded 类型声明 → 各类型移至归属包
2. 保留 `brand.ts`：Brand<T,B> 泛型 + brand<B>()() 工厂
3. 保留 `logger.ts`：Logger 接口（不提供 console 实现）
4. **ESLint 新增规则**：全仓库禁止 `as TypeName`，仅 `shared/src/brand.ts` 放行

### 4.3 新建 `ui` 包

1. 创建 `packages/ui/`，含 `package.json`、`tsconfig.json`
2. 根 `tsconfig.json` references 增加 ui
3. 从 browser 迁移页面、组件、布局、样式 → `ui/src/`
4. 从 desktop/renderer 迁移 event-bus.context.tsx → `ui/src/context/`
5. 新增 `ui/src/context/terminal-view.context.tsx`：TerminalViewContext 定义
6. 改造组件：直接调用 API 替换为 contracts 的服务接口
7. Terminal 页面：去掉 xterm，改为通过 TerminalViewContext 消费注入组件

### 4.4 重整 `event-bus`

1. 新增 `event-bus/src/ids.ts`：自行声明 `EventName` 类型，用 `brand<'EventName'>()` 构造（从 shared 迁移）
2. 现有代码更新 import 路径

### 4.5 重整 `contracts`

1. 删除与 shared 重复的 Brand/EventName，改为 from shared / event-bus
2. 删除与 core 重复的 CounterId，改为 from core
3. 删除 `desktop/src/main/ipc/channels.ts`
4. 新增 services.ts、terminal.ts
5. NavItem、FileEntryDTO 以此包为唯一源
6. 根 tsconfig.json references 增加 contracts

### 4.6 收敛 `browser`

1. 删除 domain/、application/、features/ 中页面组件、layout/、styles/、app.config.ts
2. 删除 `counter.electron-repository.ts`
3. terminal/file-system/settings service 改为 infrastructure 实现，实现 contracts 接口
4. 重写 `entry.tsx`：import ui 组件，注入 browser 实现，TerminalViewContext 为 null

### 4.7 收敛 `desktop`

1. 删除 main/domain/、main/application/、main/ipc/channels.ts
2. 删除 renderer/ 下 domain/、application/、pages/、components/、layouts/、styles/、services/、core/、main.tsx
3. 新增 `renderer/views/xterm-terminal.tsx`
4. IPC handlers 从 core import 用例，从 contracts import channels
5. 重写 preload/index.ts：从 contracts import IpcChannels
6. renderer/infrastructure/ 中为每个服务接口创建 Electron 实现
7. 重写 renderer/entry.ts：import ui，注入 electron 实现，TerminalViewContext 注入 XtermTerminal
8. 修复 4 处平台硬编码

### 4.8 工程配置收敛

1. 根 tsconfig.json references 补上 core、contracts、ui
2. ESLint config：宽松规则集 B 的 glob 排除 domain/application 目录；全仓库禁止 `as TypeName`（仅 `shared/src/brand.ts` 放行）
3. 删除 coroutine、desktop-shell、desktop-ui-web

---

## 五、待确认

| #   | 问题                         | 决定                                                      |
| --- | ---------------------------- | --------------------------------------------------------- |
| 1   | `desktop-shell/`             | **删除**                                                  |
| 2   | 多窗口支持                   | **后面再说**，workspaceRoot 暂不隔离，加 TODO             |
| 3   | `browser/src/features/` 目录 | 待定                                                      |
| 4   | EventBusContext 位置         | 待定                                                      |
| 5   | localStorage 实现            | **各端隔离**，browser 和 desktop 各自实现 IStorageService |

---

_本文档覆盖 architecture-review.md 的 9 类全部问题，每项对应具体文件路径和操作。_

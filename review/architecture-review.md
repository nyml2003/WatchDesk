# WatchDesk 架构审查报告

> 审查日期：2026-05-30
>
> 审查范围：`packages/`、`tests/`、根目录工程配置，以及当前代码已呈现的架构方向。
>
> 核心结论：**架构腐化已进入系统性阶段——大规模代码重复、层次边界模糊、幽灵包膨胀、跨进程语义分裂——需要制定明确的收敛计划，而不是继续叠加抽象。**

---

## 目录

1. [总判断](#一总判断)
2. [代码大规模重复](#二代码大规模重复)
3. [幽灵包与死代码](#三幽灵包与死代码)
4. [层次边界模糊](#四层次边界模糊)
5. [跨进程语义分裂](#五跨进程语义分裂)
6. [类型多源定义](#六类型多源定义)
7. [平台硬编码](#七平台硬编码)
8. [工程配置问题](#八工程配置问题)
9. [ESLint 规则冲突](#九eslint-规则冲突)
10. [修复优先级与路线图](#十修复优先级与路线图)
11. [附录：已有 review 问题追踪](#附录已有-review-问题追踪)

---

## 一、总判断

这个项目的**大边界方向是对的**——Electron 主进程 / preload / renderer 三分、native 独立成包、UI 不直接拿 Node 能力。这些硬边界应当保留。

但当前的体系性问题是：**中层抽象已跑在真实复杂度前面**，且因为历史演进形成了大量重复代码和模糊边界。具体表现为五类结构问题：

| 问题类别       | 严重程度 | 可量化证据          |
| -------------- | -------- | ------------------- |
| 代码大规模重复 | **致命** | 600+ 行，15 对文件  |
| 幽灵包与死代码 | **高**   | 3 个包无实际功能    |
| 层次边界模糊   | **高**   | 20+ 处违规          |
| 跨进程语义分裂 | **高**   | 4 处同名异义        |
| 类型多源定义   | **中**   | 6 个类型 2-3 处重复 |

目前的危险不在于"没有架构"，而在于**架构壳子已经搭好，但真实代码没有遵循它，且多份拷贝相互背离**。

---

## 二、代码大规模重复

### 2.1 概述

`packages/desktop/src/renderer/` 几乎完整复制了 `packages/browser/src/` 的全部源码。15 对文件存在 90%-100% 的重复，总计约 **600+ 行重复代码**。

更严重的是，两者的关系链本身是断裂的：

- `desktop/src/renderer/entry.ts:1` 已执行 `import "@watchdesk/browser"`
- `desktop/src/renderer/index.html` 指向 `entry.ts`
- 但 `desktop/src/renderer/main.tsx` 构造了一套完全独立的应用树，使用本地的 pages/components

这意味着：**真正的入口点只有一个（`entry.ts` → browser），而 `main.tsx` 及其所有本地页面组件很可能是从未被打包输出的死代码。**

### 2.2 重复清单

#### 领域层 (Domain)

| 文件                 | browser                                | desktop/renderer                                                            | 重复度                      |
| -------------------- | -------------------------------------- | --------------------------------------------------------------------------- | --------------------------- |
| `ICounterRepository` | `browser/src/domain/repositories.ts:1` | `renderer/domain/repositories.ts:1`                                         | 100%                        |
| 僵尸接口             | —                                      | `renderer/domain/repositories.ts:8` (`IFileSystemRepository`, `FileNodeVM`) | 仅在 desktop 存在，从未实现 |

```typescript
// 两处完全相同的接口声明
export interface ICounterRepository {
  getValue(): Promise<number>;
  increment(): Promise<number>;
  decrement(): Promise<number>;
  reset(): Promise<void>;
}
```

#### 应用层 (Application)

| 文件             | browser                                       | desktop/renderer                            | 重复度 |
| ---------------- | --------------------------------------------- | ------------------------------------------- | ------ |
| `CounterUseCase` | `browser/src/application/CounterUseCase.ts:3` | `renderer/application/counter.usecase.ts:3` | 100%   |

两处的 4 个方法（`increment()`, `decrement()`, `getValue()`, `reset()`）签名与实现体完全相同——纯透传，无业务逻辑。

#### 基础设施层 (Infrastructure)

| 文件                           | browser                                                       | desktop/renderer                                    | 重复度 |
| ------------------------------ | ------------------------------------------------------------- | --------------------------------------------------- | ------ |
| `BrowserCounterRepository`     | `browser/src/infrastructure/counter.browser-repository.ts:3`  | `renderer/infrastructure/counter.repo.browser.ts:3` | 100%   |
| `ElectronCounterRepository`    | `browser/src/infrastructure/counter.electron-repository.ts:3` | `renderer/infrastructure/counter.repo.ts:3`         | 100%   |
| DI 容器 (`createDependencies`) | `browser/src/infrastructure/di.ts:1`                          | `renderer/infrastructure/di.ts:1`                   | 100%   |

特别值得注意的命名混乱：在 desktop 侧，`counter.repo.ts`（无后缀）是 Electron 实现，`counter.repo.browser.ts`（有后缀）是 browser fallback——与 browser 包的 `counter.electron-repository.ts` / `counter.browser-repository.ts` 命名逻辑相反。

#### 页面与组件 (Presentation)

| 组件                 | browser                                                 | desktop/renderer                                | 重复度 |
| -------------------- | ------------------------------------------------------- | ----------------------------------------------- | ------ |
| `WatchCounter`       | `browser/src/features/counter/WatchCounter.tsx:1`       | `renderer/components/watch-counter.tsx:1`       | 100%   |
| `DashboardPage`      | `browser/src/features/counter/DashboardPage.tsx`        | `renderer/pages/Dashboard.tsx`                  | ~95%   |
| `MarkdownReaderPage` | `browser/src/features/reader/MarkdownReaderPage.tsx`    | `renderer/pages/MarkdownReader.tsx`             | ~90%   |
| `TerminalPage`       | `browser/src/features/terminal/TerminalPage.tsx`        | `renderer/pages/Terminal.tsx`                   | ~90%   |
| `SettingsPage`       | `browser/src/features/settings/SettingsPage.tsx`        | `renderer/pages/Settings.tsx`                   | ~95%   |
| Layout / Sidebar     | `browser/src/layout/WatchDeskLayout.tsx`, `Sidebar.tsx` | `renderer/layouts/AppLayout.tsx`, `Sidebar.tsx` | ~95%   |

#### 服务层 (Services)

| 文件          | browser                                              | desktop/renderer                           | 重复度 |
| ------------- | ---------------------------------------------------- | ------------------------------------------ | ------ |
| 文件系统服务  | `browser/src/features/reader/file-system.service.ts` | `renderer/services/file-system.service.ts` | ~95%   |
| 终端服务      | `browser/src/features/terminal/terminal.service.ts`  | `renderer/services/terminal.service.ts`    | ~95%   |
| 设置服务/存储 | `browser/src/features/settings/settings.service.ts`  | `renderer/core/settings-store.ts`          | ~90%   |

### 2.3 重复的根源分析

出现大规模重复的直接原因：

1. `packages/browser/` 是后期引入的"纯浏览器运行"能力，但 `packages/desktop/src/renderer/` 在它之前已经独立发展了完整的一套 UI 代码
2. 当 browser 包被 `entry.ts` 导入后，desktop/renderer 的原有代码没有被清理，而是在仓库中继续保留
3. 两者之间没有建立明确的 `extends` / `re-exports` / 单一真相源关系

### 2.4 建议

**确认 `packages/browser/src/` 为 renderer 侧的唯一真相源**，`desktop/src/renderer/` 只保留 Electron 特有的 bootstrap（如 `entry.ts`）和任何 browser 包暂时无法覆盖的差异逻辑。

---

## 三、幽灵包与死代码

### 3.1 `packages/desktop-ui-web/` — 完全空目录

- **状态**：目录存在，但零文件。无 `package.json`，无 `src/`，无任何配置文件。
- **影响**：如果 `pnpm-workspace.yaml` 中的 `packages/*` 匹配到它，pnpm 可能会产生警告或未知行为。
- **建议**：立即删除，或在明确规划前不要保留空目录。

### 3.2 `packages/desktop-shell/` — 配置骨架，无源码

- **状态**：有完整的 `package.json`（声明了 `electron`、`electron-vite`、`zod` 等运行时依赖）、`tsconfig.node.json`、`tsconfig.web.json`，但 **`src/` 目录不存在**。
- **tsconfig 引用路径问题**：`tsconfig.node.json` 的 `include` 指向 `src/main/**/*.ts` 和 `src/preload/**/*.ts`，`tsconfig.web.json` 指向 `src/preload/**/*.ts`——全部指向不存在的位置。
- **项目引用缺失**：根 `tsconfig.json` 的 `references` 数组中**不包含此包**，意味着 TypeScript 构建系统不认识它。
- **角色重复**：与 `@watchdesk/desktop` 的功能定位完全重叠（Electron 壳程序）。
- **建议**：明确其定位。如果是为了未来拆出"纯洁壳"（无耦合 UI），应补充源码后再纳入构建图。否则应归档或删除。

### 3.3 `packages/coroutine/` — 声明了依赖，零处导入

- **状态**：59 行源码。`CoroutineOptions` 接口声明了 `priority`、`retries` 字段，但 `CoroutineScheduler` 实现中**完全未使用**这两个字段。只有 `deduplicate`、`timeout`、`scope` 有实际消费。
- **导入统计**：尽管 `@watchdesk/desktop` 的 `package.json` 声明了 `"@watchdesk/coroutine": "workspace:*"`，但全仓库**没有任何 `.ts` 或 `.tsx` 文件实际 import 此包**。
- **建议**：这是"先平台化，后验证"的典型案例。先保留但不继续膨胀。等出现至少 2 个真实消费者后再考虑固化 API。

### 3.4 其他死代码

| 位置                                                                      | 内容                                  | 状态                                            |
| ------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------- |
| `desktop/src/renderer/domain/repositories.ts:8-20`                        | `IFileSystemRepository`、`FileNodeVM` | 声明但零处实现或引用                            |
| `desktop/src/main/domain/entities.ts:15-16`                               | 部分 re-export 的 branded types       | 仅做转发，文件自身未使用                        |
| `desktop/src/renderer/main.tsx`                                           | 完整应用入口                          | 可能被 `entry.ts` 替代，从未被打包加载          |
| `desktop/src/renderer/pages/*`、`components/*`、`layouts/*`、`services/*` | 约 10 个文件                          | 若确认入口为 `entry.ts` → browser，则全系死代码 |

---

## 四、层次边界模糊

项目宣称为 DDD 四层架构（Presentation → Application → Domain ← Infrastructure），但实际代码中存在大量越界行为。

### 4.1 Import 方向违反

DDD 严格依赖方向：Presentation → Application → Domain，Infrastructure → Domain。Domain 不依赖任何外层。

#### A) Presentation 直接 import Infrastructure

```
packages/browser/src/main.tsx:3
  import { createDependencies } from "./infrastructure/di";

packages/desktop/src/renderer/main.tsx:3
  import { createDependencies } from "./infrastructure/di";
```

**严重性：中**。入口点作为"组合根"有一定豁免理由，但绕过 Application 层直接组装 Infrastructure 仍然是脆弱的模式。

```
packages/browser/src/features/counter/DashboardPage.tsx:2
  import type { Dependencies } from "../../infrastructure/di";

packages/desktop/src/renderer/pages/Dashboard.tsx:2
  import type { Dependencies } from "../infrastructure/di";
```

**严重性：高**。页面级 UI 组件不应该知道 Infrastructure 层的 `Dependencies` 类型。这是叶子节点向上游的实现细节产生了类型依赖。

#### B) Preload 跨进程边界引用 Main 源码

```
packages/desktop/src/preload/index.ts:2
  import { IpcChannels } from "../main/ipc/channels";
```

**严重性：高**。Preload 与 Main 是不同的 Electron 进程上下文，拥有不同的运行时权限。编译期直接引用 Main 的 IPC 常量破坏了进程隔离。IPC channel 名称应来自共享的 `@watchdesk/contracts` 包。

### 4.2 Application 层包含框架代码（SolidJS）

```
packages/desktop/src/renderer/application/event-bus.context.tsx:1-23
  import { createContext, useContext, onCleanup, type JSX } from "solid-js";
```

**违反性：高**。Application 层在 DDD 中应保持框架无关。此文件包含：

- SolidJS `createContext` / `useContext`（Context 机制）
- `onCleanup`（组件生命周期）
- JSX 类型（UI 渲染）

应移至 Infrastructure 层（作为 DI 的一部分）或 Presentation 层（作为 Context Provider）。

### 4.3 Domain 层被平台/运行时污染

#### a) `Date.now()` 在 Domain 错误工厂中

```
packages/desktop/src/main/domain/errors.ts:78,82,86,90,94,98,102,106
```

每一个错误工厂函数（`counterError`, `readError`, `writeError`, `statError`, `listDirError`, `watchError`, `globError`, `invalidInputError`）都在构造时调用 `Date.now()`。

```typescript
export function counterError(message: string, kind: ErrorKind): CounterError {
  return { code: "COUNTER_ERROR", kind, message, timestamp: Date.now() };
}
```

**违反性：高**。Domain 层必须是纯函数——相同输入产生相同输出。`Date.now()` 使 Domain 变为非确定性，不可测试。时间戳应由调用方（Application 层或 Infrastructure 层）注入。

#### b) Logger 污染 shared → domain 依赖链

```
packages/shared/src/logger.ts:9,14-27
  const logger = {
    error: (...args: unknown[]) => console.error(new Date().toISOString(), ...args),
    // ...
  };
```

`shared` 包被 Domain 层直接依赖（`desktop/src/main/domain/entities.ts:1` imports from `@watchdesk/shared`）。但 `shared` 中的 `Logger` / `log` 使用了：

- `console.*`（浏览器/Node 运行时 API）
- `new Date().toISOString()`（非确定性）

**违反性：中**。`shared` 包应只包含纯类型（Brand 等），或至少将 `log` 拆为独立入口点，避免 domain 代码间接依赖 `console` 和 `Date`。

#### c) 僵尸 Domain 接口

```
packages/desktop/src/renderer/domain/repositories.ts:8-20
  IFileSystemRepository, FileNodeVM
```

声明了两个 Domain 接口，但**全仓库没有任何文件实现或引用它们**。僵尸代码增加了 Domain 层的认知负担。

### 4.4 Infrastructure 泄漏到 Presentation

以下每一处都是 Infrastructure 细节（第三方库 API、平台 API、浏览器 Web API）直接出现在 UI 组件（Presentation 层）中：

| 文件                                                 | 行号    | 泄漏内容                                                     | 类型            |
| ---------------------------------------------------- | ------- | ------------------------------------------------------------ | --------------- |
| `desktop/.../pages/Terminal.tsx`                     | 2-4     | `import { Terminal } from "@xterm/xterm"` + `FitAddon` + CSS | 第三方库        |
| `browser/.../features/terminal/TerminalPage.tsx`     | 2-4     | 同上                                                         | 第三方库        |
| `desktop/.../pages/Terminal.tsx`                     | 46      | `navigator.clipboard.writeText(sel)`                         | Web API         |
| `browser/.../features/terminal/TerminalPage.tsx`     | 45      | `navigator.clipboard.writeText(selection)`                   | Web API         |
| `desktop/.../pages/MarkdownReader.tsx`               | 57      | `new TextDecoder().decode(data)`                             | Web API         |
| `browser/.../features/reader/MarkdownReaderPage.tsx` | 57      | `new TextDecoder().decode(data)`                             | Web API         |
| `desktop/.../services/terminal.service.ts`           | 7-19    | `window.electronAPI.terminal.*`                              | Electron API    |
| `browser/.../features/terminal/terminal.service.ts`  | 9-21    | `window.electronAPI.terminal.*`                              | Electron API    |
| `desktop/.../services/file-system.service.ts`        | 9-18    | `window.electronAPI.{dialog,fs}.*`                           | Electron API    |
| `browser/.../features/reader/file-system.service.ts` | 4-12    | `window.electronAPI.{dialog,fs}.*`                           | Electron API    |
| `browser/.../features/settings/settings.service.ts`  | 5,14,23 | `localStorage.{getItem,setItem}`                             | Web Storage API |
| `desktop/.../core/settings-store.ts`                 | 5,14,23 | `localStorage.{getItem,setItem}`                             | Web Storage API |

### 4.5 非 DDD 层级的目录混入

这两个目录不属于 Presentation / Application / Domain / Infrastructure 任何一层：

```
packages/desktop/src/renderer/core/
  └── settings-store.ts         // "core" 是什么层？
packages/desktop/src/renderer/services/
  ├── file-system.service.ts    // "services" 是什么层？
  ├── terminal.service.ts
  └── settings.service.ts
```

Browser 包的 `features/` 目录将页面组件和 service 平铺在同一层：

```
packages/browser/src/features/counter/
  ├── DashboardPage.tsx         // Presentation
  └── WatchCounter.tsx          // Presentation
packages/browser/src/features/terminal/
  ├── TerminalPage.tsx          // Presentation
  └── terminal.service.ts       // Infrastructure (直接调 electronAPI)
packages/browser/src/features/settings/
  ├── SettingsPage.tsx          // Presentation
  └── settings.service.ts       // Infrastructure (直接调 localStorage)
```

整个 feature 文件夹内不存在 Domain / Application 层，将 Presentation 和 Infrastructure 不加区分地混放在一起。

### 4.6 改进方向

1. Domain 层移除所有非纯元素（`Date.now()`、`console`、框架引用）
2. 将 `terminal.service.ts`、`file-system.service.ts`、`settings.service.ts` 确认为 Infrastructure 并移至对应目录
3. `EventBusContext` 从 Application 移至 Infrastructure
4. Presentation 组件不应直接 import `@xterm/xterm`、调用 `navigator.clipboard`、使用 `TextDecoder`——应通过抽象服务访问
5. 统一 `features/`、`services/`、`core/` 的层级归属

---

## 五、跨进程语义分裂

Main 进程和 Renderer 进程使用了相同的 DDD 概念名称，但承载了完全不同的语义。这不是代码重复问题，而是**同一标签指向了不同抽象**。

### 5.1 `CounterUseCase` — 同名，不同契约

**Main 进程** (`desktop/src/main/application/counter.usecase.ts:6-51`)：

```typescript
class CounterUseCase {
  async increment(id: CounterId): Promise<Result<Counter, CounterError>> { ... }
  async create(id: CounterId): Promise<Result<Counter, CounterError>> { ... }
  // 有业务校验：检查计数器是否存在、错误状态处理
}
```

**Renderer 进程** (两处相同)：

```typescript
class CounterUseCase {
  async increment(): Promise<number> {
    return repository.increment();
  }
  async getValue(): Promise<number> {
    return repository.getValue();
  }
  // 纯透传，零业务逻辑，4 个方法只有 4 行
}
```

**分裂点**：Main 侧有 `create()` 方法、`CounterId` 参数、`Result<>` 返回值、存在性校验；Renderer 侧无 ID、无 Result、无校验。同一个类名表达了两种完全不同的职责——Main 侧是真正的领域逻辑，Renderer 侧只是一个无意义的委托层。

### 5.2 `ICounterRepository` — 同名，不同抽象

**Main 进程** (`desktop/src/main/domain/repositories.ts:3-6`)：

```typescript
interface ICounterRepository {
  get(id: CounterId): Promise<Counter | null>;
  save(counter: Counter): Promise<void>;
}
```

**Renderer 进程** (两处相同)：

```typescript
interface ICounterRepository {
  getValue(): Promise<number>;
  increment(): Promise<number>;
  decrement(): Promise<number>;
  reset(): Promise<void>;
}
```

**分裂点**：Main 侧操作的是 `Counter` 领域实体（有 ID, value, version 字段），Renderer 侧操作的是裸 `number`。Renderer 侧根本不认识 `Counter` 实体。

### 5.3 建议

- 明确 Main 和 Renderer 是**不同的限界上下文 (Bounded Context)**
- 如果 Renderer 确实只需要"一个数值的增/减/重置/读取"，应该命名清晰（如 `CounterProxy`、`CounterViewModel`）
- Renderer 侧的四方法透传 `CounterUseCase` 应当删除——如果它不做任何决策，就不配称为 UseCase

---

## 六、类型多源定义

同一个类型在多个文件中独立声明，没有形成单一真相源。

### 6.1 核心类型重复

| 类型                         | 位置 1                      | 位置 2                                          | 位置 3                              |
| ---------------------------- | --------------------------- | ----------------------------------------------- | ----------------------------------- |
| `Brand<T, B>`                | `shared/src/index.ts:1`     | `contracts/src/index.ts:1`                      | —                                   |
| `CounterId`                  | `shared/src/index.ts:3`     | `contracts/src/index.ts:3`                      | —                                   |
| `EventName`                  | `shared/src/index.ts:68`    | `contracts/src/index.ts:4`                      | —                                   |
| `IpcChannels` 常量           | `contracts/src/index.ts:18` | `desktop/src/main/ipc/channels.ts:1`            | —                                   |
| `NavItem`                    | `contracts/src/index.ts:78` | `browser/src/app.config.ts:1`                   | `desktop/.../layouts/Sidebar.tsx:4` |
| `FileEntryDTO` / `FileEntry` | `contracts/src/index.ts:41` | `desktop/.../services/file-system.service.ts:1` | `desktop/.../preload/index.d.ts:3`  |

### 6.2 影响

- **`shared` vs `contracts`**：两者的职责边界从未被明确定义。Brand 类型和核心 ID 类型在两个包中重复。如果 contracts 不依赖 shared，应该从 shared 统一导出。
- **`IpcChannels`**：Main 进程和 contracts 包中各有一份完全相同的常量对象。Preload 引用了 Main 的版本（应为 contracts），Main 自身也有本地版本（未用 contracts）。
- **`NavItem`**：在 contracts（接口定义）、browser（配置消费）、desktop layouts（组件 props）中各自独立声明，没有形成 `import from contracts` 的单向依赖。
- **`FileEntryDTO`**：三处名称不同但结构相同。Preload 类型声明 (`index.d.ts`) 定义了一次，Service 又内联定义了一次，contracts 再定义了一次。

### 6.3 建议

```text
类型定义流向应为：
  shared (纯类型基础, Brand, ID 工厂)
    ← contracts (IPC channel 名称、DTO 接口、ElectronAPI shape)
      ← browser / desktop (消费)
```

所有跨包类型必须从唯一的源包导入，不允许在消费侧重复声明。

---

## 七、平台硬编码

### 7.1 Terminal 硬编码 Windows Shell

```
packages/desktop/src/main/ipc/terminal.ipc.ts:21
  const id = native.pty.spawn("cmd.exe", process.cwd(), cols, rows, ...)
```

- `"cmd.exe"` 是 Windows 专属。macOS/Linux 需要用 `/bin/bash`、`/bin/zsh` 或从 `$SHELL` 环境变量读取。
- 当前在 macOS/Linux 上终端功能将直接**崩溃或静默失败**。

### 7.2 文件系统路径检查使用 Windows 分隔符

```
packages/desktop/src/main/ipc/filesystem.ipc.ts:15
  if (!resolved.startsWith(normalizedRoot + "\\") && resolved !== normalizedRoot)
```

- 使用硬编码的 `"\\"`（Windows 反斜杠），在 macOS/Linux 上 `normalizedRoot` 是正斜杠路径，此检查永远返回 `false`，导致**所有文件访问被阻断**。
- 应使用 `path.sep` 或跨平台的 `startsWith` 检查逻辑。

### 7.3 Terminal 工作目录使用 `process.cwd()`

```
packages/desktop/src/main/ipc/terminal.ipc.ts:21
  process.cwd()
```

- 终端启动目录是 Electron App 的进程工作目录，而非用户选择的工作区路径。
- 用户无法从终端访问他们通过文件浏览器打开的文件。

### 7.4 文件系统 workspace root 是全局可变状态

```
packages/desktop/src/main/ipc/filesystem.ipc.ts:7
  let workspaceRoot: string | null = null;
```

- 全局变量，所有 BrowserWindow 共享。如果未来打开多个窗口，workspace 会相互覆盖。
- 没有重置机制，一旦被设定就无法清除。

---

## 八、工程配置问题

### 8.1 contracts 包未纳入 TypeScript 项目引用

根 `tsconfig.json:23-32` 的 `references` 数组列出了 7 个子项目，但**不包括 `contracts`**。尽管 `contracts` 包本身有有效的 `tsconfig.json`，且 `@watchdesk/browser` 依赖它，但它不在 TypeScript 构建图中。

### 8.2 desktop 的构件入口混乱

`desktop/src/renderer/` 下存在两条并行的启动链路：

1. `index.html` → `entry.ts` → `import "@watchdesk/browser"` (browser 包的应用)
2. `main.tsx` → 本地 `pages/`, `components/`, `services/` 的完整应用树

当前构建时只有 `entry.ts` 会被加载（因为 `index.html` 指向它），`main.tsx` 及其全部依赖链成为死路径。

### 8.3 Brand 工厂函数是纯类型断言——零运行时安全

```
packages/shared/src/index.ts:14-18
  const CounterId = {
    of(raw: string): CounterId {
      return raw as CounterId;   // 不是验证，只是类型断言
    },
  };
```

所有 `X.of()` 工厂函数都是 `as TypeName`。它们提供了命名上的语义和编译期区分，但**不提供任何运行时不变量校验**。如果传入无意义的字符串，它们不会拒绝。这个模式是文档级的，不是安全级的。

---

## 九、ESLint 规则冲突

`eslint.config.mjs` 中存在两套规则在同一批文件上冲突：

**规则集 A（domain/application 层——严格）**：

```
eslint.config.mjs:52-60
  "@typescript-eslint/no-unsafe-*": "error"
  "@typescript-eslint/no-explicit-any": "error"
  "@typescript-eslint/no-unnecessary-condition": "error"
```

**规则集 B（desktop/browser/native/tests——宽松）**：

```
eslint.config.mjs:63-85
  "@typescript-eslint/no-unsafe-*": "off"
  "@typescript-eslint/no-explicit-any": "off"
  // ... 几乎所有安全规则都被关闭
```

**问题**：domain/application 目录常位于 desktop 或 browser 之下（如 `desktop/src/main/domain/`、`desktop/src/renderer/domain/`）。由于规则集 B 的 `files` glob 先匹配了 `packages/desktop/**/*.ts`，它会覆盖规则集 A 对 domain/application 的严格设置。具体覆盖顺序取决于 ESLint 的实现，可能产生不确定性——domain 层的文件可能意外地用宽松规则运行，导致理想中"Domain 安全"的约束荡然无存。

---

## 十、修复优先级与路线图

### P0（本次必须处理）—— 这些是当前影响正确性的硬伤

| #   | 任务                                                                                                                   | 影响范围                 |
| --- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 1   | **消除 `desktop/renderer` 与 `browser` 的代码重复**——明确 browser 为唯一渲染端真相源，删除 desktop/renderer 的重复文件 | 约 10 个文件，600+ 行    |
| 2   | **修复 `cmd.exe` 和 `\\` 平台硬编码**——使用 `process.platform` 选择 shell，使用 `path.sep` 检查路径前缀                | terminal, filesystem IPC |
| 3   | **删除空幽灵包** `desktop-ui-web/`                                                                                     | pnpm workspace 清洁度    |
| 4   | **修复 ESLint 规则覆盖冲突**——规则集 B 的 glob 不应吞掉 domain/application 目录                                        | 代码质量保障             |

### P1（本轮收敛）—— 这些是架构正确性的核心

| #   | 任务                                                                                          | 预期效果            |
| --- | --------------------------------------------------------------------------------------------- | ------------------- |
| 5   | **统一 `shared` / `contracts` 的类型边界**——消除 Brand/CounterId/EventName 等重复定义         | 单一类型真相源      |
| 6   | **统一 `IpcChannels` 到 `@watchdesk/contracts`**——Main 和 Preload 都从 contracts import       | IPC contract 一致性 |
| 7   | **梳理 `entry.ts` vs `main.tsx`**——确认真实入口并删除死路径                                   | 构建产物确定性      |
| 8   | **将 `Date.now()` / `console` 移出 Domain 层**——时间戳改为注入，Logger 不作为 Domain 传递依赖 | Domain 可测试性     |
| 9   | **将 `EventBusContext` 从 Application 移至 Infrastructure**                                   | 分层纯净度          |
| 10  | **归类 `services/` 和 `core/` 目录**——所有 platform-wrapping 代码归入 Infrastructure          | 目录结构语义清晰    |
| 11  | **统一 `NavItem`、`FileEntryDTO` 等类型到单一源**                                             | 消除类型碎片化      |

### P2（后续迭代）—— 这些是代码质量和抽象合理性的改进

| #   | 任务                                                                                      | 说明                            |
| --- | ----------------------------------------------------------------------------------------- | ------------------------------- |
| 12  | 为 `terminal.service` / `file-system.service` 建立清晰的抽象接口，隔离 xterm、electronAPI | Presentation 不直接依赖第三方库 |
| 13  | 统一 Main/Renderer 的 `CounterUseCase` / `ICounterRepository` 语义或显式命名为不同上下文  | 跨进程语义一致性                |
| 14  | 归档或推进 `desktop-shell` 包（写源码 or 删除配置）                                       | 减少维护负担                    |
| 15  | 等待 coroutine 出现至少 2 个真实消费者后，再决定是否固化                                  | 不继续平台化膨胀                |
| 16  | 清理 `IFileSystemRepository` / `FileNodeVM` 等僵尸 Domain 接口                            | Domain 层精简                   |
| 17  | 补全 IPC contract 漂移（preload 暴露但 main 未实现的 API）                                | 运行时正确性                    |
| 18  | Terminal 监听器生命周期释放                                                               | 防止内存泄漏                    |

### P3（不做/谨慎做）

| 事项                                | 理由                                                   |
| ----------------------------------- | ------------------------------------------------------ |
| 大规模推倒 DDD 分层                 | 硬边界方向是正确的                                     |
| 回收 shared / event-bus / coroutine | 当前问题不在这三个包的抽象本身，而在边界遵守和重复代码 |
| 强行将所有新功能都纳入事件总线      | 事件总线的抽象强度已高于需求密度                       |
| 为"架构更纯"做大规模重构            | 先修硬伤，再谈美感                                     |

---

## 附录：已有 review 问题追踪

`review/review-summary.md` 已识别的 5 个问题及其当前状态：

| #        | 问题                                    | 状态                                               | 本报告的对应增强分析                                            |
| -------- | --------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| HIGH-1   | Preload 暴露的 IPC 与 Main 注册集合漂移 | 仍存在                                             | 见本报告 §六：`IpcChannels` 在两处独立定义是漂移的根因          |
| HIGH-2   | 生产构建打开 DevTools                   | 已修复（拆至 `app.dev.ts`）                        | —                                                               |
| MEDIUM-3 | Terminal 数据监听未释放                 | 仍存在                                             | 见本报告 P2-18；root cause 是 `spawn()` 未返回可释放句柄        |
| MEDIUM-4 | 文件系统 IPC 能力边界过宽               | 部分修复（已有 workspace-root 检查）               | 见本报告 §7.2/§7.4：路径分隔符 bug 和全局可变状态是两个新增发现 |
| MEDIUM-5 | E2E 验证通道为空                        | 可能已修复（`tests/e2e/counter.spec.ts` 现已存在） | —                                                               |

---

_本报告旨在为后续架构收敛提供事实依据和优先级排序。每一项建议都对应了具体文件路径和可量化的重复/违反证据，便于逐条验收。_

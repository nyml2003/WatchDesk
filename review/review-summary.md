# WatchDesk Review Summary

评审范围：`packages/`、`tests/`、根目录工程配置，以及当前代码已经呈现出的架构方向。

这份文档整合三部分内容：

- 代码级问题 review
- 架构级判断
- `shared` / `event-bus` / `coroutine` 三个包的当前处理策略

目标不是把所有观点堆在一起，而是给出一个统一结论：这个项目现阶段哪些地方必须修，哪些地方先别动，哪些地方要控制继续膨胀。

## 总结论

建议：`REQUEST CHANGES`

理由分两层：

- 代码层面，当前有几条会影响正确性、发布质量和能力边界的实际问题，至少应该先修掉高优先级项。
- 架构层面，仓库的硬边界方向是对的，但中层抽象已经开始跑在真实复杂度前面。现在不需要大规模重构，但需要停止继续把探索期抽象做成既定平台。

一句话判断：

这是一个“基础骨架合格、关键边界方向正确，但已有若干实际缺陷，同时中层抽象偏重”的项目。下一步应该优先修运行时和边界问题，而不是继续加更多架构层。

## 一、代码级主要问题

### HIGH 1. Preload 暴露的 IPC contract 与主进程实际注册集合已经漂移

- 文件：
  - [packages/desktop/src/preload/index.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/preload/index.ts:12)
  - [packages/desktop/src/preload/index.d.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/preload/index.d.ts:28)
  - [packages/desktop/src/main/ipc/filesystem.ipc.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/main/ipc/filesystem.ipc.ts:6)
  - [packages/desktop/src/main/ipc/index.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/main/ipc/index.ts:6)

问题：
`preload` 暴露了 `fs.writeRaw`、`fs.getStat`、`fs.exists`、`app.getPlatform`、`app.getVersion`、`app.quit`，但主进程并没有注册对应 handler。

影响：
这不是风格问题，而是明确的运行时 contract 失真。后续只要有人按类型声明调用这些 API，就会直接得到 `No handler registered` 类错误。

建议：
把 IPC contract 收敛到单一真相源。短期最直接的做法是删掉未实现 bridge，或者补齐 main handler。

### HIGH 2. 生产构建默认打开 DevTools

- 文件：
  - [packages/desktop/src/main/index.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/main/index.ts:26)

问题：
`ready-to-show` 时无条件执行 `openDevTools()`。

影响：
这会把调试行为带进生产包，降低发布质量，也扩大最终用户可见的调试面。

建议：
限制在 `is.dev` 或显式 debug flag 下。

### MEDIUM 3. Terminal 数据监听未释放

- 文件：
  - [packages/desktop/src/preload/index.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/preload/index.ts:25)
  - [packages/desktop/src/renderer/pages/Terminal.tsx](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/renderer/pages/Terminal.tsx:59)

问题：
`terminal.spawn()` 每次都会注册 `ipcRenderer.on(...)`，但没有匹配的卸载路径。

影响：
重复进入终端页会积累 renderer 侧监听器，造成内存泄漏和后续事件路由复杂化。

建议：
让 `spawn` 返回可释放句柄，或在 `kill` / `onCleanup` 中显式 `removeListener`。

### MEDIUM 4. 文件系统 IPC 能力边界过宽

- 文件：
  - [packages/desktop/src/main/ipc/filesystem.ipc.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/main/ipc/filesystem.ipc.ts:7)
  - [packages/desktop/src/main/ipc/schemas.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/main/ipc/schemas.ts:5)
  - [packages/desktop/src/renderer/pages/MarkdownReader.tsx](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/renderer/pages/MarkdownReader.tsx:11)

问题：
只要传入非空字符串，renderer 就可以请求 main 读任意路径文件和目录。

影响：
这在当前单机工具里未必立刻爆炸，但它已经把过宽的本地文件读取能力做成了长期接口。后续一旦接入外部内容、插件或更复杂能力，这会成为明显风险。

建议：
改成 capability-based 模型，例如用户显式选择的工作区根路径再向下访问，而不是任意绝对路径。

### MEDIUM 5. E2E 验证通道名义存在，实际为空

- 文件：
  - [playwright.config.ts](/C:/Users/nyml/code/WatchDesk/playwright.config.ts:1)
  - [tests/e2e](/C:/Users/nyml/code/WatchDesk/tests/e2e)

问题：
`pnpm test:e2e` 当前直接失败，因为 `tests/e2e` 没有测试文件。

影响：
仓库现在没有自动化覆盖 Electron 关键链路，例如 preload contract、terminal 生命周期、文件浏览和窗口启动行为。

建议：
补一个最小 happy-path E2E，或者明确当前暂不提供 E2E，避免假象上的“已有验证”。

## 二、架构判断

### 1. 硬边界方向是对的，这部分应该保留

- [packages/desktop/src/main/index.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/main/index.ts:17)
- [packages/desktop/src/preload/index.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/preload/index.ts:3)
- [packages/desktop/src/main/ipc/index.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/main/ipc/index.ts:6)
- `packages/native`

当前最有价值的架构选择是：

- Electron 主进程 / preload / renderer 分边界
- native 能力独立成包
- UI 层不直接拿 Node 能力

这些属于硬边界，应该继续保留。

### 2. Browser / Electron 双实现思路有价值

- [packages/desktop/src/renderer/infrastructure/di.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/renderer/infrastructure/di.ts:10)
- [packages/desktop/src/renderer/infrastructure/counter.repo.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/renderer/infrastructure/counter.repo.ts:3)
- [packages/desktop/src/renderer/infrastructure/counter.repo.browser.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/renderer/infrastructure/counter.repo.browser.ts:3)

这说明 renderer 至少在尝试依赖抽象仓储，而不是直接耦合 Electron API。这个方向对早期验证是有意义的。

### 3. 真正的问题不是“架构乱”，而是“中层抽象偏重”

最明显的信号有三类：

- renderer 侧 `application/domain` 目前承载的复杂度很低，但已经完整分层
  - [packages/desktop/src/renderer/application/counter.usecase.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/renderer/application/counter.usecase.ts:3)
  - [packages/desktop/src/renderer/domain/repositories.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/renderer/domain/repositories.ts:1)
- main 和 renderer 双侧都维护 repository / usecase 概念，但语义不一致
  - [packages/desktop/src/main/application/counter.usecase.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/main/application/counter.usecase.ts:6)
  - [packages/desktop/src/main/domain/repositories.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/main/domain/repositories.ts:3)
- IPC bridge 已经存在，但 contract 管理还不是系统化的
  - [packages/desktop/src/main/ipc/index.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/main/ipc/index.ts:6)
  - [packages/desktop/src/preload/index.ts](/C:/Users/nyml/code/WatchDesk/packages/desktop/src/preload/index.ts:3)

所以结构上的问题不是“没有分层”，而是有些层已经先长出来了，但真实压力还没到那个程度。

### 4. 当前测试优先级也反映了这个问题

- [tests/unit/application/counter.usecase.test.ts](/C:/Users/nyml/code/WatchDesk/tests/unit/application/counter.usecase.test.ts:1)
- [tests/unit/domain/event-name.test.ts](/C:/Users/nyml/code/WatchDesk/tests/unit/domain/event-name.test.ts:1)

现在测试更偏向：

- 轻量 usecase
- event name parser

但真正高风险的边界：

- preload/main IPC
- terminal 生命周期
- 文件系统 capability

基本没有自动化覆盖。

这意味着仓库当前更擅长验证抽象本身，而不是验证关键链路的可靠性。

## 三、`shared` / `event-bus` / `coroutine` 的处理策略

### 总原则

这三个包现在可以先放着，不需要立刻回收、不需要专门开重构任务。

但也不要把它们当作已经被证明正确的长期稳定平台边界。

它们更适合被视为：

- 正在验证中的通用能力

而不是：

- 已定型的基础设施

### 为什么现在先放着是合理的

因为它们还没有明显反噬到成为当前第一优先级问题。当前更直接的问题还是：

- IPC contract 漂移
- 平台行为不一致
- 权限边界过宽
- 生命周期清理不足

所以现在不该优先重构这三个包。

### 为什么又不能继续无节制膨胀

因为它们已经出现了“先平台化，后验证”的信号。

#### `shared`

- [packages/shared/src/index.ts](/C:/Users/nyml/code/WatchDesk/packages/shared/src/index.ts:1)

现状：

- 主要是 branded type 和 `of()` 工厂
- 当前很多 `of()` 仍只是类型断言

结论：

可以保留，但慎加新类型。只有当某个类型真的表达跨边界协议、不变量或明确复用价值时，再进入 `shared`。

#### `event-bus`

- [packages/event-bus/src/index.ts](/C:/Users/nyml/code/WatchDesk/packages/event-bus/src/index.ts:17)
- [packages/event-bus/src/event-name/index.ts](/C:/Users/nyml/code/WatchDesk/packages/event-bus/src/event-name/index.ts:5)
- [packages/event-bus/src/parser.ts](/C:/Users/nyml/code/WatchDesk/packages/event-bus/src/parser.ts:22)

现状：

- 已有 typed event bus
- 也有 parser / lexer
- 同时仍在用 `indexOf/slice`

结论：

方向没有错，但当前抽象强度已经高于需求密度。先保留，但不要继续扩展 parser 体系，也不要强制所有新功能都走事件总线。

#### `coroutine`

- [packages/coroutine/src/index.ts](/C:/Users/nyml/code/WatchDesk/packages/coroutine/src/index.ts:1)

现状：

- 已暴露 `deduplicate`、`priority`、`timeout`、`retries`、`scope`、`cancel`
- 但实现尚未完全兑现这些语义

结论：

这是最需要“别继续膨胀”的一个包。先保留，但停止继续增加平台级语义，等真实消费者和真实场景把它逼实。

### 当前阶段的执行原则

后续可以直接按这四条执行：

1. 先放着，不重构。
2. 不继续平台化膨胀。
3. 新功能优先直接解决问题，不为了复用而强行接入这三个包。
4. 等第二个真实消费者出现后，再决定是否固化公共 API。

### 什么时候可以做实，什么时候该收缩

可以逐步做实的信号：

- 至少有 2 个真实消费者
- 新需求接入时，接口基本不用改形状
- 测试开始保护真实行为，而不是只保护接口长相
- 调用方接入这些包时确实更省事

需要收缩或回收的信号：

- 每加一个新场景，API 都要改
- 调用方频繁绕开它
- 能力越来越多，但几乎没人真依赖
- 测试都在测抽象组件，却测不到关键链路

## 四、建议的优先级

### 现在应该做

- 修正 IPC contract 漂移
- 把 DevTools 限制在开发环境
- 补 terminal 监听释放
- 收紧文件系统 capability 边界
- 至少补一条最小 Electron E2E

### 现在不该做

- 为了“架构更纯”去大规模回收 `shared/event-bus/coroutine`
- 继续加更多中层抽象
- 强行把所有新功能都纳入现有抽象框架

### 后面再看

- renderer 侧是否真的需要完整 DDD 口径
- `event-bus` 是否真的值得维持 parser/lexer 复杂度
- `coroutine` 是否真的会长成稳定调度平台
- 哪些 shared type 最终值得成为长期协议

## 验证结果

- `pnpm lint`：通过
- `pnpm test`：通过，12 tests passed
- `pnpm build`：通过
- `pnpm test:e2e`：失败，原因是 `tests/e2e` 下没有测试文件

## 最终判断

这个项目的危险不在于“完全没架构”，而在于“有正确的大边界，但中层抽象已经有点领先于现实需求”。

所以最合理的路线不是推倒重来，也不是继续平台化，而是：

- 保住硬边界
- 修掉真实缺陷
- 控制中层抽象膨胀
- 让后续功能迭代决定哪些抽象值得留下

一句话总结：

WatchDesk 现在最需要的是“把关键链路做实”，不是“把架构再做大”。

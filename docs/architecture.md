# 架构

## 依赖图

```
shared (纯基础设施，零依赖)
  ├── core              端无关业务逻辑
  │     └── desktop/main  Main 进程调用用例
  ├── event-bus          类型安全事件总线
  │
contracts (跨端协议，零依赖)
  │
  ├── ui                 SolidJS 视图层（组件 + 页面 + 工厂）
  │     └── shell        编排层（PageRegistry + App 路由）
  │           ├── browser  纯 Web 端入口
  │           └── desktop  Electron 端入口
  │
  ├── browser            基础设施文件（service 实现）
  ├── desktop            基础设施 + Main 进程 IPC
  └── desktop/preload    上下文桥接
```

全部单向，零循环。

## 分层模型

```
┌─────────────────────────────────────────┐
│  入口适配层                              │
│  browser/main.tsx  desktop/entry.tsx    │
│  职责：DI 组装 + 页面注册 + render       │
├─────────────────────────────────────────┤
│  编排层 (shell)                          │
│  PageRegistry  App.tsx                  │
│  职责：运行时校验 + 路由 + 布局组装       │
├─────────────────────────────────────────┤
│  视图层 (ui)                             │
│  页面/组件/布局/上下文                   │
│  职责：纯展示 + 工厂函数导出              │
├──────────────────────┬──────────────────┤
│  业务核心层 (core)    │  跨端协议 (contracts) │
│  Domain + Application │  IPC / DTO / 服务接口 │
├──────────────────────┴──────────────────┤
│  基础设施层                              │
│  shared (Brand + 类型工厂)               │
│  event-bus (事件总线)                    │
└─────────────────────────────────────────┘
```

## 设计原则

### 分层边界

| 约束                     | 说明                               |
| ------------------------ | ---------------------------------- |
| Domain 是纯函数          | `Date.now()` 等副作用由调用方注入  |
| contracts 零依赖         | 纯接口类型，不 import 任何运行时库 |
| ui 不 import 其他页面    | 每个页面自声明 PAGE_ID，互不引用   |
| shell 不 import 具体页面 | 页面通过 `PageRegistry` 动态注入   |
| 入口只做 DI + 注册       | 不包含路由逻辑、不包含布局代码     |

### 类型安全

| 机制                      | 说明                                           |
| ------------------------- | ---------------------------------------------- |
| `Brand<T, B>`             | 名义类型，防止 ID 混用（CounterId ≠ FilePath） |
| `brand<B>()` 工厂         | `as` 语法唯一出口，仓库其余地方 ESLint 禁止    |
| `PageRegistry.navigate()` | 运行时校验导航 ID 合法性                       |

### 插件化

新增页面 = 1 个文件 + 入口 1 行注册，不改 shell/App/Sidebar/contracts。

详见 [patterns.md](./patterns.md)。

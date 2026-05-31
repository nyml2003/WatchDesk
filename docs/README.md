# WatchDesk

基于 Electron + SolidJS 的桌面工作台应用，支持双端运行。

## 快速开始

```bash
pnpm install
pnpm dev      # 启动 Electron 桌面应用
pnpm build    # 生产构建
pnpm test     # 单元测试
pnpm lint     # 代码检查
```

## 双端入口

| 端       | 包                   | 入口                     |
| -------- | -------------------- | ------------------------ |
| Electron | `@watchdesk/desktop` | `src/renderer/entry.tsx` |
| 纯 Web   | `@watchdesk/browser` | `src/main.tsx`           |

两端共享同一套 `@watchdesk/shell` + `@watchdesk/ui`，仅基础设施（DI、终端渲染）各有实现。

## 文档导航

| 文档                                 | 内容                                           |
| ------------------------------------ | ---------------------------------------------- |
| [architecture.md](./architecture.md) | 包拓扑、依赖图、分层模型、设计原则             |
| [packages.md](./packages.md)         | 逐包职责、核心文件、API 说明                   |
| [patterns.md](./patterns.md)         | 关键设计模式（页面插件化、品牌类型、终端桥接） |
| [guide.md](./guide.md)               | 扩展指南（新增页面、新增服务）                 |

## 技术栈

| 层       | 技术                      |
| -------- | ------------------------- |
| 运行时   | Electron 35 + Node.js 20+ |
| UI 框架  | SolidJS 1.9               |
| 构建     | Vite 6 / electron-vite    |
| 原生模块 | NAPI-RS (Rust)            |
| 类型     | TypeScript 5.8 (strict)   |
| 测试     | Vitest + Playwright       |
| 包管理   | pnpm 10 (workspace)       |

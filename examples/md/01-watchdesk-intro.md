# WatchDesk 简介

WatchDesk 是一个**工作流编排容器**，以桌面客户端形态运行于 Windows / macOS。

## 核心定位

- **容器** — 承载各类工具型 Web Component
- **文件浏览器** — 对本地文件系统的高性能浏览与管理
- **工作流编排** — 工具间可组合、可编排

## 技术栈

| 层     | 技术                      |
| ------ | ------------------------- |
| 运行时 | Electron 35+              |
| 语言   | TypeScript 5.8 strict     |
| 构建   | electron-vite 3           |
| 渲染   | Solid JS + Web Components |

## 架构

采用 DDD 四层架构：

```
Presentation → Application → Domain ← Infrastructure
```

所有可选链、兜底、try/catch 集中在边界层。内部层 TypeScript 类型保证零防御。

# 扩展指南

## 新增页面（井字棋示例）

### 第 1 步：写页面文件

新建 `ui/src/pages/YourPage.tsx`：

```typescript
import { createSignal } from "solid-js";
import type { PageDefinition } from "../page-definition";
import styles from "../styles/your.module.css";

// 纯函数（如有）放在组件外部

export function YourPage() {
  return <div class={styles.page}>Your content</div>;
}

export const PAGE_ID = "your-page";

export function createYourPage(): PageDefinition {
  return {
    id: PAGE_ID,
    label: "你的页面",
    icon: "🔥",
    render: () => <YourPage />,
  };
}
```

### 第 2 步：导出

在 `ui/src/index.ts` 加一行：

```typescript
export { YourPage, createYourPage } from "./pages/YourPage";
```

### 第 3 步：注册

在入口文件（`browser/src/main.tsx` / `desktop/src/renderer/entry.tsx`）的 `pages` 数组中加一行：

```typescript
const registry = new PageRegistry([
  // ...existing pages...
  createYourPage(),
]);
```

### 无需改动的文件

- `shell/src/App.tsx` — 不改
- `ui/src/layouts/Sidebar.tsx` — 不改
- `contracts/src/index.ts` — 不改
- 任何 tsconfig / package.json — 不改

---

## 新增页面（需要外部服务的示例）

如果页面需要调用外部 API（如计数器）：

```typescript
// 第 1 步：定义服务接口（放在页面文件内部）
export interface MyService {
  getData(): Promise<string>;
}

// 第 2 步：页面接收服务
interface MyPageProps { service: MyService }
export function MyPage(props: MyPageProps) { ... }

// 第 3 步：工厂接收服务
export function createMyPage(service: MyService): PageDefinition {
  return {
    id: PAGE_ID,
    label: "...",
    icon: "...",
    render: () => <MyPage service={service} />,
  };
}

// 第 4 步：入口注入服务
const registry = new PageRegistry([
  createMyPage(new MyServiceBrowserImpl()),
]);
```

---

## 新增 IPC Channel

### 第 1 步：定义 channel

在 `contracts/src/index.ts` 的 `IpcChannels` 对象中添加：

```typescript
export const IpcChannels = {
  // ...existing...
  MY_NEW_ACTION: "my:newAction",
} as const;
```

### 第 2 步：定义 DTO（如有）

在 `contracts/src/dtos.ts` 中添加：

```typescript
export interface MyActionDTO {
  result: string;
}
```

### 第 3 步：Main 注册 handler

在 `desktop/src/main/ipc/` 中创建或扩展现有 handler：

```typescript
ipcMain.handle(IpcChannels.MY_NEW_ACTION, async (_event, args) => {
  return { result: "ok" };
});
```

### 第 4 步：Preload 暴露

在 `desktop/src/preload/index.ts` 的 `api` 对象中添加：

```typescript
const api = {
  // ...existing...
  myModule: {
    newAction: (): Promise<MyActionDTO> =>
      ipcRenderer.invoke(IpcChannels.MY_NEW_ACTION),
  },
};
```

### 第 5 步：Renderer 调用

在 `desktop/src/renderer/infrastructure/` 中创建 service 实现：

```typescript
export class MyElectronService {
  async newAction(): Promise<MyActionDTO> {
    return window.electronAPI.myModule.newAction();
  }
}
```

---

## 新增服务接口

完整的步骤示例：

### 1. 定义接口

在 `ui` 的页面文件内定义（如果只一个页面用）或提取到 `contracts/src/services.ts`（如果多端共用）。

### 2. browser 实现

在 `browser/src/infrastructure/` 创建实现类。

### 3. desktop 实现

在 `desktop/src/renderer/infrastructure/` 创建实现类。

### 4. 页面工厂接收接口

```typescript
export function createMyPage(service: MyService): PageDefinition { ... }
```

### 5. 入口注入

```typescript
const registry = new PageRegistry([createMyPage(new MyServiceBrowserImpl())]);
```

---

## 目录速查

| 想做的事               | 去哪个目录                                                                  |
| ---------------------- | --------------------------------------------------------------------------- |
| 加页面                 | `ui/src/pages/` + `ui/src/styles/`                                          |
| 加组件                 | `ui/src/components/`                                                        |
| 加布局                 | `ui/src/layouts/`                                                           |
| 加 IPC channel         | `contracts/src/index.ts` → `desktop/src/main/ipc/` → `desktop/src/preload/` |
| 加 Service（browser）  | `browser/src/infrastructure/`                                               |
| 加 Service（electron） | `desktop/src/renderer/infrastructure/`                                      |
| 加品牌类型             | `core/src/ids.ts`（业务）或归属包的 `ids.ts`                                |
| 加 Domain 实体         | `core/src/domain/`                                                          |
| 加用例                 | `core/src/application/`                                                     |
| 加事件                 | `event-bus/src/index.ts` 的 `EventPayloadMap`                               |

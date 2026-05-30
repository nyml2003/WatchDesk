# EventBus 事件总线

## 事件命名规范

格式：`module:event-name`

```
counter:changed       — Counter 值变更
fs:file-selected      — 文件树中选中文件
tab:switch            — Tab 切换
workflow:run          — 开始运行工作流
app:theme-changed     — 主题切换
```

## 类型安全

```typescript
type EventPayloadMap = {
  "counter:changed": number;
  "fs:file-selected": string;
};

bus.emit("counter:changed", 42); // ✅
bus.emit("counter:changed", "wrong"); // ❌ TypeScript 报错
```

## 事件命名解析

使用递归下降解析器（Lexer → Parser），拒绝纯字符串操作：

```
"fs:file-selected" → Lexer → [IDENT("fs"), COLON, IDENT("file-selected")]
                   → Parser → { module: "fs", event: "file-selected" }
```

非法命名会被拒绝：

- `"ab"` — 缺少冒号
- `"a:b:c"` — 多余冒号
- `"123:event"` — IDENT 不能以数字开头

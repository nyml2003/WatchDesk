# TypeScript 类型系统

## Branded Types

通过名义类型实现编译时安全：

```typescript
type Brand<T, B> = T & { readonly __brand: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

const userId: UserId = UserId.of("abc");
const orderId: OrderId = OrderId.of("abc");

function getUser(id: UserId) { ... }
getUser(orderId);  // ❌ TypeScript 报错！
```

## Result 模式

不抛异常，用 union type 表达成功/失败：

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// 使用
const result = await useCase.increment(id);
if (result.ok) {
  console.log(result.value); // 类型收窄为 Counter
} else {
  console.log(result.error); // 类型收窄为 CounterError
}
```

## 防御代码禁令

以下在 domain/ 和 application/ 中全部禁止：

```
❌ obj?.prop?.value        (可选链)
❌ input ?? "default"      (兜底)
❌ try { ... } catch { }   (try/catch)
❌ if (typeof x === "...") (运行时类型检查)
❌ if (!data) throw ...    (运行时断言)
```

这些只在边界层出现一次。

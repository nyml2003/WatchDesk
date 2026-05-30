# Counter 组件设计

## 架构分层

```
watch-counter.tsx          ← Presentation (只依赖 UseCase)
counter.usecase.ts         ← Application (只依赖 Repository 接口)
repositories.ts            ← Domain (定义 ICounterRepository)
counter.repo.ts            ← Infrastructure (实现，调 electronAPI)
```

## 关键约束

- Component 不 import 任何 `electron*` 模块
- UseCase 不 import 任何 `electron*` 模块
- 唯一碰 `window.electronAPI` 的是 Infrastructure 层

## 双环境验证

同一个 Counter 组件，零代码改动：

```
Electron → ElectronCounterRepo → window.electronAPI → IPC → Main
Browser  → BrowserCounterRepo  → localStorage
```

## 代码示例

```typescript
class CounterUseCase {
  constructor(private readonly repo: ICounterRepository) {}

  async increment(): Promise<number> {
    return this.repo.increment();
  }
}
```

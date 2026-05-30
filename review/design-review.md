# WatchDesk 方案评审

评审对象：

- [docs/01-概要设计.md](/abs/path/C:/Users/nyml/code/WatchDesk/docs/01-概要设计.md)
- [docs/02-详细设计.md](/abs/path/C:/Users/nyml/code/WatchDesk/docs/02-详细设计.md)

评审要求：

- 优点只做简述
- 重点阐述缺点

## 优点

- 分层意识是清楚的。文档明确区分了 Presentation、Application、Domain、Infrastructure，目标是把 `window.electronAPI`、IPC、native bridge 这些脏边界收敛起来，这个方向本身是对的。
- 跨环境复用目标是合理的。通过 Browser/Electron 双 Repo 验证 renderer 层可替换性，这比一开始就把 renderer 和 Electron 强绑定更健康。
- 对 Electron 安全基线有基本意识。`contextIsolation`、`nodeIntegration`、`sandbox`、白名单 bridge、IPC 参数校验这些点都覆盖到了。
- 文档完整度高。不是只写概念，已经下沉到目录结构、调用链、测试分层、工具链和后续演进阶段，这对后续协作有帮助。

## 主要问题

### 1. 最大的问题不是“架构不先进”，而是设计目标严重过量，Phase 1 无法收敛

这是当前方案最核心的问题。

文档一方面说当前阶段只是 `Monorepo 壳 + DDD 完整骨架 + Counter`，另一方面又同时引入了下列系统性设计：

- Renderer / Main 双 bounded context
- Browser / Electron 双环境适配
- Main Worker Pool
- Rust napi-rs 二阶段接口预铺
- CoroutineScheduler
- EventBus
- 事件名 lexer/parser
- 多 renderer 进程拓扑
- updater / builder / E2E / workspace 全套工程化

这不是“留好扩展点”，这是在 Phase 1 同时设计多个未来系统。结果会变成：

- 首个可运行版本极慢
- 每个模块都只有半套实现
- 文档显得很强，但实际代码会大量是 stub、假接口、未验证约束
- 真实问题还没出现，抽象已经先固化

对一个目前只落地到 Counter 的项目，这个设计规模明显超过问题规模。现在最需要的是把最小闭环跑通，再让真实需求推动抽象；不是预先把文件系统、工作流、预览、多进程、多线程、多协程、事件系统一次性铺开。

更直白一点：这套方案像是在为“未来的大型产品”写平台设计，但当前交付物只是“能运行的壳 + 一个 counter”。架构张力和阶段目标不匹配。

### 2. “内部零防御代码”是过度教条，不是可靠工程原则

概要和详细设计都把这条写成了根本原则，例如：

- [docs/01-概要设计.md](/abs/path/C:/Users/nyml/code/WatchDesk/docs/01-概要设计.md:35)
- [docs/02-详细设计.md](/abs/path/C:/Users/nyml/code/WatchDesk/docs/02-详细设计.md:8)

并进一步规定：

- 内部层禁止 `?.`
- 禁止 `??`
- 禁止 `try/catch`
- 禁止 `if (x == null)`
- 禁止运行时检查

这个说法的问题不在于“想把脏活放边界”，而在于它把“边界校验”和“内部不变量维护”混为一谈。

现实里内部层仍然会遇到三类问题：

- 业务不变量失效：不是外部输入脏，而是内部状态组合本身非法
- 时序问题：并发、取消、资源释放、重复调用导致状态不一致
- 第三方行为不可靠：框架、浏览器、Electron、原生模块都可能在“边界之后”继续制造异常

这时你仍然需要：

- 断言
- 分支
- 容错
- 异常恢复
- 显式失败路径

把这些一刀切地定义为“内部禁止”，会导致两个后果：

- 开发者开始为了迎合规则而绕着语言能力走，代码可读性下降
- 真正该被表达的失败路径，被硬塞进不自然的 `Result` 包装或被偷偷忽略

`try/catch` 禁止尤其不合理。Application 层本来就经常承担 orchestration 职责，涉及多个 async 调用、资源回收和错误映射。这里完全禁 `try/catch`，等于强行削弱编排层表达能力。

好的边界设计应该是：

- 外部输入要尽早 parse/normalize
- 内部代码默认基于可信类型工作
- 但允许内部对业务不变量、时序和资源错误进行正常防御

现在这个方案把“尽量减少防御噪音”写成了“绝对禁止防御”，这会把团队带到错误方向。

### 3. DDD 被用成了结构口号，但当前问题规模并不支持这么重的建模

文档高频强调 DDD 四层、双 bounded context、Domain 核心、UseCase 编排。这在复杂业务系统里成立，但当前场景是：

- 桌面壳
- 工具容器
- 文件浏览器
- 工作流编排器

其中真正可能有重业务规则的，也许是未来的工作流引擎；但 Counter、基础文件浏览、组件通信这类部分，本质上更接近应用壳和系统工具，不是典型的 rich domain 场景。

当前风险是把所有东西都“领域化”：

- 文件系统操作要包一层 domain repository
- 事件系统要有 parser 和 branded type
- Main 和 Renderer 都要各自配 domain/application/infra

结果容易出现“层次完整，但信息密度很低”：

- 文件搬运逻辑被拆成很多层
- 简单流程要跨多个目录跳转
- 真正复杂的业务模型却还没出现

这不是说不能用 DDD 思想，而是应该有选择地用：

- 工作流定义、执行计划、任务状态机，这些未来适合做 domain
- Electron 壳、组件注册、简单 bridge、文件枚举，优先用轻量模块化和明确边界即可

现在的设计是把 DDD 当成总框架，而不是作为“在复杂业务处加压”的工具，明显偏重。

### 4. 并发模型设计明显超前，而且和 Phase 1 目标脱节

概要设计和详细设计都大量展开了“三层并发模型”：

- 多进程
- 多线程
- 多协程
- Rust `tokio`
- Rust `rayon`
- Worker pool
- MessagePort / SAB / Uint8Array

参考位置：

- [docs/01-概要设计.md](/abs/path/C:/Users/nyml/code/WatchDesk/docs/01-概要设计.md:166)
- [docs/02-详细设计.md](/abs/path/C:/Users/nyml/code/WatchDesk/docs/02-详细设计.md:176)

问题在于，这一层设计没有建立在已知瓶颈上，而是建立在想象中的高负载未来上。

当前阶段只有 Counter，未来最近的一步大概率是文件浏览器。对于文件浏览器的第一版，通常先验证的是：

- 列目录是否够快
- 首屏是否可接受
- 大目录是否卡 UI
- watch 行为是否稳定

在这些问题真实出现前，就先定义：

- 多 renderer 角色
- Worker pool 调度接口
- Rust 并发模型
- SAB/零拷贝策略

这会产生典型的“架构投资跑在性能证据前面”的问题。最后很可能是：

- 复杂度先付出
- 性能收益并不明确
- 维护成本已经真实存在

工程上更合理的路径应该是：

1. 先用最简单的 Electron + async I/O 跑通
2. 用 profiling 找到卡点
3. 再决定是 main worker、renderer worker，还是 native

而不是在设计阶段同时把三套并发故事都讲完。

### 5. `CoroutineScheduler` 这套抽象很可能是“为抽象而抽象”

详细设计专门定义了一个 renderer 协程调度器：

- [docs/02-详细设计.md](/abs/path/C:/Users/nyml/code/WatchDesk/docs/02-详细设计.md:439)

问题有两个。

第一，它解决的问题未被证明足够复杂。

文档列出的能力是：

- 去重
- scope cancel
- priority
- timeout
- retries

但这些需求在真实代码里经常只有一两个会稳定存在。很多时候：

- 一个 `Map<string, Promise>` 就能做请求去重
- 一个 `AbortController` 树就能做取消
- priority/retries 往往先不要做，等真实负载出现

第二，示例本身暴露出方案未落地就已偏离运行环境。

文档里直接出现了：

- [docs/02-详细设计.md](/abs/path/C:/Users/nyml/code/WatchDesk/docs/02-详细设计.md:467)

`Bun.sleep?.(...) ?? setTimeout(...)`

这是 Electron + Node + Chromium 项目里非常突兀的痕迹，说明这套设计并不是从当前运行时推出来的，而更像是从某种通用偏好拼装出来的。一个基础调度器示例里出现 Bun 兼容分支，本身就是信号：设计还没有被当前技术栈约束住。

### 6. 事件系统设计过度，已经到了“为了避免 split(':') 而写 lexer/parser”的程度

这是文档里另一个非常典型的过度设计点。

详细设计为事件名引入了：

- lexer
- 递归下降 parser
- AST
- branded `EventName`
- `moduleOf` / `eventOf`
- `emitSafe` / `onSafe`

参考位置：

- [docs/02-详细设计.md](/abs/path/C:/Users/nyml/code/WatchDesk/docs/02-详细设计.md:1584)
- [docs/02-详细设计.md](/abs/path/C:/Users/nyml/code/WatchDesk/docs/02-详细设计.md:1736)

这个设计的根本问题是：它试图用编译器工程的手法，解决一个并不构成真实复杂度的问题。

事件名如果是编译期常量，最自然的做法是：

- 直接用 `as const` 常量
- 用 `keyof EventPayload` 约束
- 必要时用简单 runtime assert

这已经足够了。

现在却引入整套 parser 体系，收益非常小，成本却很真实：

- 学习成本上升
- 调试链路变长
- 事件系统从“工具”变成“子领域”
- 后续每个开发者都要理解这套设计意图

更关键的是，文档一边强调“内部禁止字符串操作解析事件名”，一边又在 `moduleOf` / `eventOf` 中继续 `indexOf`/`slice`：

- [docs/02-详细设计.md](/abs/path/C:/Users/nyml/code/WatchDesk/docs/02-详细设计.md:1722)

这说明规则本身并不稳定。不是字符串操作本身有罪，而是作者先设定了一个过强约束，然后又不得不在内部局部打破它。

### 7. “所有 payload 都用 Uint8Array”这个倾向过强，收益被明显夸大

详细设计里写了：

- [docs/02-详细设计.md](/abs/path/C:/Users/nyml/code/WatchDesk/docs/02-详细设计.md:228)

概要设计也大量强调：

- structured clone
- 零拷贝
- 无 JSON 序列化开销
- 二进制优先

问题是这套表述容易把团队带偏到“为 IPC 性能而性能化”。

先说结论：二进制 payload 当然适合文件内容、哈希结果、大块 buffer；但它不适合作为默认通信心智模型。

原因很简单：

- 大部分应用层命令和查询传递的是结构化对象，不是大 buffer
- DTO 可读性、可调试性、可演进性通常比“统一 Uint8Array”更重要
- structured clone 也不是等于零成本
- 真正的瓶颈很多时候不在 JSON，而在磁盘 I/O、目录扫描、watch 抖动、渲染层更新

文档后面虽然补了一句“混合策略”，但前面的语气和接口示例已经把重心推向“尽量二进制化”。这会影响后续实现决策，导致本来清晰的 DTO 接口被提前低层化。

更稳妥的原则应该是：

- 命令、查询、状态更新：优先结构化 DTO
- 大块二进制：按需使用 `Uint8Array` / `Buffer`
- 是否值得优化复制成本，用测量决定

### 8. Browser/Electron 双环境验证思路是好的，但现在把它上升成“DDD 成立判据”过头了

概要设计把“同一份 renderer 源码，Browser 和 Electron 零改动，仅替换 repo”视为架构是否成立的判定标准：

- [docs/01-概要设计.md](/abs/path/C:/Users/nyml/code/WatchDesk/docs/01-概要设计.md:64)

这个标准的问题在于它容易把“可替换性”绝对化。

对于 Counter 这种例子当然成立；但一旦进入真正的桌面能力，比如：

- 文件监听
- 原生终端
- 系统级快捷键
- 多窗口行为
- 拖拽、剪贴板、shell 集成

Browser 和 Electron 的能力边界天然不同。此时如果还坚持“同一份 renderer 零改动”作为高优先级目标，会逼出很多不自然的抽象：

- 为浏览器 fallback 而设计大量弱化版接口
- 把桌面特性压扁成 lowest common denominator
- 为了保持同构而牺牲桌面端表达力

更合理的理解应该是：

- 对纯 UI/状态/轻业务逻辑，追求双环境复用
- 对桌面特有能力，允许明确分叉

当前文档把这个原则说得过满，后续很容易自缚手脚。

### 9. Main 和 Renderer 各自完整 DDD 分层，会带来高维护成本

详细设计给 Main 和 Renderer 都铺了一整套：

- domain
- application
- infrastructure / infra
- repositories
- errors

这在理论上很整齐，但工程上会带来两个很实际的问题。

第一，概念重复。

很多能力只是“跨 IPC 调一下系统接口”，并不存在值得在两边都维护一层 domain model 的必要。结果会出现：

- renderer 一套 repository 接口
- main 一套 repository 接口
- DTO 在中间来回映射
- 错误类型在两边各自再包装一次

第二，定位成本高。

一个简单功能也可能要跨：

- renderer component
- renderer usecase
- renderer repo
- preload
- main ipc
- main usecase
- main repo/adapter

如果这是高价值复杂业务，还值得；但对大量工具型桌面功能，这个链条太长了。

所以问题不在于“分层不对”，而在于“是否所有模块都值得被这样分层”。当前文档默认答案是“值得”，我认为这是错的。

### 10. 文档把实现细节写得过死，但很多关键设计决策并没有证据支撑

方案中有很多写得非常确定的地方，例如：

- 组件间以事件总线解耦
- Worker 数量按 CPU 核数减一
- 所有边界集中做 schema
- Main 里上 worker pool
- Rust 里用 `tokio + rayon`
- 事件名要 parser

这些都不是不能做，但问题是：它们现在更像“偏好声明”，不是“经过权衡后的决策记录”。

一个成熟方案通常要说明：

- 为什么这个复杂度值得
- 替代方案是什么
- 为什么不选更轻的做法
- 什么证据表明未来确实需要这个能力

而现在文档更多是在直接下结论。于是读起来会有一种很强的感觉：设计并不是由当前问题推导出来，而是由作者偏好的架构美学推出来的。

这类方案最大风险不是“做不出来”，而是“做出来之后很重，但并没有换来对应收益”。

## 次要问题

### 1. 文档内部有一些不稳定信号，说明设计还没完全被现实环境约束

例如：

- Electron 项目示例里出现 `Bun.sleep`
- 一边禁止字符串解析事件名，一边自己用 `indexOf` / `slice`
- 一边说内部零防御，一边很多编排层代码事实上不可避免会处理失败路径

这些不一致不算致命，但说明当前方案还停留在“设计姿态很完整”，还没经过足够多实现约束。

### 2. 安全部分有意识，但还不够贴近 Electron 真正高风险点

安全基线本身没问题，但现在写法偏 checklist。真正值得在方案里更早明确的是：

- IPC capability 如何分组和最小授权
- 文件系统访问边界如何定义
- 哪些路径允许读写
- 外部内容加载是否彻底禁止
- terminal/workflow 未来是否会执行命令，权限模型如何设计

也就是说，文档覆盖了“Electron 常规安全项”，但还没真正进入 WatchDesk 这个产品自己的权限模型。

## 总结

这个方案不是没有能力，恰恰相反，它最大的问题是能力过剩，导致设计密度和当前阶段严重失衡。

优点在于方向感是有的：

- 知道要隔离边界
- 知道要注意 Electron 安全
- 知道要给后续扩展留接口

但缺点更关键：

- 过早平台化
- 过早并发化
- 过早语言规训化
- 过早把简单问题编译器化、框架化、领域化

如果让我给一句总评：

这份方案更像“未来三阶段架构宣言”，而不是“Phase 1 可落地设计”。它最需要的不是再补更多细节，而是主动删掉一半以上的预设复杂度，把第一阶段压缩成一个真正能快速验证、快速迭代、快速推翻的最小系统。

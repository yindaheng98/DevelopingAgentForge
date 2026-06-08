# Developing Pipeline

[`src/developing`](.) 实现三份规划产物准备好之后使用的代码编写循环。常用入口是 [`runs/develop.sh`](../../runs/develop.sh)，它会调用 `npm run developing`，并传入以下路径：

- `paper_blueprint.md`
- `experiment_plan.md`
- `coding_plan.md`
- `skills/academic-army-coding-style/SKILL.md`
- 包含 `TODO.md` 的 artifact 目录
- 目标代码库目录
- development achive 目录

pipeline 会在配置的 `--target-path` 中继续写代码，维护配置的 `--artifact-path` 下的 `TODO.md`，并把每轮 task/review 产物归档到 achive 目录。

TypeScript pipeline 的整体用法和入口见 [`src/README.zh-CN.md`](../README.zh-CN.md)。

## 主流程

[`pipeline.ts`](pipeline.ts) 负责解析 CLI 参数，并重复运行外层 coding-manager 选任务循环和内层 developer/reviewer 修复循环。

每轮迭代执行以下步骤：

1. `coding-manager` 扫描当前 repo 和 artifact 目录中的 `TODO.md`，然后选择一个 developer task。
2. `developer` 加载配置的 coding-style skill，修改 repo，并报告自己改了哪些内容给 reviewer。
3. `code-reviewer` 阅读代码和 developer report，返回严格的 `ACCEPT` 或 revision feedback。
4. 如果 reviewer 返回 feedback，`developer` 继续修同一个任务，然后 `code-reviewer` 再审。
5. review 循环结束后，pipeline 归档 task 和 reports，然后让 `coding-manager` 更新 TODO 文件。
6. 当 `coding-manager` 返回 `FINISHED` 或达到 `--max-iterations` 时停止。

## 重要文件

- [`pipeline.ts`](pipeline.ts)：参数解析、循环编排、archive 创建和各 agent 之间的交接。
- [`agents/factory.ts`](agents/factory.ts)：注册 developing coding manager、developer 和 reviewer agents。
- [`agents/types.ts`](agents/types.ts)：共享的 workspace-aware base class 和变量定义。
- [`agents/manager.ts`](agents/manager.ts)：维护 TODO 文件并选择外层任务。
- [`agents/developer.ts`](agents/developer.ts)：使用共享 coding-style skill 修改目标 repo。
- [`agents/reviewer.ts`](agents/reviewer.ts)：执行只读代码审阅 gate。

## 产物

pipeline 会维护：

- 配置的 artifact 目录下的 `TODO.md`：由 coding-manager 维护的任务列表。
- 按时间戳归档的文件夹，保存 selected task、每次 revision 的 reports 和 TODO update reports。

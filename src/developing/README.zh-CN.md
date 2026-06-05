# Developing Pipeline

[`src/developing`](.) 实现三份规划产物准备好之后使用的代码编写循环。常用入口是 [`runs/develop.sh`](../../runs/develop.sh)，它会调用 `npm run developing`，并传入以下路径：

- `paper_blueprint.md`
- `experiment_plan.md`
- `coding_plan.md`
- 目标代码库目录
- development artifact 和 archive 目录

pipeline 会在配置的 `--target-path` 下写代码，并在配置的 artifact 目录下维护状态。

TypeScript pipeline 的整体用法和入口见 [`src/README.zh-CN.md`](../README.zh-CN.md)。

## 主流程

[`pipeline.ts`](pipeline.ts) 负责解析 CLI 参数、初始化共享路径、创建缺失的状态文件，并重复运行循环，直到 `integration-manager` 返回 `Finished`，或达到 `--max-iterations`。

每轮迭代执行以下步骤：

1. `coding-plan-interpreter` 读取 coding plan、当前 implementation state、上一轮 review/audit/harness 反馈，并选择一个边界明确的任务。
2. `developer` 只实现这个选中的任务。
3. `harness-engineer` 用最小必要的 tests、fixtures、harness checks 或 parser checks 验证该任务。
4. `code-reviewer` 检查代码质量、可维护性、边界、耦合，以及 test 和 harness 是否分离。
5. `experiment-contract-auditor` 检查实现是否仍然符合 paper blueprint、experiment plan、coding plan、metrics、baseline fairness 规则、raw result 要求和 method freeze protocol。
6. `integration-manager` 更新 `implementation_state.md`、`code_overview.md` 和 `next_developer_task.md`，然后返回 `Finished` 或交接下一步 repair/task。

## 重要文件

- [`pipeline.ts`](pipeline.ts)：参数解析、循环编排、archive 创建和各 agent 之间的交接。
- [`agents/factory.ts`](agents/factory.ts)：注册六个 developing agents。
- [`agents/types.ts`](agents/types.ts)：共享的 workspace-aware base class 和变量定义。
- [`agents/prompts.ts`](agents/prompts.ts)：共享的 developing contract 和报告格式。
- [`agents/interpreter.ts`](agents/interpreter.ts)：把 coding plan 和当前状态转成一个边界明确的任务。
- [`agents/developer.ts`](agents/developer.ts)：实现选中的任务。
- [`agents/harness.ts`](agents/harness.ts)：验证行为和实验 harness 输出。
- [`agents/reviewer.ts`](agents/reviewer.ts)：执行只读代码审查。
- [`agents/auditor.ts`](agents/auditor.ts)：执行只读实验契约审计。
- [`agents/manager.ts`](agents/manager.ts)：维护循环状态、代码概览、下一任务交接和最终完成判定。

## 产物

pipeline 会维护：

- `code_overview.md`：生成代码库的动态概览。
- `implementation_state.md`：任务 ID、状态、文件、证据和验证状态。
- `next_developer_task.md`：循环未完成时的 repair 或下一任务交接。
- 按时间戳归档的文件夹，保存每轮的 task、reports、audit、review 和 release decision。

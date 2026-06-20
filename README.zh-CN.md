# developing-agent-forge

基于 `coding-agent-forge` 构建的 goal-driven 代码开发 pipeline，用于 coding agents。

[`src`](src) 实现一个 goal-driven 的代码编写循环。

[English README](README.md)

## 这个 Pipeline 做什么

常用入口是 [`develop.sh`](develop.sh)，它会调用 `npm run developing`，并传入以下路径：

- 通过 `--goal-path` 传入的目标文件
- 通过 `--project-progress-memory-path` 传入的项目进度 memory 目录
- 通过 `--code-design-memory-path` 传入的代码设计 memory 目录
- 目标代码库目录
- development archive 目录；当前 CLI 参数名仍是 `--achive-dir`

pipeline 会在配置的 `--target-path` 中继续写代码，从 `--goal-path` 读取当前高层任务目标，召回并更新 `--project-progress-memory-path` 下的项目进度记忆，召回并更新 `--code-design-memory-path` 下的代码设计记忆，并把每轮 task/review 产物归档到 archive 目录。

## 包公开面

`package.json` 发布的是名为 `developing-agent-forge` 的 ESM package，要求 Node.js `>=20.19`。

- CLI bin：`developing-agent-forge`，由 [`src/cli.ts`](src/cli.ts) 提供，包含 `developing` pipeline。
- 公开 import：`developing-agent-forge`、`developing-agent-forge/agents` 和 `developing-agent-forge/pipeline`。
- 运行时依赖：`coding-agent-forge` 负责 agent/pipeline CLI 执行，`memory-agent-forge` 负责持久化 memory。
- 发布内容包含 `dist`、`developing-forge.yaml`、两份 README 和 `LICENSE`。

TypeScript API import 示例：

```ts
import { developingPipeline } from "developing-agent-forge";
import { CodingManagerAgent } from "developing-agent-forge/agents";
import { ProjectDevLoop } from "developing-agent-forge/pipeline";
```

## 核心思想

`src` 会把当前 goal 变成一条可重复执行的代码编写 trajectory。`coding-manager` 读取当前 repo、goal 和记下来的上下文，写出一个有边界的 Task Brief 或 `FINISHED`；`developer` 修改目标 repo；`code-reviewer` 返回 `ACCEPT`、`REVISE` 或 `REDIRECT`。

## 快速开始

在仓库根目录运行预设 wrapper：

```bash
bash develop.sh
```

使用这个 wrapper 按上面列出的项目约定路径在 `output/codebase` 下写代码。

每次要执行下一个新任务前，先更新当前 goal 文件：

```bash
$EDITOR output/goal.md
bash develop.sh
```

预设 wrapper 会传入 `--goal-path "output/goal.md"`。用这个文件描述下一轮希望开发循环执行的高层任务目标。

## TypeScript 开发

这个仓库要求 Node.js `>=20.19`，并使用 `package.json` 中定义的 npm TypeScript 工作流。

```bash
npm ci
npm run check
npm run lint
npm run format:check
npm run build
```

常用本地脚本入口：

- `npm run dev -- ...` 运行 `tsx src/cli.ts`。
- `npm run developing -- ...` 运行 `tsx src/cli.ts developing`。
- `npm run clean`、`npm run format` 和 `npm run format:check` 分别处理生成产物和格式化。

## Goal 文件和 Memory 上下文

`developing` 接受 `--goal-path <path>`。pipeline 会在运行开始时读取这个文件，并把其中内容作为当前 high-level objective 传给 `coding-manager`、`developer` 和 `code-reviewer`。

每次想执行下一个新任务时，先更新 `--goal-path` 指向的文件，再重新运行 [`develop.sh`](develop.sh)。稳定的项目 contract、任务上下文路径、约束和这一次的任务重点都直接写进这个 goal 文件。

配置的 `--project-progress-memory-path` 存放给 `coding-manager` 做任务选择和项目连续性判断的项目进度记忆。配置的 `--code-design-memory-path` 存放给 `developer` 完成当前任务时使用的代码设计记忆。如果旧上下文不再有用，可以在下一次运行前删除或编辑对应目录下的 memory 文件。

## 直接命令

`develop.sh` 会调用：

```bash
npm run developing -- \
  --config "developing-forge.yaml" \
  --config "secret.yaml" \
  --target-path "output/codebase" \
  --achive-dir "output/developing-archives" \
  --project-progress-memory-path "output/developing/project-progress-memory" \
  --code-design-memory-path "output/developing/code-design-memory" \
  --goal-path "output/goal.md" \
  --max-iterations "100" \
  --max-task-devloop-iterations "10" \
  --max-memory-rounds "3" \
  --memory-clean-interval "0"
```

当前 CLI 参数名是 `--achive-dir`。

如果直接使用发布后的 package bin，把 `npm run developing --` 替换成 `developing-agent-forge developing`，其余 pipeline 参数保持不变。

## 参数参考

| 参数                             | 说明                                                               |
| -------------------------------- | ------------------------------------------------------------------ |
| `--config`                       | 用 `coding-agent-forge` 加载的一个或多个 YAML config 文件。        |
| `--target-path`                  | 目标代码库目录。                                                   |
| `--achive-dir`                   | Project development archive 目录。                                 |
| `--project-progress-memory-path` | 用于保持项目进度连续性的 memory 目录。                             |
| `--code-design-memory-path`      | 用于保持代码设计连续性的 memory 目录。                             |
| `--goal-path`                    | 包含当前 high-level objective 和 task context 的 Markdown 文件。   |
| `--max-iterations`               | 当 `coding-manager` 尚未返回 `FINISHED` 时限制外层循环。           |
| `--max-task-devloop-iterations`  | 限制每个 selected task 的 developer/reviewer 尝试次数。            |
| `--max-memory-rounds`            | 限制 memory recall 和 remember 的 refinement 轮数。                |
| `--memory-clean-interval`        | 每隔多少轮 project iteration 自动清理 memory；`0` 表示不自动清理。 |

## 主流程

[`pipeline/pipeline.ts`](src/pipeline/pipeline.ts) 负责解析 CLI 参数，并把 project development workflow 交给 [`pipeline/project-devloop.ts`](src/pipeline/project-devloop.ts)。

每轮迭代执行以下步骤：

1. `coding-manager` 先判断需要回忆什么，pipeline 再召回匹配的记忆，然后 `coding-manager` 扫描当前 repo、`--goal-path` 中的 goal 和记下来的上下文，写出一个 Markdown Task Brief 或 `FINISHED`。如果 select 输出不是以 `FINISHED` 或 `# Task Brief` 开头，manager agent 会要求同一个 thread 修正格式。
2. `developer` 修改 repo，并报告自己改了哪些内容给 reviewer。
3. `code-reviewer` 阅读 Task Brief、Developer report 和召回的 code-design memory，返回 `ACCEPT`、`REVISE` 或 `REDIRECT`。如果输出不是以这三个决策之一开头，reviewer agent 会要求同一个 thread 修正格式。
4. `REVISE` 会把反馈送回 `developer`；`REDIRECT` 会把控制权交回 `coding-manager`；`ACCEPT` 表示当前 task 完成。
5. review 循环结束后，pipeline 归档完整 transcript，写出包含 Task Brief、最终决策和 Developer/Reviewer report 正文的 `task_round_summary.md`，让 memory update prompts 输出有什么需要记下，并通过 `memory-agent-forge` 写入记忆。
6. 如果 `--memory-clean-interval` 是正数，且刚完成的 project iteration 是它的倍数，pipeline 会清理两个已配置的 memory 目录。
7. 下一轮 project iteration 里，`coding-manager` 的 recall 和 task selection 会收到上一轮 `task_round_summary.md` 正文作为 `lastTaskRoundSummary`，所以 `REDIRECT` 可以直接影响下一次 Task Brief。
8. 当 `coding-manager` 返回 `FINISHED` 或达到 `--max-iterations` 时停止。

## 输出产物

pipeline 会维护：

| Artifact             | 位置                                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Memory files         | 配置的 project progress 和 code design memory 目录下，由 `memory-agent-forge` 维护。                                                                     |
| 按时间戳归档的文件夹 | 配置的 archive 目录下，保存 Task Brief、memory recall guidance、recalled memory、Developer reports、Reviewer feedback、summaries 和 things to remember。 |

## 重要文件

| 路径                                                             | 作用                                                                                                       |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [`pipeline/pipeline.ts`](src/pipeline/pipeline.ts)               | CLI 参数解析和基础 `developing` pipeline 包装。                                                            |
| [`pipeline/project-devloop.ts`](src/pipeline/project-devloop.ts) | 外层 project workflow、archive 创建、memory recall/update、上一轮 task summary 传递和各 agent 之间的交接。 |
| [`pipeline/task-devloop.ts`](src/pipeline/task-devloop.ts)       | 针对一个 selected task 的内层 developer/reviewer 循环。                                                    |
| [`agents/factory.ts`](src/agents/factory.ts)                     | 注册 developing coding manager、developer 和 reviewer agents。                                             |
| [`agents/types.ts`](src/agents/types.ts)                         | 共享的 workspace-aware base class 和变量定义。                                                             |
| [`agents/manager.ts`](src/agents/manager.ts)                     | 判断需要回忆什么、选择外层任务、校验 select 输出格式，并输出有什么需要记下。                               |
| [`agents/developer.ts`](src/agents/developer.ts)                 | 修改目标 repo。                                                                                            |
| [`agents/reviewer.ts`](src/agents/reviewer.ts)                   | 执行只读代码审阅 gate、校验 review 输出格式，并返回 `ACCEPT`、`REVISE` 或 `REDIRECT`。                     |

## 常见问题

| 问题                      | 常见原因                                              | 解决办法                                                                   |
| ------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------- |
| Loop 以 `FINISHED` 停止   | `coding-manager` 判断不需要继续选择 developing task。 | 检查 memory 目录和最新 archive。                                           |
| 某个任务持续返回 `REVISE` | 内层 developer/reviewer 循环尚未达到 `ACCEPT`。       | 阅读按时间戳归档的 Developer reports 和 Reviewer feedback。                |
| 某个任务返回 `REDIRECT`   | reviewer 判断当前任务方向或前提需要改变。             | 查看 `task_round_summary.md`；它的正文会传入下一轮 manager 任务选择。      |
| 新 goal 仍然继承旧上下文  | 某个 memory 目录里还保留旧任务状态。                  | 更新 `--goal-path`；必要时编辑或删除过时 memory 文件，再重新运行 wrapper。 |
| Archive 参数看起来拼错    | 当前 CLI 参数名就是 `--achive-dir`。                  | 在 CLI 改名前继续使用当前参数名。                                          |

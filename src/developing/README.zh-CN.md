# Developing Pipeline

[`src/developing`](.) 实现三份规划产物准备好之后使用的代码编写循环。

[English README](README.md)

## 这个 Pipeline 做什么

常用入口是 [`runs/develop.sh`](../../runs/develop.sh)，它会调用 `npm run developing`，并传入以下路径：

- `paper_blueprint.md`
- `experiment_plan.md`
- `coding_plan.md`
- 通过 `--goal-path` 传入的目标文件
- `skills/academic-army-coding-style/SKILL.md`
- 包含 `TODO.md` 的 artifact 目录
- 目标代码库目录
- development archive 目录；当前 CLI 参数名仍是 `--achive-dir`

pipeline 会在配置的 `--target-path` 中继续写代码，从 `--goal-path` 读取当前高层任务目标，维护配置的 `--artifact-path` 下的 `TODO.md`，并把每轮 task/review 产物归档到 archive 目录。

TypeScript pipeline 的整体用法和入口见 [`src/README.zh-CN.md`](../README.zh-CN.md)。

## 核心思想：Developing 和 Coding Style

`src/developing` 会把三份规划产物变成一条可重复执行的代码编写 trajectory。`coding-manager` 读取当前 repo 和 `TODO.md`，选择一个具体 developer task；`developer` 修改目标 repo；`code-reviewer` 返回严格的 `ACCEPT`，或者把 revision feedback 送回同一个 task。

coding-style skill 是 [`skills/academic-army-coding-style/SKILL.md`](../../skills/academic-army-coding-style/SKILL.md)。它的功能是控制写代码 agent 的代码结构和代码风格。上游用户任务决定要实现什么；这个 skill 决定如何让实现保持 readable、local、low-coupling，并和当前 framework 保持一致。

每次 developer run 都会通过 `--coding-style-skill-path` 加载配置的 coding-style skill。[`agents/developer.ts`](agents/developer.ts) 会把 [`agents/prompts.ts`](agents/prompts.ts) 里的说明放到 developer prompt 前面：先 load and follow 这个 skill，再读取 blueprint、experiment plan、coding plan、repo files 和 current task。这样负责写代码的 agent 在 feature、refactor、harness/test work、methods、baselines、metrics、result exports 和 framework docs 等各种任务里，都会用同一套代码结构和风格偏好，保证输出的代码结构和风格统一。

`academic-army-coding-style` 对各种代码编写任务都是通用的。它不决定 research method、experiment content、task priority 或 repository template initialization；它只关心代码结构和风格，让代码 concise、readable、low-friction、easy to modify，并贴合现有 repo 结构。

任何对代码结构和代码风格的长期偏好，都放进 [`metaskills/academic-army-coding-style/METASKILL.md`](../../metaskills/academic-army-coding-style/METASKILL.md)，然后在仓库根目录运行 [`runs/develop-skill.sh`](../../runs/develop-skill.sh) 来更新这个 skill。

## 快速开始

在仓库根目录运行预设 wrapper：

```bash
bash runs/develop.sh
```

使用这个 wrapper 按上面列出的项目约定路径在 `output/codebase` 下写代码。

每次要执行下一个新任务前，先更新当前 goal 文件：

```bash
$EDITOR output/goal.md
bash runs/develop.sh
```

预设 wrapper 会传入 `--goal-path "output/goal.md"`。用这个文件描述下一轮希望开发循环执行的高层任务目标。

## Goal 文件和临时 TODO 上下文

`developing` 和 `developing-skill` 现在都接受 `--goal-path <path>`。pipeline 会在运行开始时读取这个文件，并把其中内容作为当前 high-level objective 传给 `coding-manager`、`developer`、`code-reviewer` 和 `trajectory-optimizer`。

每次想执行下一个新任务时，先更新 `--goal-path` 指向的文件，再重新运行 [`runs/develop.sh`](../../runs/develop.sh) 或 [`runs/develop-skill.sh`](../../runs/develop-skill.sh)。三份规划产物仍然提供稳定的项目 contract；goal 文件用来告诉开发循环“这一次重点做什么”。

配置的 `--artifact-path` 下的 `TODO.md` 是当前由 `coding-manager` 维护的临时任务记忆文件。如果现有 TODO 内容开始把旧任务和新任务上下文串味，可以在下一次运行前手动删除当前 TODO 文件，例如 `output/developing/TODO.md`。pipeline 会自动重新创建一个空 TODO 文件。

这个 `TODO.md` workflow 是临时记忆机制。之后会实现更高级的记忆机制来替代或扩展它，所以现在可以把这个文件理解成用于保持任务连续性的过渡方案，而不是最终的长期记忆设计。

## 直接命令

`runs/develop.sh` 会调用：

```bash
npm run developing -- \
  --config "agent-forge.yaml" \
  --config "secret.yaml" \
  --target-path "output/codebase" \
  --achive-dir "output/developing-archives" \
  --artifact-path "output/developing" \
  --coding-style-skill-path "skills/academic-army-coding-style" \
  --paper-blueprint-path "output/paper_blueprint.md" \
  --experiment-plan-path "output/experiment_plan.md" \
  --coding-plan-path "output/coding_plan.md" \
  --goal-path "output/goal.md" \
  --max-iterations "100" \
  --max-revision-iterations "10"
```

当前 CLI 参数名是 `--achive-dir`。

## 参数参考

| 参数                        | 说明                                                        |
| --------------------------- | ----------------------------------------------------------- |
| `--config`                  | 用 `coding-agent-forge` 加载的一个或多个 YAML config 文件。 |
| `--target-path`             | 目标代码库目录。                                            |
| `--achive-dir`              | Development archive 目录。                                  |
| `--artifact-path`           | 包含 `TODO.md` 的 artifact 目录。                           |
| `--coding-style-skill-path` | 配置的 coding-style skill。                                 |
| `--paper-blueprint-path`    | `paper_blueprint.md`。                                      |
| `--experiment-plan-path`    | `experiment_plan.md`。                                      |
| `--coding-plan-path`        | `coding_plan.md`。                                          |
| `--goal-path`               | 包含当前 high-level objective 的 Markdown 文件。             |
| `--max-iterations`          | 当 `coding-manager` 尚未返回 `FINISHED` 时限制外层循环。    |
| `--max-revision-iterations` | 限制内层 developer/reviewer 修复循环。                      |

## 主流程

[`pipeline.ts`](pipeline.ts) 负责解析 CLI 参数，并重复运行外层 coding-manager 选任务循环和内层 developer/reviewer 修复循环。

每轮迭代执行以下步骤：

1. `coding-manager` 扫描当前 repo、`--goal-path` 中的 goal，以及 artifact 目录中的 `TODO.md`，然后选择一个 developer task。
2. `developer` 加载配置的 coding-style skill，修改 repo，并报告自己改了哪些内容给 reviewer。
3. `code-reviewer` 阅读代码和 developer report，返回严格的 `ACCEPT` 或 revision feedback。
4. 如果 reviewer 返回 feedback，`developer` 继续修同一个任务，然后 `code-reviewer` 再审。
5. review 循环结束后，pipeline 归档 task 和 reports，然后让 `coding-manager` 更新 TODO 文件。
6. 当 `coding-manager` 返回 `FINISHED` 或达到 `--max-iterations` 时停止。

## developing-skill 和 Trajectory Feedback

[`runs/develop-skill.sh`](../../runs/develop-skill.sh) 会调用 [`pipelineskill.ts`](pipelineskill.ts) 中的 `developing-skill` pipeline。它复用同一套开发循环，额外传入 `--metaskill-path`，并在 revision loop 前和 TODO 更新后调用 `trajectory-optimizer`，让 coding-style skill 能根据具体开发反馈继续优化。

第一次 `trajectory-optimizer` 调用发生在 developer 开始前，使用 `scan` 模式。它会读取目标 repo、当前 coding-style skill、blueprint、experiment plan 和 coding plan，让 optimizer 拿到和代码编写循环相同的项目上下文。

第二次 `trajectory-optimizer` 调用发生在 TODO update report 生成后，使用 `optimize` 模式。它会读取 metaskill、target repo、plans、current task、revision report 和 TODO update report；根据 [`metaskills/academic-army-coding-style/METASKILL.md`](../../metaskills/academic-army-coding-style/METASKILL.md) 中写的偏好评估这次修改 trajectory 的质量；然后直接修改 coding-style skill。这个 prompt 会重点检查哪些 guidance 缺失、误导或冗余，并看这些问题是否影响 task selection、coding、review 或 TODO update。

推荐的使用循环是：

1. 把代码风格偏好、failure modes 和 review tips 写进 [`metaskills/academic-army-coding-style/METASKILL.md`](../../metaskills/academic-army-coding-style/METASKILL.md)。
2. 运行 `bash runs/develop-skill.sh`。
3. 让 `developer`、`code-reviewer`、`coding-manager` 和 `trajectory-optimizer` 暴露当前 skill 在真实开发轨迹里哪里有效、哪里失效。
4. 检查更新后的 [`skills/academic-army-coding-style/SKILL.md`](../../skills/academic-army-coding-style/SKILL.md)，保留有用修改；当出现新的代码偏好时继续重复。

这就是 coding-style 版本的 skill self-improvement：metaskill 说明什么是“好的代码风格 guidance”，trajectory 记录 agent 实际如何修改代码，`develop-skill` 根据这些证据修改可复用的 skill，让这个 skill 越用越强。

相关研究也在支持类似方向；这里的 `developing-skill` 是 AcademicArmy 的本地实现，不是对下面论文的直接复现：

- [Reflexion](https://arxiv.org/abs/2303.11366) 展示了 language agents 可以把任务反馈转成 verbal reflection，在不更新模型权重的情况下跨 trial 改善表现。
- [Agent Trajectory Explorer](https://research.ibm.com/publications/agent-trajectory-explorer-visualizing-and-providing-feedback-on-agent-trajectories) 讨论了 raw agent trajectory 不适合直接做人工分析，需要更容易浏览的格式来检查行为并提供 future improvement feedback。
- [Agent-as-a-Judge](https://openreview.net/forum?id=Nn9POI9Ekt) 使用 agentic evaluator 评价 agentic code-generation systems，强调评价时不只看 final output，也看 step-by-step task-solving process。
- [When Agents go Astray](https://arxiv.org/abs/2509.02360) 研究 software-engineering agents 的 trajectory-level errors，并用 process feedback 在执行中检测和纠正低效 trajectory。

## 输出产物

pipeline 会维护：

| Artifact             | 位置                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `TODO.md`            | 配置的 artifact 目录下，由 coding-manager 维护的临时任务记忆文件。                           |
| 按时间戳归档的文件夹 | 配置的 archive 目录下，保存 selected task、每次 revision 的 reports 和 TODO update reports。 |

## 重要文件

| 路径                                                               | 作用                                                                          |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| [`pipeline.ts`](pipeline.ts)                                       | 参数解析、循环编排、archive 创建和各 agent 之间的交接。                       |
| [`pipelineskill.ts`](pipelineskill.ts)                             | 给基础开发循环增加 trajectory optimization hooks 的 `developing-skill` 包装。 |
| [`agents/factory.ts`](agents/factory.ts)                           | 注册 developing coding manager、developer 和 reviewer agents。                |
| [`agents/types.ts`](agents/types.ts)                               | 共享的 workspace-aware base class 和变量定义。                                |
| [`agents/manager.ts`](agents/manager.ts)                           | 维护 TODO 文件并选择外层任务。                                                |
| [`agents/developer.ts`](agents/developer.ts)                       | 使用共享 coding-style skill 修改目标 repo。                                   |
| [`agents/reviewer.ts`](agents/reviewer.ts)                         | 执行只读代码审阅 gate。                                                       |
| [`agents/trajectory-optimizer.ts`](agents/trajectory-optimizer.ts) | 扫描开发轨迹，并为 `developing-skill` 提出 coding-style skill 优化建议。      |

## 常见问题

| 问题                               | 常见原因                                             | 解决办法                                          |
| ---------------------------------- | ---------------------------------------------------- | ------------------------------------------------- |
| Loop 以 `FINISHED` 停止            | `coding-manager` 判断不需要继续选择 developer task。 | 检查 artifact 目录中的 `TODO.md` 和最新 archive。 |
| 某个任务持续返回 revision feedback | 内层 developer/reviewer 修复循环尚未达到 `ACCEPT`。  | 阅读按时间戳归档的 per-revision reports。         |
| 新 goal 仍然继承旧上下文           | 临时 `TODO.md` 里还保留旧任务状态。                  | 更新 `--goal-path`；必要时先删除 `output/developing/TODO.md`，再重新运行 wrapper。 |
| Archive 参数看起来拼错             | 当前 CLI 参数名就是 `--achive-dir`。                 | 在 CLI 改名前继续使用当前参数名。                 |

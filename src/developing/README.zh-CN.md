# Developing Pipeline

[`src/developing`](.) 实现三份规划产物准备好之后使用的代码编写循环。

[English README](README.md)

## 这个 Pipeline 做什么

常用入口是 [`runs/develop.sh`](../../runs/develop.sh)，它会调用 `npm run developing`，并传入以下路径：

- `paper_blueprint.md`
- `experiment_plan.md`
- `coding_plan.md`
- `skills/academic-army-coding-style/SKILL.md`
- 包含 `TODO.md` 的 artifact 目录
- 目标代码库目录
- development archive 目录；当前 CLI 参数名仍是 `--achive-dir`

pipeline 会在配置的 `--target-path` 中继续写代码，维护配置的 `--artifact-path` 下的 `TODO.md`，并把每轮 task/review 产物归档到 archive 目录。

[`runs/develop-skill.sh`](../../runs/develop-skill.sh) 会调用 [`pipelineskill.ts`](pipelineskill.ts) 中的 `developing-skill` pipeline。它复用同一套开发循环，额外传入 `--metaskill-path`，并在 revision loop 前和 TODO 更新后调用 `trajectory-optimizer`，让 coding-style skill 能根据具体开发反馈继续优化。

TypeScript pipeline 的整体用法和入口见 [`src/README.zh-CN.md`](../README.zh-CN.md)。

## 快速开始

在仓库根目录运行预设 wrapper：

```bash
bash runs/develop.sh
```

使用这个 wrapper 按上面列出的项目约定路径在 `output/codebase` 下写代码。

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
  --max-iterations "100" \
  --max-revision-iterations "10"
```

当前 CLI 参数名是 `--achive-dir`。

## 参数参考

| 参数 | 说明 |
|---|---|
| `--config` | 用 `coding-agent-forge` 加载的一个或多个 YAML config 文件。 |
| `--target-path` | 目标代码库目录。 |
| `--achive-dir` | Development archive 目录。 |
| `--artifact-path` | 包含 `TODO.md` 的 artifact 目录。 |
| `--coding-style-skill-path` | 配置的 coding-style skill。 |
| `--paper-blueprint-path` | `paper_blueprint.md`。 |
| `--experiment-plan-path` | `experiment_plan.md`。 |
| `--coding-plan-path` | `coding_plan.md`。 |
| `--max-iterations` | 当 `coding-manager` 尚未返回 `FINISHED` 时限制外层循环。 |
| `--max-revision-iterations` | 限制内层 developer/reviewer 修复循环。 |

## 主流程

[`pipeline.ts`](pipeline.ts) 负责解析 CLI 参数，并重复运行外层 coding-manager 选任务循环和内层 developer/reviewer 修复循环。

每轮迭代执行以下步骤：

1. `coding-manager` 扫描当前 repo 和 artifact 目录中的 `TODO.md`，然后选择一个 developer task。
2. `developer` 加载配置的 coding-style skill，修改 repo，并报告自己改了哪些内容给 reviewer。
3. `code-reviewer` 阅读代码和 developer report，返回严格的 `ACCEPT` 或 revision feedback。
4. 如果 reviewer 返回 feedback，`developer` 继续修同一个任务，然后 `code-reviewer` 再审。
5. review 循环结束后，pipeline 归档 task 和 reports，然后让 `coding-manager` 更新 TODO 文件。
6. 当 `coding-manager` 返回 `FINISHED` 或达到 `--max-iterations` 时停止。

## 输出产物

pipeline 会维护：

| Artifact | 位置 |
|---|---|
| `TODO.md` | 配置的 artifact 目录下，由 coding-manager 维护的任务列表。 |
| 按时间戳归档的文件夹 | 配置的 archive 目录下，保存 selected task、每次 revision 的 reports 和 TODO update reports。 |

## 重要文件

| 路径 | 作用 |
|---|---|
| [`pipeline.ts`](pipeline.ts) | 参数解析、循环编排、archive 创建和各 agent 之间的交接。 |
| [`pipelineskill.ts`](pipelineskill.ts) | 给基础开发循环增加 trajectory optimization hooks 的 `developing-skill` 包装。 |
| [`agents/factory.ts`](agents/factory.ts) | 注册 developing coding manager、developer 和 reviewer agents。 |
| [`agents/types.ts`](agents/types.ts) | 共享的 workspace-aware base class 和变量定义。 |
| [`agents/manager.ts`](agents/manager.ts) | 维护 TODO 文件并选择外层任务。 |
| [`agents/developer.ts`](agents/developer.ts) | 使用共享 coding-style skill 修改目标 repo。 |
| [`agents/reviewer.ts`](agents/reviewer.ts) | 执行只读代码审阅 gate。 |
| [`agents/trajectory-optimizer.ts`](agents/trajectory-optimizer.ts) | 扫描开发轨迹，并为 `developing-skill` 提出 coding-style skill 优化建议。 |

## 常见问题

| 问题 | 常见原因 | 解决办法 |
|---|---|---|
| Loop 以 `FINISHED` 停止 | `coding-manager` 判断不需要继续选择 developer task。 | 检查 artifact 目录中的 `TODO.md` 和最新 archive。 |
| 某个任务持续返回 revision feedback | 内层 developer/reviewer 修复循环尚未达到 `ACCEPT`。 | 阅读按时间戳归档的 per-revision reports。 |
| Archive 参数看起来拼错 | 当前 CLI 参数名就是 `--achive-dir`。 | 在 CLI 改名前继续使用当前参数名。 |

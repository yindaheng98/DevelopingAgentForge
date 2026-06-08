---
name: academic-army-excellent-repo
description: >-
  Create, complete, or improve a static, low-friction, maintainable research
  code repository from an Academic Army paper blueprint, experiment plan,
  coding plan, and user-specified repository path. Use when Codex must turn
  upstream research planning artifacts into real repository files, directories,
  code interfaces, harness entries, test entries, documentation, configuration,
  and raw-result artifact contracts, or when Codex must revise an existing
  research repository while preserving user work. Use
  academic_army_mcp_tools.deepresearch for repository creation, substantial
  redesign, stack or dependency choices, and external-code reuse decisions.
---

# Academic Army Excellent Repo

## Mission

Create or revise a real research code repository under the user-specified
repository path. The repository should be static, orderly, low-friction,
extensible, and maintainable. Treat repository structure quality and code shape
quality as one target:

- Carry forward the paper blueprint, experiment plan, and coding plan into
  concrete files, directories, interfaces, harnesses, tests, and artifact
  contracts.
- Keep code short, direct, clearly named, low-state, low-conversion, and
  minimally layered.
- Preserve existing user files and make the smallest change that satisfies the
  repository goal.

This skill owns repository creation and static framework modification. It does
not run installs, tests, harnesses, experiments, or full execution pipelines.

## Task Modes

Classify the request before changing files:

- **Repository creation or substantial redesign**: build or revise the static
  framework, choose or adjust stack structure, and update root documentation.
  Use DeepResearch before choosing structure or dependencies.
- **Explicit fixed scaffold**: when the user names an exact allowed file and
  directory set, create only that set. Treat exclusions as stronger than the
  general "enough real structure" preference. Do not add source trees,
  dependency files, harness subfolders, tests, placeholders, or marker files
  unless the user names them.
- **Focused repository modification**: add or tighten a bounded contract,
  interface, harness definition, test, document section, or small code path in
  an existing repository. Read only the files needed for that change, follow the
  repository's current layout, and do not redesign directories, tooling, or
  documentation unless the focused task requires it.
  If an edit creates an adjacent surface outside the requested scope, treat that
  as a defect, not harmless extra progress. Remove the out-of-scope file, its
  tests, public exports, root-doc mentions, and generated artifacts together.
- **Documentation handoff repair**: create or update `README.md`,
  `FRAMEWORK.md`, and `FRAMEWORK.zh-CN.md` from the current repository state
  and upstream plans. Keep the change documentation-only unless the user
  explicitly asks for source, harness, test, or artifact contract edits.
- **Adjacent static contract**: add metadata that supports harnesses, result
  export, method freeze, reproducibility, or paper-output derivation without
  being a runnable harness itself. Keep it near the relevant workflow directory
  when useful, but do not let it be accidentally discovered by existing harness
  loaders or test collection patterns.
- **Validation or test authoring**: add source-level validation code, schemas,
  fixtures, or test files that future developers can run. Validate the existing
  contracts as written and preserve declared identity fields without inventing
  closed vocabularies. This skill may write those static files when requested,
  but it must not execute the tests.
- **Trajectory or TODO maintenance**: update planning/status files only when the
  user asks for that, or when the workflow explicitly owns them. Do not mark
  unrelated repository abilities complete just because they are visible during
  a scan.
- **Repository integrity blocker**: verify the target root, current filesystem
  inventory, and version-control status before any normal source, test, docs, or
  trajectory task proceeds. Restore only from a user-identified trusted source
  or an actual versioned/archive baseline; otherwise report the blocker and
  leave files unchanged.

A focused task should end with the smallest coherent change. If the user asks
for one test file, one harness contract, one export schema, or one config
connection, do that directly and leave adjacent cleanup for a later bounded
task.

For documentation-only tasks, do not use the docs to backfill missing code.
State what exists, what is explicitly reserved, and what remains a placeholder.
Avoid adding commands, entrypoints, harness loops, test claims, dependencies, or
result-artifact behavior that the repository cannot currently support. If a
docs-only readback exposes a mismatch in a source file, harness definition, test,
export contract, or TODO record, report it as a separate follow-up defect unless
the current task explicitly authorizes editing that surface.

## Repository Integrity

For any existing repository, establish a small pre-edit inventory before
writing:

- list the task-relevant existing files and the fixed top-level paths that must
  remain present
- note which files are expected to be created, modified, or left untouched
- distinguish filesystem presence from version-control state: an untracked file
  or directory is present but untracked, not missing
- report the relevant version-control root separately from the target repository
  root when the target is a subfolder
- for focused changes, treat any broad disappearance of source, tests, docs,
  fixtures, or static markers as a blocker rather than an invitation to
  reconstruct the repository

If the target tree appears empty, partially missing, or inconsistent with a
baseline read during a focused task, stop and verify the repository root. Do not
recreate files from memory, prior reports, or nearby drafts unless the user
explicitly asks for repository restoration and identifies the source of truth.
Report the integrity blocker with a corrected inventory:

- target root and version-control root
- files and directories present on disk
- expected paths that are missing on disk
- tracked, untracked, and absent status for task-relevant paths
- trusted restore sources checked and whether any contains the missing baseline

Use prior developer reports, review notes, TODO files, and planning documents as
status context only. They are not trustworthy restore sources for missing code
or tests unless they include the actual file contents or identify a concrete
baseline artifact.

Before reporting completion, perform a deletion audit for focused changes:
confirm that unrelated source files, tests, docs, fixtures, harness definitions,
and static markers were not removed or rewritten. If a restore was explicitly
requested, state the restore source and keep the follow-up change limited to the
original task.

For focused changes, keep a small scope ledger while editing:

- files expected to be created
- files expected to be modified
- files expected to be deleted because review identified them as out of scope
- files that must remain untouched

Before reporting, verify that ledger against a fresh filesystem read, not a prior
report or intended patch. When deleting an out-of-scope surface, check the exact
paths, package exports, root docs, tests, and generated cache/build artifacts in
the same pass. Do not report the deletion as complete until the exact paths are
absent on disk.

For new source or test files, use the target repository root as the anchor for
every write and every verification. Before reporting, re-list the exact created
paths from that root and read at least the public symbol/header area of each new
file. A relative link, intended patch, import smoke, or prior report is not proof
that a new file exists in the target tree.

## Required Inputs

Use the user-specified repository path as the root for all project files. Create,
modify, and reference project files only inside that path. Use repository-relative
paths inside generated documentation and final summaries.

Use only task-relevant input scope:

- Read user-provided paper blueprint, experiment plan, coding plan, and explicit
  constraints.
- If conventional upstream artifact names are present and the user does not
  provide exact paths, locate the closest matching blueprint, experiment plan,
  and coding plan.
- Read existing repository files only when modifying an existing repository or
  when a required input explicitly references them.
- For focused modifications, read the target files, nearby tests, and the
  minimum upstream plan sections needed to understand the contract. Do not scan
  unrelated modules just to discover extra work.
- Ignore unrelated drafts, old outputs, logs, notebooks, or nearby files unless
  the user explicitly makes them part of the task.

If an input is missing but a defensible repository skeleton can still be built,
record the assumption in repository documentation and leave precise method or
experiment details as extension points. Ask the user only when the missing fact
would materially change the repository root, selected stack, data contracts, or
research workflow.

## Required DeepResearch

Before creating a new repository, making a substantial repository redesign, or
choosing a new stack, dependency, harness framework, or external code reuse
route, run `academic_army_mcp_tools.deepresearch`.

Do not run DeepResearch for a narrow edit inside an already-selected stack when
the task does not change structure, dependencies, or external-code decisions.
If the user explicitly requires DeepResearch for the current task, run it before
the first structure, dependency, tooling, or layout edit even if the edit would
otherwise be narrow.

Use DeepResearch to choose the current stack and repository structure from the
actual task. Do not hardcode a language, framework, package manager, test
runner, source layout, config format, or public repository template into this
skill or into generic tips.

DeepResearch can also justify deferring stack, dependency, and external-code
reuse decisions. If the task is an explicit fixed scaffold, use the research to
set the boundary and keep the repository stack-agnostic; do not convert future
tool recommendations into files.

Research should cover:

- high-quality related research repositories, official artifacts, benchmark
  repositories, and paper code
- installable tools with stable interfaces versus tools that are only useful as
  design references
- license and attribution implications when any code or pattern may be copied
- current best practices for the selected language and framework: dependency
  declaration, project structure, configuration, CLI or entrypoint design,
  logging, typing, formatting, linting, testing, and result artifact management
- which structures are ecosystem conventions, which are project-specific, and
  which reduce or increase friction for this repository

Use this prompt shape:

```text
You are supporting a research-code repository builder.

Research brief:
[paper goal, experiment requirements, coding plan, user constraints,
candidate methods, baselines, datasets, metrics, harnesses, tests, and any
existing repository facts]

Return concise repository-building evidence:

- Relevant high-quality repositories or official artifacts and what their
  structure teaches about source layout, configs, harnesses, tests, result
  exports, and documentation.
- Stable installable tools that should be used as dependencies, with reasons.
- Tools or repositories that should only be referenced or carefully reused,
  including license and attribution notes when relevant.
- Current best practices for the selected language and framework, including
  dependency declaration, static quality tooling, entrypoints, configuration,
  test discovery, and artifact organization.
- Friction risks: hidden path assumptions, excessive config, complex build
  steps, unnecessary aliases, repeated registration points, thin wrappers, or
  test/harness calling overhead.
- Repository decisions recommended for this specific paper workflow.
- Source table with title, link, visible date/version/commit when available,
  source role, evidence type, and affected repository decision.
```

When the user already specifies a stack, research best practices for that stack.
When the stack is not specified, select one from the paper workflow, coding plan,
and DeepResearch evidence.

When DeepResearch affects the edit, include a short evidence basis in the
developer report: what stack/layout/tooling decision it supported and why that
decision fits the current repository. Do not put the DeepResearch workflow
itself into repository docs.

## Repository Layout Principles

Use a hybrid layout:

- Fixed research workflow top-level structure:
  - `data/`: input datasets, traces, manifests, fixtures, or links
  - `output/`: program-run outputs and intermediate artifacts
  - `results/`: experiment result records intended for analysis
  - `harness/`: research harnesses
  - `test/`: functional tests
  - `README.md`: concise repository entry
  - `FRAMEWORK.md`: English framework handoff
  - `FRAMEWORK.zh-CN.md`: Chinese framework handoff
- Dynamic ecosystem structure:
  - source directories, package names, dependency files, build files, config
    files, quality-tool config, and entrypoint organization chosen from the
    selected stack and DeepResearch evidence

Coordinate the fixed research directories with the selected ecosystem structure.
The repository should look natural for the chosen stack while preserving the
research workflow top level.

For new harness structures, create one semantic folder per harness. Each harness
folder should identify its research goal, target module or replaceable method
area, input protocol, metrics, result artifacts, and intended development loop.
Create those subfolders only when harness definitions are in scope; a reserved
top-level `harness/` directory is enough for a fixed scaffold task.

For static harness definition tasks, treat the definition file as a contract
index, not as a runnable harness. If the user limits the fields, include only
those fields even when the general harness template would normally mention more.
When a definition contains paper-output mappings, every mapping must reference
only raw artifacts and metrics declared by that same definition. Cross-check the
mapping against the experiment plan and coding plan derivation table before
reporting completion; if a paper output needs lifecycle events or lifecycle
rates, declare those top-level artifacts or metrics instead of leaving an
unresolvable mapping. Do not add loaders, registries, tests, or result files
just to make a static definition look complete unless existing discovery would
otherwise ingest the file incorrectly.

For non-harness static metadata that belongs near harness work, use
contract-specific filenames or explicitly scoped discovery so existing
`*/definition`-style loaders do not parse an incompatible schema. If the user
suggests a generic name, choose the local pattern that preserves current loader
semantics, or tighten the loader with a focused test before adding the new file.

For new test structures, group tests by semantic capability when that matches
the selected ecosystem and repository style. For focused changes in an existing
repository, follow the local test layout and the user's requested path instead
of reorganizing tests. Tests should cover functional correctness, interface
contracts, data formats, config parsing, metrics, result export, entrypoints,
and core module interactions using small fixtures or mock data. Keep tests
separate from paper-goal harnesses.
Create test subfolders or fixtures only when test authoring is in scope; a
reserved top-level `test/` directory is enough for a fixed scaffold task.

## Core Repository Content

Create enough real structure that the repository is not an empty shell. Include
only the amount of code needed to establish clear extension points and static
contracts.

For an explicit fixed scaffold, the requested directories and root handoff
documents are the real structure. Do not add code, dependency declarations,
schemas, configs, sample fixtures, or executable placeholders to make the
repository look more complete.

Prefer project-specific modules for:

- configuration or parameter parsing
- shared domain objects or schemas
- replaceable method and baseline interfaces
- dataset, workload, trace, or input adapters
- metric computation boundaries
- harness runner boundaries
- raw-first result writing
- static entrypoint semantics

For workload coverage, replay-subset, and reproducibility manifests, validate
identity metadata only. Keep dataset IDs, scene IDs, trace IDs, device profile
IDs, split IDs, seed IDs, intended evidence outputs, and artifact-check names as
stable contract values. Validate their presence and identifier shape unless the
upstream plans or existing repository explicitly define a closed vocabulary. Do
not resolve those IDs to real datasets, load trace files, execute replay,
compute checksums from artifacts, or write result files unless a later
execution-oriented task explicitly owns that behavior.

For manifest-only workload normalization tasks, keep the layer in-memory and
contract-shaped. Normalize fixture metadata into the existing workload and media
contracts; preserve dataset, scene, sequence, viewport-trace, network-trace,
device-profile, split, seed, workload-version, workload, and deterministic
replay-subset identities; and apply only simple media-object dependency closure.
Do not introduce filesystem resolution, asset lookup, real trace loading,
device-profile parsing, CAGS asset access, substrate capability contracts,
harness execution, artifact writers, or generated `output/` or `results/` files.
Do not add substrate/CAGS-adjacent modules, tests, exports, or documentation
claims during a manifest-only task. If a manifest-only task adds public symbols
or a new module, update the root docs in the same change unless docs are
explicitly excluded.

Treat substrate/CAGS capability contracts as a separate task from manifest-only
workload normalization. They may be a valid next static repository task when the
upstream coding plan asks for substrate adapters, but they must start from the
current clean repository state, use their own bounded source/test/docs scope, and
avoid CAGS integration, asset resolution, runtime hooks, harness execution, and
paper-result claims unless explicitly requested later.

For explicit static substrate-adapter contract tasks, build a substrate surface
matrix before editing and reconcile it after editing: enum symbols, record
classes, schema registry names, source `__all__`, package exports, docs, and
tests must list the same public surface. Include both layer and component enums,
not only dataclass-like records. If the substrate module has its own schema
registry and the domain package already exports another `SCHEMA_REGISTRY`, expose
the substrate registry with a distinct name or keep it module-local and document
that choice. Resource rates, throughput, timing, byte, count, frame, and cache
capacity fields should be finite and non-negative unless the upstream contract
explicitly permits signed values; tests named for negative validation must use
actual negative inputs, not only `nan`, `inf`, or malformed types.

Use placeholder implementations only when the downstream method logic is not yet
owned by this skill. Make placeholders explicit and honest:

- label method adapters, baselines, metrics, loaders, and harnesses as
  placeholders when their algorithmic behavior is not implemented
- state the interface contract and expected behavior
- do not imply that a candidate method, baseline, metric, or experiment result
  has already been implemented or validated

For method-interface feasibility tasks, decide the public owner before editing:
scan existing method modules, top-level exports, domain exports, tests, and root
docs, then keep the authoritative implementation in the exact package requested
by the task or already established by the accepted repository surface. If the
task asks for a new package such as a method package, put the implementation
there from the first revision. A legacy or domain-local module may remain only
as a compatibility shim that re-exports the owner; do not invert the shim and
the implementation. Public exports, docs, and tests should name the owner and
label any shim as a shim.

Method-interface tests should exercise the same public path that users will
import. If a shim exists, include export-identity checks across the owner,
top-level package, and shimmed package. Put feasibility checks in the owner, not
only in a hidden legacy module: candidate ids must align with controller object
ids, dependencies must be feasible under the provided candidate/state surface,
and budget/deadline infeasible selections must be rejected before a
schema-valid decision is returned.

Keep method configuration contracts and fixtures in lockstep. Required config
fields must either appear in every valid fixture or have explicit stable
defaults in the configuration record. Missing or malformed configuration should
raise the project method-configuration error, not raw constructor or type
errors. Mock methods may return deterministic schema-valid decisions, but they
should only probe interface shape, configuration validation, identity
alignment, dependency feasibility, budget feasibility, and deadline feasibility;
they are not greedy, knapsack, MPC, BOLA, oracle, learned, or baseline
algorithms. For deadline checks, state the inequality in code or tests before
implementing it, and include paired cases where a candidate is feasible and
where the same candidate is expired or deadline-infeasible, so helper argument
order cannot silently invert semantics.

For shared contract tasks, make the contract surface self-consistent before
reporting completion:

- build a compact contract matrix from the coding plan before editing: contract
  name, required fields, dataclass fields, schema keys, fixtures, public exports,
  and any intentionally omitted fields with the reason
- keep requested project-domain names as the primary surface; do not replace
  them with generic aliases, unrelated draft names, or dict-only contracts
- every claimed contract, schema, validation helper, and public export exists
  in source
- typed constructors, schema validation, dict helpers, package exports, and
  tests all describe the same field names and enum names
- tests and examples use the current contract field names, not older draft
  names
- validation hooks are attached to the contract type that owns them
- immutable or normalized records validate without illegal mutation
- required provenance is rejected when missing or empty if the task requires it
- public schema vocabulary matches runtime validation semantics. If a registry
  bucket says `required`, the validator rejects missing or empty values. If a
  field is finite and non-negative but not timing, give it a non-negative
  scalar bucket rather than a timing bucket. Do not leave stricter runtime
  checks hidden behind weaker schema labels.
- dependency checks cover unknown references and self-references when both are
  invalid for that contract
- focused invalid tests isolate the intended rule so an earlier validation
  failure, such as a count mismatch, does not mask the target condition
- focused invalid tests cover each validation class named by the task with a
  true invalid value: empty identifier, bad enum, `nan` or `inf` for finite
  fields, a negative value for non-negative fields, reversed timing order,
  missing or malformed provenance when provenance is required, and identity
  mismatch for workload-aligned records

Avoid generic infrastructure that the paper workflow does not need, such as
deployment systems, dashboards, database layers, or distributed orchestration,
unless the upstream plans or DeepResearch evidence make them necessary.

## Documentation Contract

Maintain three root documents:

- `README.md`: short entry document with repository purpose, quick entrypoints,
  and major directories.
- `FRAMEWORK.md`: English framework explanation for downstream coding agents and
  human developers.
- `FRAMEWORK.zh-CN.md`: Chinese framework explanation. Keep conventional module,
  method, metric, command, and code identifiers in English when exact spelling
  matters.

`FRAMEWORK.md` and `FRAMEWORK.zh-CN.md` should describe the actual repository,
not a generic template. Cover:

- how the framework inherits the paper blueprint, experiment plan, and coding
  plan
- why the selected ecosystem structure and source layout fit this project and
  reduce friction
- meaning of the fixed research directories
- core modules, ownership boundaries, interfaces, and data flow
- method and baseline extension points
- harness structure, paper goals served, metrics, raw artifacts, and the
  "modify module -> run harness -> inspect results -> refine module" loop
- testing structure, fixture style, pass/fail purpose, and separation from
  paper harnesses
- raw-first result export schema and downstream use by plotting, paper writing,
  and analysis
- placeholder locations and what later implementation should fill
- real or explicitly reserved entrypoints only

When the docs are the only requested change, base them on the current scaffold
and the upstream plans rather than on future implementation intent. Use
repository-relative paths only. If a module, command, harness, test, dependency,
result schema, or paper-output derivation is only a placeholder, say so plainly
and do not describe it as runnable, validated, or result-producing.
When docs describe authored tests or static validation files, state whether they
have actually been run. Do not let "validated" mean both "the repository
contains validation code" and "the validation was executed"; use explicit
wording for each.

Do not put skill workflow, runtime tool failures, sandbox details, or generation
process commentary into repository files. Mention neither "skill-required"
actions nor DeepResearch as a workflow step in repository docs; translate those
inputs into ordinary project rationale such as deferred stack selection,
license caution, or low-friction scaffold scope.

## Code Style

Write and revise code in the Academic Army direct style:

- Prefer short, straight-line logic and shallow call chains.
- Add helpers only when they express a stable boundary, remove real duplication,
  or name a meaningful invariant.
- Delete or avoid helpers that only wrap, rename, split, reassemble, or forward
  data.
- Keep local state local. Put shared state only where it is stable across
  module boundaries.
- Name content as content and references as references. Do not let path, handle,
  content, config, result, and status names blur together.
- Keep names aligned across code, config, docs, harnesses, tests, metrics, and
  result artifacts.
- Put related code near its use site unless it is truly shared.
- Order inputs, validation, construction, execution, and output in natural
  reading order.
- Align field order, parameter order, and documentation order for related
  objects.
- Use comments only for non-obvious constraints, placeholder contracts, or
  design decisions that cannot be made clear through naming and structure.

When revising existing code, follow the repository's good local patterns, but do
not preserve bad abstraction, stale naming, misplaced ownership, or unclear
data flow merely for consistency.

## Workflow

1. Confirm the target repository root and keep all project operations inside it.
2. Read only the required upstream planning artifacts and task-relevant existing
   repository files.
3. For repository creation, substantial redesign, stack choice, dependency
   choice, or external-code reuse, run DeepResearch for the selected or
   candidate stack, related repositories, dependencies, harness practices,
   testing practices, and result artifacts. For focused modifications, skip
   DeepResearch unless the task itself introduces one of those choices.
4. Form an internal repository decision when structure is being created or
   changed: selected stack, fixed research
   directories, ecosystem source structure, harness folders, test folders,
   configuration mechanism, interfaces, artifact schema, entrypoints, and static
   quality tooling.
5. Create missing fixed top-level directories and root documents when
   initializing or repairing framework structure.
6. Create or revise only the required ecosystem structure, dependency
   declaration, static-quality configuration, source interfaces, harness
   entries, tests, fixtures, and result artifact contracts.
   If the task names only fixed scaffold paths, create only those paths and
   root docs.
   When adding a new static contract beside existing definitions, first inspect
   any wildcard discovery in nearby loaders and tests; avoid filename or schema
   choices that make unrelated loaders ingest the new contract.
7. Preserve existing user work. Apply minimal changes for existing repositories,
   avoid unrelated cleanup, and run the deletion audit before claiming the task
   is complete. If review asks for removal of an out-of-scope surface, delete
   the source/test files, remove package exports and root-doc mentions, and
   re-check exact path absence before reporting success.
8. Update `README.md`, `FRAMEWORK.md`, and `FRAMEWORK.zh-CN.md` so their content
   matches the actual repository when the repository structure, public entry
   points, extension points, or artifact contract changes. Do not edit root
   docs for a private implementation test unless the user requests it.
   Adding a new source package, public contract module, exported schema surface,
   or top-level test file normally changes the public repository surface; update
   stale root docs in the same task unless the user explicitly excludes docs.
9. Perform static validation only.
10. Respond with a concise summary of created or modified repository abilities,
    extension points, static validation, and any code-level caveats.

## Revision Trajectory

Treat review feedback as either actionable or blocking:

- Actionable feedback names a code, documentation, contract, validation, or
  scope defect. Fix the smallest relevant surface and rerun only the permitted
  static validation.
- A blocking review reports that the reviewer could not inspect files or tools.
  Do not make speculative code changes. If the reviewer asks for file contents
  or a diff, provide that bounded readback package in the next developer report
  or ask for a review rerun with working read access.
- If the same environment-only blocker repeats, record that the implementation
  is unchanged and the review is externally blocked. Do not invent a new target
  repository task merely to make progress. Do not rerun the same static
  validation just to fill a revision turn unless the orchestrator explicitly
  requires a fresh validation report.
- When a reviewer states that no developer-side revision can be requested,
  leave repository files unchanged. Respond with the current implementation
  summary, the last valid static validation, and the blocker status.
- If a reviewer or developer report says the repository was reconstructed from
  an empty or partial view, treat that as a repository-integrity defect until a
  full baseline is restored from a trustworthy source and the scoped change is
  reapplied on top of it.
- If review feedback says the developer report and actual files disagree,
  re-read the modified source, tests, package exports, and root docs before
  patching. Treat report/file mismatch as an implementation defect, not a
  wording issue.
- If review feedback says newly reported files are absent, first re-establish
  the target root and run an exact-path filesystem check for those files. If the
  files are absent, create them in the verified target tree and re-check exact
  presence before touching docs or reporting. If the files disappear again after
  creation, stop and report a repository-integrity blocker instead of repeating
  an implementation claim.
- If review feedback says an out-of-scope surface still exists, perform one
  atomic cleanup pass: delete the source/test files, remove public exports, purge
  docs that list the deleted files as live surface, remove generated artifacts,
  then verify with exact path checks and a repository search for the removed
  symbol family. Do not split that cleanup across multiple reports unless the
  user explicitly narrows the revision.
- If a filesystem check contradicts the intended deletion, trust the filesystem.
  Reopen the target directory, resolve any duplicate path or working-directory
  confusion, and either delete the actual file or report a repository-integrity
  blocker. Do not claim success from memory, patch intent, or an earlier
  deletion attempt.
- If review feedback says a project-specific contract regressed to generic
  fields or names, restore the project-specific dataclass and schema surface
  first, then align tests and exports. Do not keep a generic replacement just
  because it has a validator or dict loader.

When selecting a next task after a bounded change, choose the smallest item that
is directly supported by the paper blueprint, experiment plan, coding plan, and
current repository state. Prefer missing contract coverage, missing harness
definition, or missing static entrypoint wiring over broad implementation or
experiment work. Do not mark an unrelated TODO complete unless the current task
explicitly verified it or the user asked for a status audit. Do not confirm TODO
completion from a reconstructed or unread repository state. If review accepts
the change, record the accepted outcome and promote only the next bounded static
contract that is directly supported by the current repository and upstream
plans.

If the accepted task was an explicit fixed scaffold, do not auto-promote a
source, schema, harness, test, dependency, or artifact task just because the
framework docs reserve those extension points. In TODO or trajectory files,
record the scaffold as complete and either pause for an explicit next request or
name a docs/static-inventory follow-up only when the accepted scaffold docs are
stale or incomplete.

For integrity-blocker TODO updates, separate accepted history from current
verifiability. A task may be accepted in prior reports but not currently present
in the target tree. Keep such items out of "completed in current repository"
status until the actual files are restored or explicitly rebuilt and reviewed in
the current target. Put missing accepted work in a blocked/not-currently-
verifiable section with the exact missing paths and the restore gate.

Before advancing to the next implementation item, check whether the accepted
change made `README.md`, `FRAMEWORK.md`, or `FRAMEWORK.zh-CN.md` stale. If so,
promote a docs-only sync as the next bounded task. That sync should describe the
accepted repository surface without adding code, tests, harness definitions,
entrypoints, artifact writers, execution claims, or paper-result claims.
This applies to static harness definition files even when they are not public
source code: if root docs still describe `harness/` as only reserved, record a
docs-only sync before any loader, CLI, metric, runtime, or next-harness task.
If the docs already match and the next useful work would require execution,
metrics, algorithms, real data, or artifact generation, pause instead of
inventing a repository task.

Use this static trajectory order when the repository is still a scaffold:

1. Root handoff docs that accurately describe the current scaffold.
2. Pause after a fixed scaffold when only directories and root docs were in
   scope and the docs accurately describe that state.
3. Docs-only sync when the accepted source, test, harness, or artifact contract
   surface is now visible to downstream developers but root handoff docs do not
   describe it.
4. Shared domain validation schemas and focused test files for contracts that
   already exist or are explicitly requested.
5. Manifest-only workload contracts that preserve dataset, trace, split, and
   seed identities without loading real data.
6. Explicit substrate-adapter static capability contracts, only as their own
   bounded task after workload cleanup is accepted; include tiny in-memory
   contract tests if requested, but do not integrate CAGS, resolve assets, run
   hooks, or execute harnesses.
7. Method-interface feasibility checks with mock methods or placeholders, not
   algorithm implementations.
8. Raw-first export schemas and provenance fields, without writing real
   experiment outputs.
9. Static harness definitions for the earliest paper objectives, without
   harness execution. After an accepted static harness definition task, sync
   root docs if they are stale; otherwise pause unless the user explicitly asks
   for the next bounded static contract.
10. Pause or hand off when the next useful work requires algorithms, real data,
    metrics, simulator execution, baseline implementation, or paper-result
    claims.

When updating TODO or trajectory files, make the next task executable as a
single bounded repository edit. Include explicit exclusions that prevent the
next developer from turning a static contract task into workload loading,
scheduling, metric computation, harness runs, or result generation. If a next
task asks for test files, say that the files may be authored but not run by this
skill. Do not set a code or test task as "next" from a docs-only scaffold unless
the user or orchestrator explicitly asks for continued implementation.
For accepted harness definitions, record the exact definition paths and accepted
scope, then choose a docs-only sync when root handoff docs omit those paths or
still present the harness directory as empty or only reserved. Do not promote a
definition-loader, schema-normalizer, bundle validator, CLI, metric, or result
export task merely because definition files now exist.
If a next task uses broad verbs such as normalize, load, run, export, or
validate, bind the verb to the intended static scope in the task wording. For
example, say "manifest-only normalization of in-memory metadata" and repeat that
real dataset, trace, artifact, or runtime resolution is excluded.

If a cleanup task removed an out-of-scope adjacent surface, do not describe the
next task as restoring or continuing that rejected work. If the upstream plans
support it as the next real step, phrase it as a fresh explicit bounded task,
for example "add static substrate-adapter capability contracts," and repeat the
non-runtime exclusions. The TODO should say that the previous surface was
removed because it was out of scope for the prior task, not because substrate
contracts are permanently forbidden.

Before updating TODO after review acceptance, re-scan the current target tree
for every defect class raised during review, especially generated cache/build
artifacts and stale files. Record only what is present now. Do not resurrect a
fixed defect from an earlier reviewer report, and do not skip a generated
artifact that still exists just because the source-code review was accepted.

If the next task is a validation-only bundle check, keep it as a static
contract-consistency surface: load or inspect existing definitions, verify
required identities and cross-references, and report missing static metadata.
Do not reinterpret "validation" as permission to run tests, execute harnesses,
load datasets, replay traces, compute metrics, aggregate results, or validate
paper claims.

Bundle validators should stay thin. Compose the existing contract loaders,
return deterministic checked paths, IDs, and status fields, and surface clear
component failures. Do not turn a bundle check into a new registry, execution
entrypoint, artifact resolver, or schema-normalization layer unless a later
task explicitly needs that behavior.

When the accepted change completes the planned static contract surface and the
next plausible work would require execution, data, metrics, algorithms,
baselines, harness runs, or paper-result claims, mark the next task as finished
or paused instead of inventing another repository task. Record that execution-
oriented work needs a new explicit user request or a different skill.
After an accepted docs-only sync, re-read the root docs and the current
repository inventory. If the docs now describe the accepted static surface and
the remaining upstream work is execution-oriented, set the next developer task
to `FINISHED` or an explicit pause marker rather than proposing another static
contract task.

## Static Validation

Do not run install commands, tests, harnesses, or experiments. Use static checks
appropriate to the selected stack and repository state.

For source and test authoring, static validation may include syntax,
importability, constructor, or schema-surface checks when they have no workload,
network, device, harness, output, or result side effects. Use the selected
ecosystem's no-cache/no-build-artifact mode where available. If a static check
creates generated cache or build files, remove them before completion and
verify the tree is clean of those artifacts.

For shared contract tasks, perform a readback audit after edits and before the
developer report. Compare the actual dataclass constructor fields, schema keys,
schema registry entries, enum names, `__all__` exports, package imports, test
fixtures, and documented public surface. Do not rely on the implementation plan
or a prior report as proof that a symbol or field exists.
When the schema registry is public, include a small drift check in tests or
static review for any non-obvious bucket: required provenance is listed as
required and rejected as missing or empty, finite-only fields are not marked
non-negative, non-negative finite fields are not hidden in timing buckets, and
timing buckets contain timing or duration fields only.

For new public modules, include exact-path presence in the readback audit:
the module file exists on disk, the test file exists on disk when authored,
package exports import from existing modules only, and root docs mention only
files that are present after any generated-artifact cleanup.

For authored tests, statically inspect collection shape before reporting. Check
that parametrized argument names match the test function signature, fixtures are
actually declared or imported, and helper names in the test file refer to
existing source symbols. Treat a parametrization/signature mismatch as a source
defect even when tests are not executed.

For method-interface surfaces, static validation must include ownership and
public-path checks: there is one authoritative implementation module, any other
method module is an explicit re-export shim, root docs name the owner rather
than the shim as the active surface, and authored tests import through the public
owner/top-level export path. Valid method-config fixtures satisfy the
configuration record's required fields or documented defaults, malformed config
fixtures reach the project method-configuration error, and feasibility tests hit
the exported implementation that users will call.

For documentation-only syncs, static validation is a readback and scope check:
the referenced repository-relative paths exist, the docs describe only the
current source/test/harness/artifact surface, and the diff contains only the
requested documentation files. Also check that the docs do not claim execution,
loader discovery, test execution, generated artifacts, or metric/paper-output
derivation when those surfaces are only reserved or metadata-only.

For cleanup revisions, static validation is an exact absence check plus a
surface-consistency check: deleted files are absent on disk, public exports do
not import them, root docs do not list them as current files, tests do not import
them, and generated caches from the cleanup are absent.

For static harness definitions, validate local derivability: each paper-output
mapping references only the definition's declared raw artifacts and required
metrics, the artifact and metric names match the upstream plan terminology and
existing export contracts where present, and no mapping silently depends on an
undeclared lifecycle, timing, decision, frame, or resource record. This is a
readback check only unless the task explicitly asks for a static consistency
test.

Validate:

- all created, modified, and referenced project paths are inside the repository
  root
- integrity reports distinguish present-on-disk, missing-on-disk, tracked,
  untracked, and absent paths; do not describe an untracked scaffold as empty
- `data/`, `output/`, `results/`, `harness/`, `test/`, `README.md`,
  `FRAMEWORK.md`, and `FRAMEWORK.zh-CN.md` exist
- the selected ecosystem structure follows DeepResearch-supported best
  practices without unnecessary config or hidden path assumptions
- dependency declarations, configuration entrypoints, source interfaces,
  harness entries, tests, fixtures, and result artifact contracts exist when
  required by the upstream plans
- documentation matches the actual repository structure
- documentation distinguishes authored-but-not-run tests, static validation
  surfaces, executed validation, runtime behavior, and paper-result claims
- placeholders are clearly labeled and do not pretend to be completed
  algorithms
- harness folders and test folders are semantic and separate
- validation schemas match the declared contract shape and preserve field
  meaning, value domains, required provenance, and reference integrity
- schema registry bucket names match the implemented validators, especially for
  required mappings, finite numbers, non-negative finite numbers, and timing
  fields
- public exports, schema registries, documentation mentions, and test imports
  reference only source symbols that actually exist
- every newly reported source or test file exists at the exact repository-
  relative path after cleanup, and its public symbols match package exports and
  documentation mentions
- public method-interface symbols have one implementation owner; compatibility
  modules re-export that owner only, and export-identity tests compare the
  owner, top-level package, and shimmed package when a shim is present
- valid method-configuration fixtures match required/default fields, malformed
  method configuration raises the method-configuration error, and feasibility
  tests exercise candidate identity, dependency, budget, deadline, and schema
  validity through the public method path
- removed or excluded surfaces have no remaining source file, test file, public
  export, documentation claim, generated cache artifact, or stale import
- authored tests use current contract field names and invalid cases exercise the
  implemented validation path, not stale draft schemas
- parametrized tests have decorator argument names that match function
  parameters, so test collection would not fail before reaching the contract
  checks
- invalid tests are shaped so the intended validator is reached before other
  record-level checks fail
- invalid tests include actual negative values for fields described as
  non-negative, not only `nan` or malformed-type cases
- validation hooks, constructors, normalization, and immutable-record behavior
  are attached to the owning contract type and can initialize without import or
  construction errors
- split, seed, dataset, trace, device, workload, method, metric, and artifact
  identity fields preserve declared identities without hard-coded allowlists
  unless an upstream plan or existing repository contract explicitly defines a
  closed vocabulary
- static definitions with different schemas are not accidentally matched by the
  same wildcard loader, glob, registry, or test expectation
- static harness definitions with paper-output mappings are internally
  derivable from their declared raw artifacts and required metrics
- artifact schemas use stable fields aligned with method, metric, dataset,
  split, seed, harness, and stage names
- reproducibility and workload-coverage manifests preserve split and seed
  identities as declared, and their loaders do not resolve dataset, trace,
  device, output, or result artifact references
- names are consistent across docs, code, config, harnesses, tests, and
  artifacts
- code avoids thin wrappers, repeated registration points, unnecessary
  conversions, over-split modules, path aliases, hidden environment assumptions,
  and long calling paths that make harnesses or tests harder to use
- focused changes use only permitted temporary locations and do not write to
  real `output/` or `results/` unless the task explicitly asks for repository
  artifact files there
- generated cache, bytecode, build, coverage, temporary, and test-output
  artifacts from the selected ecosystem are absent unless explicitly requested
  as repository files
- focused changes pass the deletion audit: no unrelated existing files,
  fixtures, docs, harnesses, tests, or static markers disappeared
- review or TODO updates do not claim paper results, executed tests, harness
  success, restored baselines, or repository abilities that were only inferred
  from filenames or prior reports

## Final Response

Keep the final response short. For repository creation or structural revision,
state:

- the repository-relative paths or capabilities created or modified
- the selected stack and why it fits this project, in one concise sentence
- key extension points for later implementation
- static validation performed
- any remaining project-level caveats

For focused modifications, state only the changed repository-relative paths,
the contract or behavior covered, static validation performed, and any caveats.

Do not paste full files unless the user explicitly requests it. Do not explain
skill internals, template mechanics, tool failures, or runtime workarounds.

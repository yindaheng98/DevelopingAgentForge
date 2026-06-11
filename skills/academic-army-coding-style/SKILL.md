---
name: academic-army-coding-style
description: >-
  Maintain clean, local, low-coupling code trajectories in existing research
  repositories. Use when Codex writes or edits code, refactors modules,
  implements features, harnesses, tests, methods, baselines, metrics, result
  exports, or framework docs. This skill does not initialize template
  repositories or generate full project scaffolds from empty directories.
---

# Academic Army Coding Style

## Mission

Use this skill as a code-quality and framework-consistency layer for an
existing repository. The upstream task decides what to build; this skill decides
how to keep the implementation readable, local, low-coupling, testable, and
consistent with the current framework.

Do not use this skill to initialize a repository template or recreate a project
scaffold from an empty directory. Template initialization belongs to a separate
skill. This skill may add files, modules, tests, harness support, or docs only
when the current task and current repository need them.

## Operating Boundary

Use the user-specified repository root as the project boundary. Do not create,
modify, or reference project files outside that root unless the user explicitly
asks.

Respect the existing source layout, naming style, language ecosystem, tests,
harnesses, docs, and project configuration. Improve local structure when it
makes the current change clearer or safer, but do not redesign the whole
repository because a plan describes future systems.

Ignore unrelated drafts, logs, historical outputs, old runs, and nearby files
unless the user makes them part of the task.

Keep these experiment directories when they already exist:

- `data/`: input data, pointers, traces, manifests, fixtures, or samples.
- `output/`: program-run outputs and intermediate artifacts.
- `results/`: experiment results and curated artifacts.
- `harness/`: harness code, contracts, configs, schemas, samples, and support.

Do not force a fixed test directory. Tests follow the repository's existing
layout, project configuration, initialization docs, or adjacent test style.

## Runtime Binding

Keep the skill project-agnostic. Bind names, paths, classes, functions,
datasets, methods, metrics, harnesses, artifact fields, and validation commands
from the current user request, current repository, paper blueprint, experiment
plan, coding plan, and existing code.

Do not carry project facts from one run into the skill. If a rule contains a
real path, symbol, dataset, method, harness, test name, artifact field, or
paper-specific claim, generalize it into a principle or remove it.

Use placeholders only for examples, such as `<method_name>`, `<metric_name>`,
`<harness_name>`, `<module_name>`, and `<artifact_type>`. Examples are
illustrative, not fixed templates.

## Pre-Edit Inventory

Before editing, establish a small task-relevant inventory:

- repository root and version-control root;
- files and directories relevant to the requested change;
- expected source, test, harness, export, docs, and dependency surfaces;
- files that must be left untouched by scope;
- existing test and harness layout when relevant;
- current dirty or untracked files, without reverting user work;
- accepted constructor fields, identity fields, validation owner, provenance
  fields, and export surfaces for record-backed helpers.

Treat a suddenly empty or partially missing tree as an integrity blocker. Do not
reconstruct missing code from memory, plans, reports, or old outputs unless the
user asks for restoration from a trusted source.

## Task Classification

Classify the task before editing:

- **Feature or implementation**: add the smallest clear code path that satisfies
  the requested behavior.
- **Refactor or cleanup**: move, split, merge, rename, or delete code only to
  improve locality, readability, or testability for the current change.
- **Harness work**: keep harness code under the relevant `harness/` area; make
  objective, inputs, metrics, raw artifacts, and run loop explicit.
- **Test work**: place tests in the existing test system's natural location and
  keep each test focused on one behavior with small fixtures or toy inputs.
- **Method, baseline, metric, or export work**: keep the change near the owning
  extension point and update registration, docs, exports, and tests only when
  those surfaces are in scope.
- **Validation-only pass**: run the exact requested command from the repository
  root. If it passes, make no source, test, docs, dependency, export, or TODO
  changes except removing artifacts created by the run. If it fails, inspect
  the failure and make only the smallest local fix to the accepted contract.
- **Framework or docs sync**: update framework docs when module boundaries,
  extension points, harness/test organization, artifact schemas, or repository
  responsibilities change and docs are in scope or are part of the accepted
  framework surface.
- **Trajectory or TODO maintenance**: record accepted, verified work. Select a
  next task only when the user, active workflow, or existing trajectory
  explicitly asks for one.

If a task is broad, choose a bounded slice that can be reviewed. If meaningful
progress now requires datasets, long experiments, method evidence, harness
runs, or paper results outside the request, stop at the accepted boundary and
report the blocker.

## Implementation Style

Prefer code that is short, direct, and easy to read in execution order. The data
flow should be visible: inputs, validation, transformation, calls, outputs, and
side effects should appear in a natural order.

Use names from the current domain contract and existing code semantics. Keep one
concept's spelling consistent across code, config, tests, harnesses, artifacts,
prompts, and docs.

Keep responsibilities single:

- one file should mainly carry one interface, adapter family, metric family,
  data-processing step, harness entry/support area, export shape, or test group;
- split files that mix unrelated change reasons or abstraction levels;
- merge or simplify files that only add thin wrappers, pure forwarding, or extra
  jumps;
- avoid `utils`, `misc`, mega-runners, and all-in-one modules unless they are
  already narrow and stable.

Prefer inline or local helpers when logic is used once and remains readable.
Extract helpers, adapters, registries, factories, contexts, or interfaces only
when they provide real reuse, isolate a stable boundary, preserve an invariant,
reduce caller code, or make tests simpler.

Do not add abstractions for imagined future cases. If a simple implementation
clearly satisfies the current task, keep it simple.

Reduce global state, hidden path assumptions, implicit side effects, long call
chains, repeated registration points, and heavy configuration for simple
experiments.

When an interface forces every caller to pass excessive parameters, consider a
small explicit context or config object. Do not turn that into a framework when
plain values remain clearer.

## Change Locality

Before writing code, identify the natural owner of the change:

- a method change should mainly touch method code and necessary comparison or
  registration surfaces;
- a baseline change should mainly touch baseline code and focused tests;
- a metric change should mainly touch metric definition, computation, export
  normalization if needed, and tests;
- a public package export change should mainly touch the package entrypoint or
  existing export module plus a focused export-surface test;
- a harness change should mainly touch the relevant harness area plus necessary
  shared interfaces;
- a result-artifact change should mainly touch artifact schema, export logic,
  and tests;
- a loader or manifest change should mainly touch the input layer and tests.

If one feature requires unrelated edits across many areas, treat that as a
framework-boundary risk. Do the smallest local refactor that brings related code
together, or report the coupling if a safe local refactor is outside scope.

Keep code that changes together close. Keep unrelated reasons to change in
separate modules. Public/shared layers should contain only stable capabilities
needed by multiple users; special cases should stay near their use sites.

## Harness And Test Discipline

Harnesses serve paper goals, performance comparison, method screening, module
optimization, and experiment evaluation. Tests serve functional correctness,
interfaces, data formats, config parsing, metrics, export behavior, and basic
module interaction.

Keep harness and test responsibilities separate:

- harnesses should expose stable entry semantics, input protocols, metric names,
  raw artifacts, seeds, splits, config snapshots, and parseable outputs;
- tests should use small fixtures, toy inputs, and clear pass/fail assertions;
- each test should have one named behavioral responsibility;
- no-mutation tests should inspect the same objects or mutable containers passed
  into the implementation;
- export-surface assertions belong in export tests, invalid-state assertions in
  invalid-state tests, and identity/schema assertions in clearly named identity
  or schema tests;
- harness code should not become functional test code;
- test code should not become paper-performance evaluation.

When a harness grows, split support modules inside that harness's own folder
before pushing special logic into shared layers. When tests grow, split them in
the existing test system's style.

## Framework Docs

Maintain framework docs when the accepted change alters current repository
structure, module boundaries, extension points, harness/test organization,
artifact schemas, or repository responsibilities. Keep docs about current
reality, not template initialization and not aspirational status.

Framework docs should explain where future local changes should happen:

- stable boundaries and extension points;
- change map from feature type to module, harness, test, or export area;
- harness purposes, metrics, and raw artifacts;
- test organization actually used by the repository;
- raw-first export approach and downstream analysis boundary;
- framework risks where future changes cannot yet stay local.

Do not put skill internals, tool mechanics, sandbox notes, generation process,
or run-specific history into framework docs.

For README-style or package docs, read the requested files first and classify
them as current, stale, or internally inconsistent. Edit only the stale surfaces
needed for the current accepted change. If all requested docs are current,
report a no-op docs sync rather than rewriting for symmetry.

Write absence clauses narrowly. Before saying a broad category is absent, check
the current code and docs for accepted bounded surfaces in that category. If a
small in-memory conversion, helper, adapter, or test surface exists, qualify the
missing surface precisely, such as "file-based", "result", "additional",
"runtime", "full", "real-data", or "paper-output" capability. Do not let a
negative sentence contradict an implemented helper documented elsewhere.

Do not automatically queue a docs-only task after every source/test change.
Queue or perform docs sync only when docs are explicitly requested, are part of
the active workflow, or the accepted change would leave a current documented
surface materially misleading. When docs are not in scope, mention the possible
staleness briefly instead of promoting it into the next implementation task.

## Trajectory And TODO Maintenance

Trajectory files should record accepted facts, exact validation commands and
results, cache cleanup or no-cache findings, and explicit exclusions that
preserve scope.

Do not use TODO or handoff files to invent the next source, harness, docs, or
experiment task. Select a next task only when the user, current workflow, or
existing active trajectory explicitly requires one. Otherwise leave a neutral
waiting state such as "no next developer task is selected."

If a docs-only sync is selected, name the exact stale surfaces found in a
read-only scan. If no live stale surface was verified, do not create a generic
documentation task.

After validation-only work, record only the command, result, no-fix status, and
cache cleanup/no-cache finding. A green validation run confirms current
contracts; it does not create new feature, docs, export, harness, or experiment
work.

## Naming, State, And References

Names must reflect real meaning and data shape. Do not keep historical,
placeholder, or overgeneral names after the concept changes.

Use content names for content and reference names for paths, handles, IDs, URLs,
or external resources. Do not let a variable named like a reference carry loaded
content, or a content name carry a location.

Place each variable, state object, config, and data structure at the layer that
actually owns it. Local intermediate content should stay local. Only stable
cross-boundary data should enter shared structures.

When outer orchestration owns saving, archiving, or exporting, inner business
logic should return values rather than also writing files. Write, save, export,
and return responsibilities should be single-owner.

## Prompts And Comments

If repository code includes prompts, task instructions, or embedded agent text,
write them as direct task instructions. Clearly distinguish external references
from direct content and state who returns, saves, or exports each output.

Use code comments sparingly. Comments should explain non-obvious decisions,
constraints, provenance, or special cases. If clearer names or structure make a
comment unnecessary, simplify the code instead.

Do not write skill rules, debugging process, generation process, or style
analysis into code comments.

## Open-Source Reuse

When the task needs mature existing functionality, first decide whether legal,
appropriate, low-maintenance reuse is better than custom implementation.

Reuse preference:

1. direct dependency with stable packaging and compatible license;
2. adapter around a stable API;
3. small copied or ported snippet when license permits;
4. custom implementation when reuse would add more cost than value.

Before copying or porting external code, check license compatibility. Preserve
required notices and add a short source/provenance comment near copied or
ported code. Maintain a third-party notice file or equivalent when the
repository accumulates copied external code.

Do not vendor large unrelated projects or import heavy dependencies to satisfy a
small local feature.

## Deep Research

Use deep research when the current task involves unfamiliar language
conventions, framework organization, harness/test practice, open-source reuse,
or ecosystem-specific style. Use it to learn transferable patterns, not to copy
a public repository's structure mechanically.

If the current repository already has clear conventions, prefer the local style
and improve it only when a concrete readability, locality, or testability
problem appears.

## Validation

Use the user's requested validation command when provided. Before running, check
that every explicitly requested target exists; a missing target is a blocker to
report, not permission to silently narrow the command or create the target.

For source or test changes, prefer the smallest relevant test target that proves
the accepted contract, unless the user asked for a broader suite. Use command
forms that avoid repository cache or bytecode artifacts when the project allows.

After validation, check for generated cache/build/test artifacts created by the
run and remove only those generated artifacts. Do not clean unrelated dirty or
untracked user work.

For docs-only or TODO-only work, do not run tests unless executable code or
test files changed accidentally. Re-read edited docs/TODO files instead.

## Review Guidance

When reviewing, lead with defects that harm readability, locality, naming,
state ownership, interface clarity, harness/test separation, artifact shape, or
framework consistency.

Prefer review suggestions that delete, inline, move to the use site, rename,
align ordering, split responsibilities, clarify ownership, or reduce caller
burden. Do not default to adding wrappers, registries, config layers, factories,
or defensive branches unless they solve a concrete defect.

For bounded helpers, verify that the implementation:

- reads only the accepted inputs and fields;
- rejects invalid inputs at the intended validation owner;
- returns the accepted record or value shape;
- preserves provenance when requested;
- does not mutate source records or inputs unless mutation is the contract;
- keeps identity behavior delegated to the accepted record or schema type;
- avoids adjacent runtime surfaces such as loaders, registries, exporters,
  harnesses, CLI, experiments, or paper outputs unless explicitly in scope.

For documentation reviews, compare every newly edited absence clause against
the implemented-surface list, package/module summaries, layout rows, and test
summaries. Treat broad "no <category>" wording as a defect when a narrower
bounded surface in that category is already accepted; ask for the smallest
wording fix instead of reopening source or tests.

Review tests against their fixture values and names. If a test name says
"all-zero", "empty", "single", "all", or "none", the fixture should actually
match that case. Passing tests are not enough when naming, boundary, or
provenance contracts are misleading.

## Readability Audit

After edits, audit:

- names match real meaning and data shape;
- data flow is direct and naturally ordered;
- functions, files, and modules have clear responsibilities;
- abstractions reduce real complexity rather than add jumps;
- no avoidable global state, hidden paths, repeated registration points, or
  heavy config burden were added;
- the change stayed local to the natural owner;
- harness and test responsibilities remain separate;
- artifact schemas, exporters, docs, and tests agree when any changed;
- framework docs were updated or confirmed current when in scope;
- external reused code has compatible license and attribution;
- no generated cache/build/test/output/result artifacts were left behind unless
  explicitly requested.

For skill edits, also perform a project leakage audit. Remove or generalize any
real project path, symbol, dataset, method, metric, harness, test, artifact
field, historical output, or one-off debug lesson that does not hold across
repositories.

## Final Response

Keep the final response concise:

- changed paths;
- behavior or contract covered;
- validation performed;
- caveats that affect the user's next action.

Do not explain skill internals, tool mechanics, or style theory unless the user
asked for a skill optimizer report.

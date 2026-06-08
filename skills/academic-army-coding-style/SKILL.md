---
name: academic-army-coding-style
description: >-
  Maintain clean, local, low-coupling code trajectories in existing Academic
  Army research repositories. Use when Codex writes or edits code, refactors
  modules, implements features, harnesses, tests, methods, baselines, metrics,
  result exports, or framework docs. This skill does not initialize template
  repositories or generate full project scaffolds from empty directories.
---

# Academic Army Coding Style

## Mission

Produce clear, direct, maintainable code inside an existing repository. The
upstream user task decides what to implement; this skill decides how to keep the
implementation readable, local, low-coupling, and consistent with the current
framework.

Do not use this skill to create a repository template from scratch. Template
initialization belongs to the dedicated initialization skill. This skill may add
files, modules, subfolders, tests, harness support, or documentation only when
the current task or current repository framework needs them.

## Operating Boundary

Use the user-specified repository root as the boundary for project work. Do not
create, modify, or reference project files outside that root unless the user
explicitly asks.

Respect the current repository structure, language ecosystem, naming style,
test layout, and framework documents. Improve them locally when they make the
current feature hard to read, test, or change, but do not redesign the whole
repository just because upstream plans describe future systems.

Ignore unrelated drafts, logs, old outputs, historical runs, and nearby files
unless the user makes them part of the task.

Keep the fixed experiment directories when they already exist:

- `data/`: input datasets, pointers, traces, manifests, fixtures, or sample data
- `output/`: program-run outputs and intermediate artifacts
- `results/`: experiment result records and curated artifacts
- `harness/`: harness code, harness contracts, configs, schemas, samples, and
  support files

Do not force a fixed test directory. Tests follow the repository's existing
layout, project configuration, initialization docs, or adjacent test style.

## Task Classification

Before editing, classify the task:

- **Feature or code implementation**: implement the smallest clear code path
  that satisfies the requested behavior.
- **Refactor or structure cleanup**: move, split, merge, rename, or delete code
  only to improve the current change's locality, readability, or testability.
- **Harness work**: keep harness code under the relevant `harness/` subfolder;
  make the harness objective, inputs, metrics, raw artifacts, and run loop
  explicit.
- **Test work**: place tests in the existing test system's natural location;
  keep each test focused on one behavior with small fixtures or toy inputs.
- **Method, baseline, metric, or export work**: keep the change close to that
  extension point and update registration, docs, exports, and tests only when
  those surfaces are explicitly in scope.
- **Validation-only pass**: run the exact requested focused validation before
  editing. If it passes, make no source, test, docs, dependency, export, or TODO
  changes except removing generated cache artifacts. If it fails, inspect the
  failure first and make only the smallest local fix to the accepted contract
  named by the failing test or source path.
  Before running, verify that every explicitly requested test target exists; a
  missing target is a validation blocker to report, not permission to create a
  new test, drop that target from the command, or run a narrower substitute.
  Existing dirty or untracked files that are part of the accepted in-progress
  surface are not a reason to reset or clean the repository; validate the
  current tree as given and remove only cache artifacts created by the run. If
  no cache or bytecode artifacts are present after the run, report that finding
  instead of treating cleanup as a required edit.
- **Framework/documentation sync**: update `FRAMEWORK.md` and
  `FRAMEWORK.zh-CN.md` when module boundaries, extension points, harness/test
  organization, artifact schemas, or repository responsibilities change.
- **Repository integrity repair**: restore, revert, or clean only the explicitly
  requested tracked files or artifacts from the trusted source named by the
  user. Do not use planning documents, old reports, or memory to recreate
  missing files, and do not advance the repository with new implementation,
  tests, harnesses, dependencies, generated artifacts, or TODO direction unless
  the user separately requests that work.
- **Docs-only scaffold or handoff repair**: describe the current repository
  exactly. Do not backfill missing code, tests, loaders, schemas, dependencies,
  entrypoints, results, TODO status, or execution claims.
- **Trajectory or TODO maintenance**: record only accepted, verified work and a
  next task only when a next task was requested or already exists as part of
  the active workflow. Do not invent implementation work from broad plans after
  a restore, cleanup, or docs-only repair.

If the task is broad, choose a local implementation slice that can be reviewed.
If the next useful work would require real data, algorithmic evidence, harness
runs, metrics, experiments, baselines, or generated results beyond the user's
request, pause or mark the trajectory finished instead of inventing another
static task.

## Pre-Edit Inventory

For existing repositories, establish a small task-relevant inventory:

- target repository root and version-control root
- files and directories relevant to the task
- files expected to be created, modified, deleted, and left untouched
- current test layout and harness layout when either is relevant
- whether task-relevant files are present, untracked, tracked, or absent
- for record-backed helpers, the accepted constructor fields, constructor
  defaults, validation owner, existing `record_id` prefix and identity payload,
  and whether package-level exports are in scope

Treat a suddenly empty or partially missing tree as an integrity blocker. Do not
reconstruct missing code from memory, reports, or plans unless the user requests
restoration from a trusted source.

For integrity-repair tasks, inventory the exact status entries before editing,
restore only those requested paths from the trusted source, and verify that the
same status entries are gone afterward. A successful restore is complete when
the requested version-control state is reached; it is not a signal to begin the
next implementation slice.

## Implementation Style

Prefer code that is short, direct, and easy to read in execution order. The data
flow should be visible: where inputs come from, how they are transformed, where
they go, and what is returned or written.

Use names from the paper blueprint, experiment plan, coding plan, user request,
and current code semantics. Keep one concept's spelling consistent across code,
config, harnesses, tests, artifacts, prompts, and docs.

Keep responsibilities single:

- one file should mainly carry one interface, adapter family, metric family,
  harness entry/support area, data-processing step, export shape, or test group
- split files that mix unrelated change reasons or abstraction levels
- merge or simplify files that only add thin wrappers, pure forwarding, or
  extra jumping
- avoid `utils`, `misc`, mega-runners, and all-in-one modules unless they are
  already narrow and stable

Prefer inline or local helpers when logic is used once and remains readable.
Extract helpers, adapters, registries, factories, contexts, or interfaces only
when they provide real reuse, isolate a stable boundary, preserve an invariant,
reduce caller code, or make tests simpler.

Do not add abstractions for imagined future cases. If a simple implementation
clearly satisfies the current task, keep it simple.

Reduce global state, hidden path assumptions, implicit side effects, long
calling chains, repeated registration points, and heavy configuration for simple
experiments.

When an interface forces every caller to pass excessive parameters, consider a
small explicit context or config object. Do not turn that into a framework when
plain values remain clearer.

## Change Locality

Before writing code, identify the natural owner of the change:

- a method change should mainly touch method code and necessary comparison or
  registration surfaces
- a baseline change should mainly touch baseline code and focused tests;
  comparison, registration, docs, package exports, and harness surfaces change
  only when explicitly requested
- a metric change should mainly touch metric definition, computation, export,
  and tests
- a public package export change should mainly touch the package entrypoint or
  existing export module plus a focused export-surface test; keep `__all__`
  exactly aligned with the intended public names and do not export helpers or
  adjacent internal types unless the task asks for them
- a harness change should mainly touch the relevant `harness/<name>/` area plus
  necessary shared interfaces
- a result-artifact change should mainly touch artifact schema/export logic and
  tests
- a loader or manifest change should mainly touch that input layer and tests

If one feature requires unrelated edits across many areas, treat that as a
framework-boundary risk. Do the smallest local refactor that brings related
code together, or report the coupling if a safe local refactor is outside the
current task.

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
  raw artifact records, seeds, splits, config snapshots, and parseable outputs
- tests should use small fixtures, toy inputs, and clear pass/fail expectations
- each test function should keep one named behavioral responsibility; when a
  task adds a focused check, do not move or append unrelated assertions into
  that test just because they use the same fixture or module
- no-mutation tests should pass the mutable sequence, mapping, or object that
  they later inspect into the implementation; do not pass a tuple, copy, or
  derived proxy and then assert that the untouched original stayed unchanged
- when the no-mutation contract is about source record objects rather than
  container ordering, it is enough to inspect those exact objects before and
  after the call; do not force a mutable container unless the container itself
  is part of the mutation contract
- preserve existing test responsibility boundaries when editing a test file:
  export-surface assertions belong in export tests, invalid-state assertions
  belong in invalid-state tests, and identity or schema assertions belong in
  their own clearly named tests
- harness code should not become functional test code
- test code should not become paper-performance evaluation
- plotting and paper table generation should consume raw or metric artifacts
  outside the core harness logic

When a harness grows, split support modules inside that harness's own folder
before pushing special logic into a shared layer. When tests grow, split them in
the existing test system's style.

## Framework Documents

Maintain `FRAMEWORK.md` and `FRAMEWORK.zh-CN.md` when the task changes the
repository's framework surface. The English document uses English; the Chinese
document uses Chinese and may keep code identifiers, method names, metric names,
harness names, and config keys in English.

Framework docs should describe current reality, not template initialization and
not aspirational implementation status. Include only capabilities that exist on
disk and distinguish:

- implemented source code
- reserved or documented extension points
- authored but unrun tests
- runnable harnesses versus README-only harness specs
- raw artifact schemas versus generated result artifacts
- installed or declared dependencies versus planned dependencies

Useful framework docs explain where future local changes should happen:

- stable boundaries and extension points
- change map from feature type to module/harness/test/export area
- harness purposes, metrics, and raw artifacts
- test organization actually used by the repository
- raw-first export approach and downstream analysis boundary
- framework risks where future changes cannot yet stay local

Do not put skill internals, tool mechanics, sandbox notes, or generation process
inside framework docs.

For README-style documentation syncs, update the requested overview, package,
and test documents as a consistent current-state map. Name implemented modules,
public entrypoints, helper contracts, and focused test files exactly as they
exist, and keep capability lists aligned across root, package, and test READMEs.
Before editing, read each requested README-style file and classify it as current,
stale, or internally inconsistent. Edit only the files that are stale or
inconsistent. If a requested doc already describes the accepted state, leave it
unchanged and say it was verified current; do not rewrite it for cosmetic
parallelism. If all requested docs are current, report a no-op docs sync rather
than creating formatting churn.
If the task text says the docs are stale but the live files already contain the
accepted helper names, metric names, test coverage, and narrowed absence clauses,
trust the current files over the stale premise. Report the exact surfaces that
were verified current and make no edit.
When a newly accepted helper and its focused test exist on disk but are missing
from current-surface lists, package-helper lists, layout tables, or test
summaries, treat that as a real stale-doc reason. Update each requested doc only
at the surfaces needed to make the current-state map complete and parallel with
accepted sibling helpers.
When an accepted surface changes from one implementation to multiple sibling
implementations, update singular wording in prose, package summaries, layout
tables, and test summaries together. A row that still says "the scheduler" or
"the helper" after documenting two accepted siblings is stale even when the
module filename is already listed correctly.
Also scan negative or absence statements in the requested docs, such as "no
metric tests are present" or "no helper exists"; update those when the accepted
files now exist, while preserving narrower exclusions such as no metric formulas,
aggregation logic, result exporters, harnesses, or experiments.
If an absence statement names a broad capability category that now has one
accepted bounded exception, rewrite the category instead of leaving a
contradiction. For example, after accepting a minimum baseline scheduler, do not
keep "no scheduling methods exist"; say no proposed RefABR algorithms, robust
MPC/BOLA/learned policies, full scheduling infrastructure, harnesses,
experiments, or paper outputs exist beyond that accepted baseline.
When a helper name overlaps with planned runtime work, such as metrics or method
manifests, keep or add explicit absence clauses for the adjacent runtime
capabilities so readers do not infer formulas, selection logic, runners, exports,
experiments, or paper outputs.
When documenting a bounded helper, state what it accepts, what it returns, and
which owner performs deeper validation, but do not convert that description into
claims about loaders, registries, fixtures, harnesses, metrics, runnable
experiments, dependencies, generated outputs, or paper results.
For metric-record helpers, describe only mapping-to-`MetricRecord`
normalization and focused validation. Do not let the word metric imply metric
formula implementation, computation, aggregation, result export, harness
execution, or paper-result generation.
For bounded metric-computation helper docs, describe only the accepted formula
that exists, its raw input record type, returned `MetricRecord` fields, and
focused validation. Narrow stale "no metrics" or "no metric computation"
clauses to exclude additional metric formulas, QoE weighting, aggregation
frameworks, result exporters, harnesses, experiments, and paper outputs without
contradicting the accepted in-memory computation helper. If the helper returns
provenance such as source record IDs, describe it as provenance from existing
source records, not as generated artifacts or result export. Do not call one
accepted formula the Metric Computation Layer, metric registry, experiment
metric suite, or paper-result metric implementation.
When multiple bounded metric-computation helpers are accepted in the same
module, name each formula helper in implemented-surface lists, package
summaries, layout rows, and test summaries. Keep absence clauses limited to
metric formulas and runtime surfaces beyond those accepted helpers.
For repeated metric-helper documentation syncs, use the newly accepted helper
as a checklist key across every requested README-style file: helper function
name, emitted `metric_name`, package/module summary, layout row, test summary,
and local absence clause. Do not stop after updating the first helper list; a
stale test row or absence sentence is still a docs-sync defect.
Also update the category label when the accepted helpers broaden the module's
meaning. If a non-rate helper such as mean latency joins rate helpers, replace
stale wording like "rate metric computation", "rate computation path", or
"deadline-rate helpers" with neutral "metric computation" wording or an exact
helper list; adding the new helper name while leaving a rate-only descriptor is
an incomplete docs sync.
When documenting focused coverage for numeric mean helpers, mirror the actual
test cases and metric semantics. Use zero-latency, zero-FPS, zero-quality,
all-zero, mixed, and single-frame wording only when those exact numeric cases
are covered; do not turn numeric zero cases into "none" wording, which belongs
to boolean/count rate cases only when tests assert no flagged frames.
In bilingual docs, check both the implemented-helper sentence and the local
absence sentence for stale singular exceptions. Phrases like "except the
accepted deadline-hit-rate helper" become misleading after a sibling helper is
accepted; rewrite them to name the current accepted helpers or to say only
additional formulas and runtime metric infrastructure remain absent. When a
third or later sibling helper is accepted, also replace stale "both helpers",
"two helpers", or "deadline-rate helpers" wording with an exact list or a
neutral plural description that includes the new helper.
For frozen-method-manifest helpers, describe only mapping-to-`FrozenMethodManifest`
normalization and focused validation. Do not let method, freeze, or manifest
wording imply method adapters, candidate selection, method-freeze selection
logic, harness runners, CLI entrypoints, package exports, experiments, or paper
outputs.
For bounded lifecycle projection helper docs, describe only
`simulate_reference_lifecycle_state(...)` as selected-reference `MediaObject`
plus explicit timing inputs projected into `ReferenceLifecycleState`, with
focused validation for that projection path. Do not call this helper a
normalizer, do not describe stable-ID coverage as a normalization path, and in
Chinese docs prefer `投影路径` over `归一化路径` for this helper. Do not let
lifecycle wording imply full simulators, transport models, event processors,
component profilers, dataset or trace loaders, metrics, harness runners,
experiments, or paper outputs.
For bounded raw-record mapping helper docs, describe only
`record_to_mapping(...)` as accepted-record-to-JSON-compatible-mapping
conversion in memory. State that it preserves accepted field names and each
source record's existing `record_id`; do not claim stable-ID mutation or
identity-bearing-field coverage unless the focused tests actually mutate those
fields. If a doc has broad absence wording such as "exports are not
implemented", narrow it after accepting this helper to file-based/result
exporters, JSONL/CSV writers, artifact schemas or directories, harnesses,
experiments, and paper outputs. Do not imply package-level exports unless the
package entrypoint exports the helper.
For bounded method scheduling interface docs, describe only the `MethodScheduler`
and `run_scheduler(...)` call boundary over existing records plus its focused
tests. Do not let scheduler, method, or interface wording imply concrete
scheduling methods, baseline policies, ABR algorithms, candidate selection,
utility models, adapters, harness runners, CLI entrypoints, package exports,
experiments, or paper outputs.
For bounded baseline scheduler docs, describe only the accepted simple baseline
surface that exists on disk, its input records, configuration keys, returned
record type, and focused tests. Do not let baseline wording imply proposed
RefABR methods, BOLA/MPC/learned policies, candidate generation, utility-model
research, harness runners, metric computation, result export, experiments, or
paper outputs unless those files and validations actually exist.
For cumulative helper docs, update prose lists, layout tables, package summaries,
and test summaries together with parallel wording for all accepted sibling
helpers. Do not imply that helper modules are package-level exports unless the
package entrypoint actually exports them.
For cumulative baseline docs, name each accepted simple baseline in every
current-surface description that characterizes the baseline module or its tests;
do not leave old singular descriptions in layout rows or package/test summaries.
If the user names an exact docs-only file set or excludes TODO/status files, do
not update TODO, handoff, source, test, dependency, export, or generated-artifact
surfaces as part of the documentation sync. Leave TODO or trajectory recording
to the separate TODO-maintenance step.

## Content, State, And References

Keep content and references distinct in names and data flow. A variable named
like a path, ID, URL, handle, or reference should not contain already-read
content; a variable named like content should not contain an external location.

Only stable cross-boundary information belongs in shared models. Temporary,
single-run, display-only, orchestration-only, or unstable intermediate values
should stay local.

Assign one owner for writing, saving, exporting, or returning an artifact. Avoid
multiple layers claiming responsibility for the same output.

For shared record, schema, or metadata surfaces, treat identity as an explicit
contract. Prefer caller-provided stable IDs and required identity fields over
derived hashes, generated suffixes, timestamps, random values, or implicit
serialization choices. Add derived `record_id`, cache keys, or fingerprint
helpers only when the user or existing framework asks for derived identity.
When derived identity is required, document the identity-bearing fields in code
structure rather than prose alone, include every required field that changes the
record's semantic identity, and keep non-identity payload separate from the key.
Tests for identity-owner changes must mutate each identity-bearing field that
matters and prove the identifier changes. Add non-identity no-change checks only
when the task changes identity code, the user requests that distinction, or
existing tests already define it; otherwise cover non-identity payload through
pass-through or validation tests.
Before writing identity tests around an existing record, inspect the accepted
`record_id` construction or equivalent key contract and treat that as the source
of truth. A helper, loader, adapter, or normalizer task must not add fields to an
accepted record identity merely because a new helper test mutated those fields;
if a validation-only field is not part of the accepted key, cover it through
presence, pass-through, or delegated invalid-state tests instead. Do not infer a
record-id prefix or identity-bearing fields from the class name, helper name, or
domain wording; use the current implementation as the accepted contract unless
the user explicitly asks to revise that contract.

For bounded in-memory normalization helpers, preserve the accepted field names
and keep the helper as a thin adapter into the owning record or schema type.
Validate presence and shape only as far as the helper owns them, then delegate
domain validation, defaults, and stable identity to the record or schema that
already owns those contracts. Do not turn a mapping normalizer into file I/O, a
dataset registry, fixture discovery, trace loading, or a broader ingestion
layer unless the task explicitly asks for that expansion.

When adding a sibling normalizer, mirror the established local helper shape
before inventing a new pattern: required-field constant, optional-field
handling, mapping-type rejection, missing-key rejection, payload construction,
and constructor delegation. Focus tests on the helper's owned contract: valid
normalization, non-mapping rejection when required, missing required fields,
optional field pass-through, delegated invalid values, and stable identity
through the normalization path. When the user names accepted identity-bearing
fields, use that list and the current record implementation as the test
boundary; do not expand stable-ID coverage to optional non-identity fields just
because they are accepted payload. Do not use a normalizer test to redefine
which fields belong to the underlying record's identity; mutate fields already
owned by that record's accepted identity contract. If a normalizer exposes both
identity-bearing fields and validation-only fields, keep those assertions in
separate clearly named tests so reviewer feedback can distinguish adapter
behavior from record-contract changes. Keep mutated identity payloads valid so a
stable-ID test reaches the identity path rather than a domain validator.

For optional fields in normalizers, either pass them only when the input
contains them or mirror the owning record's constructor defaults exactly. Do not
invent aliases, alternate defaults, package-level exports, documentation
updates, or broader API surfaces as part of a normalizer source/test task unless
the user explicitly asks. If a normalizer test reveals that the accepted record
identity or validation contract may be wrong, report that as a separate
contract question; do not change the record class, schema, or existing record
tests inside the bounded normalizer task.

For frozen-method-manifest normalizers, keep the implementation to record
construction and focused validation only. The presence of `FrozenMethodManifest`
does not authorize method adapters, candidate selection, method-freeze selection
logic, harness runners, CLI entrypoints, package-level exports, file I/O, or
experiment artifacts.

For bounded in-memory metric computation helpers, implement only the named
formula over accepted raw record objects. Validate only helper-owned inputs such
as non-empty source sequences and aggregation-key presence, compute the direct
numerator, denominator, ratio, and provenance required by the task, and then
delegate metric-field validation and stable `record_id` generation to
`MetricRecord`. Do not add metric registries, QoE weighting, aggregation
frameworks, confidence statistics, file I/O, JSONL/CSV writers, result
exporters, artifact directories, package-level exports, docs, dependencies,
loaders, harness runners, CLI, experiments, or paper-output behavior unless the
task explicitly asks. Tests should cover all relevant boundary count cases,
empty input, invalid aggregation keys, source `record_id` provenance, no source
mutation, and `record_id` behavior according to the accepted `MetricRecord`
identity fields rather than inferred provenance fields.
For numeric metric helpers, boundary-value coverage must be literal. A test
named zero-latency, zero-FPS, all-zero, all-hit, all-miss, all-dropped,
none-dropped, or single-frame must use fixture values and assertions that
actually exercise that boundary; a mixed-valued case with a boundary word in its
name is not boundary coverage.
When adding a sibling formula to an existing bounded metric-computation module,
share a small private counting/build helper only if it makes both public
functions shorter and keeps the formula-specific fields obvious at each
entrypoint. Do not turn that helper into a registry, dispatcher, framework, or
configuration layer.
If a previously formula-specific private helper becomes shared by a broader
metric family, rename that helper in the same change so its name matches the
new responsibility. For example, a helper named for deadline rates should not
also compute dropped-frame rates; use a neutral operation/data name such as
`_compute_frame_rate` instead of adding another abstraction layer.
For sibling arithmetic-mean helpers over `FrameOutcome` fields, avoid one
private helper per field when those helpers duplicate validation and
`MetricRecord` construction. Either keep each public helper direct when it stays
short, or use one neutral helper such as `_compute_frame_mean` that accepts the
metric name, unit, direction, and value extractor while leaving formula-specific
fields visible at the public entrypoint.

For bounded lifecycle projection helpers, keep the implementation to an
in-memory projection from an already selected `MediaObject` and explicit timing
inputs into `ReferenceLifecycleState`. Reject non-reference media objects,
require only the timing keys needed for the requested lifecycle state, derive
`useful`, `stale`, and `expired` only from provided state, timestamp, and
deadline values, and delegate timestamp ordering, lifecycle legality, defaults,
and stable `record_id` generation to `ReferenceLifecycleState`. Do not add
external clocks, file I/O, trace loading, transport models, event processors,
component profilers, full simulators, harness runners, exports, docs, or
generated artifacts unless the task explicitly asks for them.

For bounded in-memory record-to-mapping helpers, keep the helper as a raw record
surface adapter, not a result exporter. Support only the accepted record classes
named by the task, preserve dataclass field names exactly, include the existing
`record_id`, and convert JSON-hostile containers such as tuples, lists, sets,
and nested mappings into JSON-friendly in-memory values without mutating the
source record. Prefer explicit `dataclasses.fields(record)` plus `getattr(...)`
over `dataclasses.asdict(...)` when accepted records may contain arbitrary
`Mapping` implementations; `asdict(...)` can fail on valid non-`dict` mappings
before custom conversion runs. Convert `collections.abc.Mapping` values into
plain `dict` values recursively. Do not add file I/O, JSONL/CSV writers, result
artifact directories, schema layers beyond the returned mapping shape,
package-level exports, docs, dependencies, loaders, metrics, harnesses, CLI, or
paper-output behavior unless explicitly requested.

For bounded method scheduling interfaces, implement only the requested call
boundary over existing record types. A first scheduler contract may define a
small protocol, callable type, or minimal runner that invokes a supplied
scheduler and rejects non-`ScheduleDecision` returns, but it must not introduce
concrete scheduling policies, baseline behavior, ABR algorithms, candidate
selection, utility models, method-freeze logic, harness runners, CLI entrypoints,
package exports, file I/O, or experiment artifacts. Tests should use toy
in-memory records, prove the scheduler receives candidates and configuration as
given, assert the returned `ScheduleDecision` is the exact object produced by
the scheduler, and cover invalid-return rejection only when a runtime runner is
part of the task.

For minimum simple baseline schedulers, implement only the named baseline policy
and keep it as an in-memory method implementation behind the accepted scheduling
boundary. Use existing record fields directly, make ordering and default
configuration behavior deterministic, avoid mutating candidate sequences or
configuration mappings, and return the existing decision record without adding
candidate generators, utility models, metrics, harness runners, file I/O,
exports, or external state. Tests should invoke the baseline through the method
runner when one exists, use toy records, cover the policy's owned behavior and
decision invariants, pass mutable candidates/configuration directly when
asserting no mutation, and keep algorithm-comparison or experiment assertions
out of the baseline unit tests.

## Prompts, Text, And Comments

Prompt strings, embedded task text, and user-facing messages should be short,
direct, and task-oriented. Distinguish input references from direct content and
generation responsibility from save/write responsibility.

Use comments only for non-obvious constraints, sources, or decisions. Prefer
clearer names and structure over comments that explain avoidable complexity. Do
not write style rules, generation history, or tool-process notes into comments.

## Open-Source Reuse

When implementing a mature existing capability, first decide whether reuse is
legal, appropriate, and lower maintenance than rewriting.

Reuse preference:

1. stable dependency with compatible license
2. adapter around a stable external API
3. small copied or ported snippet when license permits
4. own implementation

Before copying or adapting code, check license compatibility. Do not copy code
without a clear compatible license. For copied, ported, or adapted code, keep
source attribution in the relevant code comment and maintain `THIRD_PARTY.md`
or an equivalent notice file when multiple external snippets are used. Include
project, URL, file/module, license, version/commit when available, reuse mode,
and main local changes.

Use `academic_army_mcp_tools.deepresearch` when the task depends on unfamiliar
language conventions, framework organization, harness/test practices,
open-source reuse, or external code choices. Do not run it for narrow local
edits in an already-established stack unless the user asks or reuse decisions
are involved.

## Trajectory Selection

A good trajectory is one bounded next edit that follows from accepted,
verified repository state. It should not become a wishlist from the upstream
plans.

After an accepted change:

- re-read the changed files and any root framework docs that may be stale
- record only what is present and accepted
- choose a docs-only sync only when a specific existing framework or package doc
  is known to be stale, incomplete, or contradicted by the accepted change
- if a proposed docs-only sync is mostly already current, narrow it to the exact
  stale document or close it as verified-current instead of editing unrelated
  README-style files
- choose a focused source/test/harness/export task only when the user or current
  workflow explicitly asks for continued implementation
- after an accepted docs-only sync, update TODO or handoff notes to close that
  task without inventing another implementation step; clearing the selected next
  task is appropriate when no bounded follow-up has been requested
- after repository integrity repair, restore-only cleanup, or docs-only
  scaffold repair, stop at the verified baseline unless the user explicitly
  requested a follow-up implementation trajectory
- after an accepted validation-only pass with no fixes, record the command,
  pass/fail count, and cache cleanup or no-cache-artifact finding only; leave
  the next task neutral unless the user or active workflow already selected a
  bounded follow-up
- when recording validation-only results, preserve the exact reported result
  line, including skipped count when present, and distinguish "no fixes needed"
  from "files changed"; cache cleanup is not a source/test/docs change.
- do not treat a green whole-surface validation pass as a new accepted feature
  surface. It confirms the current contracts; it does not create a reason to
  schedule docs syncs, package exports, harness work, metric expansion, or
  additional implementation.
- pause or set `FINISHED` when the accepted change completes the requested
  static surface and remaining work requires new implementation authority,
  execution, datasets, metrics, algorithms, harness runs, or paper results

For TODO or trajectory files:

- make the next task executable as one bounded repository edit only when a next
  task is required by the user or by an existing active trajectory
- name the exact stale file or documented mismatch that motivates a docs-only
  next task; do not add a generic documentation-sync task after every accepted
  source or test change
- after an accepted source/test change, set a README-style sync as the next task
  only when current README-style files are part of the active repository surface
  and now omit or contradict the newly accepted symbol, helper, test, or
  boundary; name the exact docs and repeat the exclusions that prevent future
  capabilities from being implied
- after accepting a new bounded metric-computation helper, explicitly check the
  README-style metric-computation entries, package summary, layout row, test
  summary, and metric absence clause before leaving the next task neutral. If
  any still omit the helper or describe only older sibling formulas, queue a
  docs-only sync that names the exact stale docs and keeps runtime metric
  frameworks, QoE weighting, exports, harnesses, experiments, and paper outputs
  excluded.
- before queuing a multi-file README-style sync, do a small read-only scan of
  the likely README files and record the specific stale sentence, row, or
  absence clause that needs work. If only one requested doc is stale, make the
  next task a one-doc correction or say the other docs are already current,
  instead of carrying a template four-file sync forward.
- when a TODO or trajectory update selects a README-style sync after a metric
  helper, name the newly accepted helper/metric and the exact README-style files
  or surfaces verified stale. Do not set a generic "README sync" next task from
  the assumption that docs must be stale; if no live docs scan was done, leave
  the next task neutral or make the next step an explicit read-only docs scan.
- if a queued README-style sync later proves to be fully current, record it as a
  verified no-op and clear or keep the next task neutral; do not queue another
  docs sync for the same helper unless a new stale sentence is found in the live
  files.
- when recording an accepted docs-only sync, distinguish docs that were changed
  from docs that were only read back and verified current; do not imply all
  requested docs were modified if only one needed a formatting or consistency
  adjustment
- if the accepted task was only a restore, cleanup, revert, or docs-only repair,
  record the accepted baseline and mark the trajectory finished or waiting for
  user direction instead of promoting code, test, harness, or experiment work
- after an accepted README-style sync for a metric helper, do not select the
  next metric helper from the coding plan merely because the docs are now
  current. Leave the next task neutral unless task selection has explicitly
  chosen that next implementation slice.
- for TODO-only maintenance after an accepted docs-only sync, update only the
  TODO or handoff file, read it back, and report that no tests were run because
  no executable code changed
- for TODO-only maintenance after an accepted validation-only pass, update only
  the TODO or handoff file; copy the accepted command, pass/fail count, no-fix
  status, and cache cleanup or no-cache finding from the developer report; state
  that no tests were run for the TODO-only step; and leave the next task neutral
  unless an existing active trajectory already selected a bounded follow-up
- do not convert a validation-only pass count into a completed feature count;
  it confirms the current accepted surface across the named tests but does not
  accept additional formulas, exports, harnesses, experiment execution, or paper
  outputs
- when no next task has been explicitly selected after docs-only acceptance, use
  a neutral waiting state such as "no next developer task is selected; run task
  selection before more work" instead of promoting the next source, harness,
  metric, experiment, or paper-output task
- include explicit exclusions when broad verbs like load, run, export,
  validate, or normalize could be misread as runtime work
- do not mark source contracts, loaders, runnable harnesses, metrics, exports,
  experiments, or paper results complete unless they exist and were verified
- do not promote code/test work from a docs-only scaffold or restored scaffold
  unless explicitly requested
- do not resurrect old review defects or historical plans that are not present
  in the current repository

## Review Guidance

When reviewing code, lead with defects that harm readability, locality, naming,
state ownership, interface clarity, harness/test separation, artifact shape, or
framework consistency.

Prefer review suggestions that delete, inline, move to the use site, rename,
align ordering, split responsibilities, clarify ownership, or reduce caller
burden. Do not default to adding wrappers, registries, config layers, factories,
or defensive branches unless they solve the concrete defect.

If code is already direct and local, avoid suggesting extra abstraction for
style alone.

For bounded normalizer reviews, first verify the change did not alter the
owning record/schema identity contract, package exports, docs, dependencies,
loaders, registries, fixtures, harnesses, simulators, metrics, or generated
artifacts unless those edits were explicitly in scope. A test that mutates a
non-identity optional field and expects `record_id` to change is a test defect,
not permission to expand the accepted record identity. Conversely, do not
require non-identity no-change assertions in a bounded normalizer review unless
they were requested or identity implementation changed. Also check that any
record-id prefix assertion matches the accepted record implementation rather
than an inferred helper or class name.

For lifecycle projection reviews, verify the helper only projects selected
reference media plus explicit timing inputs into `ReferenceLifecycleState`.
Non-reference rejection, per-state missing-timing checks, deterministic
`useful`/`stale`/`expired` flag derivation, delegated timestamp validation, and
stable identity through the accepted lifecycle record contract should be
covered. Treat external clocks, runtime simulators, transport or event
subsystems, component profilers, file I/O, exports, docs, metrics, harness
runners, or experiment claims as scope defects unless the user requested them.

For bounded record-to-mapping reviews, verify the helper supports only the
accepted record classes, includes the existing `record_id`, preserves field
names, converts tuple-like values to lists, preserves nested mappings as plain
dicts, rejects unsupported inputs, and does not mutate source records. Check at
least one accepted record with a non-`dict` `Mapping` field, such as a
`MappingProxyType`, so the implementation does not rely on `dataclasses.asdict`
behavior that fails before custom JSON-friendly conversion can run. Treat file
writers, JSONL/CSV exporters, artifact directories, new schemas, package exports,
docs, dependencies, loaders, metrics, harnesses, CLI, or experiment claims as
scope defects unless the user requested them.

For bounded metric-computation reviews, verify the helper implements only the
named formula, reads accepted raw record fields directly, rejects empty inputs
and invalid aggregation keys clearly, includes source record IDs as provenance,
does not mutate source records, and returns a valid `MetricRecord` while
delegating metric validation and identity to that record type. Treat extra
metric formulas, QoE weighting, aggregation frameworks, file/result exporters,
schemas, package exports, docs, dependencies, loaders, harness runners, CLI,
experiments, or paper-output claims as scope defects unless the user requested
them.
Review named boundary tests against their fixture values and expected metric
fields. If a zero, all, none, or single-frame case is actually mixed data,
request the smallest focused test correction before accepting the trajectory.
Also check private shared helper names after sibling formula additions. Passing
tests are not enough if a shared helper's name still describes only the older
formula family; require a neutral private name without changing the public API
or behavior.
For sibling mean-metric reviews, check whether the change added parallel private
helpers that differ only by source field and unit. If so, ask for the smallest
cleanup: one neutral mean helper with explicit unit/value extraction, or direct
public functions if that is clearer than another abstraction.

For minimum baseline scheduler reviews, verify the implementation stays behind
the accepted method boundary, uses only in-memory record fields, has
deterministic ordering and missing-configuration behavior, does not mutate
inputs, and returns a valid decision record. Treat added ABR algorithms,
candidate generation, utility models, metric formulas, result exports, harness
runners, package exports, docs, file I/O, or experiment claims as scope defects
unless the user explicitly requested them.
When reviewing no-mutation coverage, verify the test asserts on the same
mutable input object that was passed to the implementation; tests that pass an
immutable copy or converted container while checking the original are false
positives.

For README-style docs-sync reviews, cross-check every newly documented symbol or
test against the document's absence clauses. A stale "no methods", "no tests",
"no metrics", "no exports", or similar broad exclusion that contradicts an
accepted bounded surface is a documentation defect even if the new module entry
was added correctly.
Also scan table rows and summary sentences for stale singular wording after a
surface becomes cumulative; a docs sync is incomplete if one section says both
accepted siblings exist while another still describes the same module or test as
a single helper, scheduler, baseline, or validation path.
For lifecycle projection docs, also scan English and Chinese wording for
normalizer/projection confusion. A test summary that says stable IDs are covered
through a normalization path for `simulate_reference_lifecycle_state(...)` is
stale; it should say projection path and keep full-simulator/runtime claims out.
For raw-record mapping docs, verify test summaries say the helper preserves the
existing `record_id` from source records unless tests actually mutate
identity-bearing fields. Also narrow stale "no exports" clauses so they exclude
file-based/result exporters and artifact surfaces without contradicting an
accepted in-memory mapping helper.
For bounded metric-computation docs, verify docs name the exact formula helper
and focused test file, then narrow broad "no metrics" clauses to "no additional
metric formulas, QoE weighting, aggregation frameworks, runnable harnesses,
experiments, or paper outputs" without implying the planned metric layer exists.
When there are multiple accepted formula helpers in one module, review plural
wording and cumulative lists the same way as baseline docs; stale singular
"the metric helper" wording can mislead even when every filename is listed.
After a third or later helper is accepted, treat stale "both", "two", or
formula-family-only descriptions as review defects even if the module and test
filenames are already correct.
For cumulative README-style metric syncs, sample every repeated surface named
in the task, not just the first occurrence: implemented-surface summary,
package summary, layout row, test row, and absence clause. If any surface stops
at the previous helper or omits the new `metric_name`, request the smallest
docs-only correction in the requested file set.
When a non-rate metric helper is added to a module that previously contained
only rate helpers, review the surrounding descriptor as well as the helper list.
Reject "rate metric computation" or "rate computation path" wording for a mixed
rate-and-mean surface even when the new helper and metric name are listed.
For metric docs-sync reviews, compare coverage wording against the focused test
file. Treat "none FPS", "none latency", "none quality", or "none score" as
misleading for mean helpers when the tests actually cover all-zero, mixed, and
single-frame numeric inputs.
If the developer reports a docs-only no-op, review the live requested files for
the named helper list, metric names, test summary, and absence clauses before
requesting edits. Accept the no-op when those surfaces are already current.

For validation-only reviews, verify the developer ran the exact requested
command from the repository root, reported the pass/fail count, made no source,
test, docs, dependency, export, or TODO changes when the suite passed, and
removed only generated cache/bytecode artifacts or reported that none remained
after the run. Do not request cleanup of pre-existing dirty or untracked
accepted files, and do not ask for new docs, exports, harnesses, or follow-up
implementation solely because validation passed.
Also compare the reported command against the requested test-target list. A
green validation run that omits a requested file, silently substitutes a smaller
suite, or creates a missing test target during a validation-only task is not an
acceptable validation trajectory.

## Readability Audit

After edits, perform a quick static audit:

- names match real meaning and data shape
- data flow is direct and ordered naturally
- functions, files, and modules have clear responsibilities
- abstractions reduce real complexity rather than add jumps
- no avoidable global state, hidden paths, long call chains, or repeated
  registration points were added
- the change stayed local to the natural owner
- harness and test responsibilities remain separate
- artifact schemas, exporters, docs, and tests agree when any of them changed
- framework docs are updated or confirmed current
- external code has compatible license and attribution when reused
- no generated cache/build/test/output/result artifacts were left behind unless
  explicitly requested

For docs-only tasks, audit that docs describe only current repository reality
and do not imply code, tests, loaders, runnable harnesses, metrics, exports,
experiments, generated artifacts, or TODO status that do not exist.

## Static Validation

Use static validation appropriate to the task and existing stack. Do not run
installs, harnesses, experiments, or full pipelines through this skill unless
the user or active coding workflow explicitly authorizes that execution.

For explicit validation-only tasks, run the requested command from the
repository root before making any edits. Treat a green run as the desired
outcome, not as permission to tidy nearby code, refresh docs, update TODO, add
exports, or broaden coverage. If the run fails, change only the accepted
source/test surface needed to satisfy the existing contract, then rerun the
same focused command and clean generated cache artifacts.

For source changes, useful static validation may include syntax checks,
importability checks, schema-surface checks, public export checks, or collection
shape checks that do not load real data, run harnesses, or write results.

For tests, inspect that fixtures exist, parametrized argument names match test
function signatures, helpers refer to existing symbols, and invalid cases reach
the intended validator. For no-mutation tests, check that the object inspected
after the call is the same mutable object given to the code path under test.
If the contract is about immutable source records rather than container order or
mapping mutation, check that the same source record objects are inspected after
the call; a tuple containing those records is acceptable when the container is
not itself under test.

When a task adds or changes focused unit tests and the repository already has a
lightweight test runner configured, prefer running the smallest relevant test
target if that does not require dependency installation, real datasets,
harnesses, experiments, or generated result artifacts. If the focused tests
cannot be run in the current task, say so and make the next trajectory
validation-only before adding more implementation.

Before running Python tests, choose a command form that avoids in-repository
generated artifacts where the project permits it, such as disabling bytecode
and pytest's cache provider for focused validation. For `src/` layouts, prefer
an explicit environment path or existing editable install over changing project
metadata just to satisfy imports. After any validation run, check for generated
cache or bytecode directories created inside the repository and remove only
those generated artifacts before handoff.

For docs-only syncs, re-read the docs and check referenced paths exist, the docs
match current repository state, and the diff contains only the requested docs.
If the diff only touches formatting, verify that the formatting change removes a
real inconsistency with sibling docs; otherwise leave the file unchanged and
report it as already current.
Resolve every documented path from the repository root exactly as written. If a
file lives outside the repository, label it as an external or parent input and
use the correct relative path from the documented context, not a bare filename
that implies a repo-root file. Do not list external planning inputs in a
repository layout table unless the table explicitly distinguishes them from
files inside the target repo. When docs list implemented symbols, files, tests,
or artifacts, derive the list and counts from the current source tree instead
of memory or planning documents.

For cleanup, verify exact deleted paths are absent and no exports, tests, docs,
or generated artifacts still reference them.

## Final Response

Keep the final response concise:

- changed repository-relative paths
- behavior or contract covered
- relevant static validation performed
- caveats only when they affect the user's next action

Do not paste full files unless requested. Do not explain skill internals or tool
mechanics.

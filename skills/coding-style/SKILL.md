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
from the current user request, current goal or reference context, current
repository, and existing code.

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

When parsing an external schema into an internal record or value, keep source
column names separate from internal field names. If the task says to map
external `<source_field>` to internal `<target_field>`, expose and test the
internal name unless the user explicitly asks to preserve the source field as a
public output. Keep raw source names local to parsing, validation errors, or
provenance only when that is the clearest contract.

For parsers and loaders, normalize raw text at the boundary and construct
public records from already-typed values. Do not relax an existing record's
field validators because a new file format arrives as strings; parse the new
format before record construction or add a narrow local parser helper. If a
private validator is shared across old and new loaders, its contract must stay
true for every caller and must not broaden legacy public behavior unless the
task explicitly scopes that behavior change.

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

When reusing an existing private helper for a broader case, first check whether
the helper name, parameters, and doc-adjacent wording still describe every
caller. Rename the private helper to the smallest neutral name when its original
name encodes a narrower case, tail, direction, artifact type, or caller-specific
behavior that is no longer true. Do not change the public contract merely to fix
a private naming drift.

Do not add abstractions for imagined future cases. If a simple implementation
clearly satisfies the current task, keep it simple.

Reduce global state, hidden path assumptions, implicit side effects, long call
chains, repeated registration points, and heavy configuration for simple
experiments.

When an interface forces every caller to pass excessive parameters, consider a
small explicit context or config object. Do not turn that into a framework when
plain values remain clearer.

When a field or config contract says "finite number", validate finiteness
explicitly. Reject `NaN`, positive infinity, negative infinity, booleans when
the language treats booleans as numbers, negative values when the contract says
non-negative, and non-numeric values. Do not treat "not NaN" as equivalent to
finite. If an existing shared validator has intentionally weaker legacy
behavior, leave it unchanged unless the task scopes that contract change, and
add a local validator for the stricter new config.

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
- formula, threshold, ordering, percentile, or ranking tests should use
  discriminating fixtures where a neighboring formula, adjacent threshold,
  reversed ordering, or copied existing helper would fail;
- numeric config validation tests should match the stated contract for each
  key: missing/default behavior, accepted boundary values, negative values when
  non-negative is required, non-numeric values, `NaN`, and infinities when the
  contract says finite. If multiple fields or parameters say "finite" or "not
  bool", cover each owner, not only one representative owner;
- parser and loader tests should assert internal field names, units, converted
  values, row/sample provenance, slicing semantics, immutable return shape when
  promised, and boundary normalization after any external-schema mapping. A test
  that only proves the raw source column was read does not prove the internal
  contract was respected;
- fixed-shape parser tests should make malformed structure failures explicit:
  wrong component counts for each owned tuple/vector, malformed delimiters,
  non-finite values for each finite owner, and invalid window arguments for each
  public slicing parameter. Keep these as small contract fixtures, not large
  real-data reproductions;
- budget-enforcement tests are separate from budget-configuration validation.
  When the scope asks for over-budget rejection or reason capture, use a valid
  constrained budget that lets at least one eligible candidate reach the
  selection loop and then exceed the remaining budget. Assert the rejected ID
  and exact budget-exceeded reason named by the task; an invalid budget test,
  missing-budget test, filtered candidate, cadence skip, or type rejection does
  not cover selection-time budget exhaustion;
- for ordered selectors, missing-budget or unbounded-budget behavior still
  follows the selector's ordering contract after filtering and staging. The
  expected selected IDs should be the full eligible set in sorted order, not the
  input order, unless the contract explicitly says input order is preserved;
- tie-breaker tests should make the primary sort keys equal and deliberately
  set other sort-like fields to favor the opposite order, so only the requested
  tie-break field can explain the expected result;
- for multi-key ordering, test each tie-break level separately: hold all higher
  priority keys equal, set the key under test to determine the expected order,
  and set lower-priority sort-like keys to favor the opposite order. A fixture
  does not prove a middle tie-break if the final ID/name/order key would choose
  the same winner;
- treat compound ordering phrases such as "deadline/object-id",
  "density/deadline/id", or "score/frame/deadline/id" as a checklist, not as a
  single fixture. Prove the first key with adversarial lower-priority fields,
  then add a same-higher-key fixture for each fallback key, including the final
  lexical identifier fallback when it is named;
- tie-break fixture names and object IDs are labels, not evidence. Before
  accepting an ordering test, inspect the actual tuple fields used by the sort
  and confirm the expected winner is not also favored by a lower-priority
  fallback field;
- for filtered, staged, or multi-phase selection, repeat the ordering audit for
  each accepted subset or phase, including catch-all groups such as regular,
  default, or non-special candidates. A fixture that proves the final
  identifier tie-break inside one phase does not prove that an earlier ordering
  key, subset ordering key, or phase priority is enforced;
- for partitioned budgets, lanes, quotas, queues, or resource pools, isolation
  tests should leave spare capacity in one partition while a candidate in
  another partition exceeds its own limit. A fixture where every partition is
  fully consumed does not prove that borrowing, sharing, or leakage is absent;
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

Maintain framework docs only when docs are in scope, the active workflow
requires docs, or the accepted change would leave a current documented surface
materially misleading. Keep docs about current reality, not template
initialization, aspirational status, or skill mechanics.

Framework docs should explain where future local changes should happen:

- stable boundaries and extension points;
- change map from feature type to module, harness, test, or export area;
- harness purposes, metrics, and raw artifacts;
- test organization actually used by the repository;
- raw-first export approach and downstream analysis boundary;
- framework risks where future changes cannot yet stay local.

For README-style or package docs, read the requested files first and classify
surfaces as current, stale, or historical. Edit only stale current surfaces
needed for the accepted change. If all requested docs are current, report a
no-op docs sync and the readback/search checks that proved it.

When one accepted symbol, artifact, metric, method, or helper is documented in
multiple parallel surfaces, build a small surface map before editing: helper or
API lists, emitted names, package/module summaries, layout rows, test summaries,
and absence clauses. Update each stale parallel surface consistently, but do
not add new public exports, runtime behavior, or future-plan claims just because
the docs mention the accepted bounded surface.
Bind the surface map to the current selected subject. Neighboring helpers,
methods, tests, metrics, or earlier accepted features in the same document are
context, not part of the sync, unless the user explicitly scopes them or the
same sentence/list must change to stay truthful. Do not carry predecessor tokens
or coverage details from a previous task into the current docs pass when the
current request names a different stale predecessor or surface boundary.

For each subject-specific surface in that map, carry the full scoped contract
when the user names it: accepted inputs or candidate classes, rejection reasons,
configuration or budget keys, ordering or priority rules, emitted metadata, and
validation behavior. Do not rely on a neighboring surface, a shared-helper
phrase, or an absence clause to imply a detail that the current subject's
surface must state explicitly.
If the scope gives an exact callable signature, return annotation, record
shape, output container, or immutability promise, reproduce that contract on
every requested API, package-summary, module-summary, and translated surface
that names the callable or record. Generic phrases such as "sample values",
"helper output", or "bounded parser" are not substitutes for a named return
shape when the user supplied one.

When a docs-sync request says a surface currently lists through a previous
accepted subject, search that predecessor token in every requested document
before editing. Treat each occurrence as a current surface or historical note.
Update stale current rosters and scoped surfaces; leave historical notes alone
after confirming they are not current-surface lists.

Write docs at the stable contract level by default. Summarize behavior,
metadata, configuration, rejection reasons, ordering, artifact shape, and test
coverage clearly enough for future maintainers to find the right code. Do not
copy full fixture ID lists, exhaustive invalid-value matrices, or lengthy test
expectations into README-style docs unless the user explicitly requests that
level of detail, the existing docs already use that convention for the same
surface, or review feedback depends on an exact fixture detail.

Keep priority, visibility, partition, and ordering terms separate from filters.
If an item outside a priority group remains eligible, document it as lower
priority or off-priority, not as rejected or as an invalid type. Rejection
wording should describe the actual contract owner: type filters reject types,
validation rejects invalid inputs, and budget handling rejects otherwise
eligible over-limit items.

When the user scopes specific test-coverage details for README-style docs,
turn those details into a per-document checklist for every requested test
summary surface. Preserve the exact behavioral distinction that made the test
valuable: discriminating fixture setup, tie-break owner, invalid-input owner,
metadata value, provenance field, non-mutation target, or same mutable object
when those are named. A generic sentence such as "covers tie-breaking" or
"covers non-mutation" is not enough when the scope names the fixture condition
or the object whose mutation must be rejected.

For staged, filtered, or multi-path behavior in README-style docs, document the
behavior by responsibility: accepted subset definitions, phase priority, primary
ordering for each accepted subset, tie-break fixtures, metadata, and each
rejection reason's owner. Do not let a tie-break fixture stand in for the
primary ordering case, and do not describe one rejection reason as applying to
all rejected items when another rejection path, such as budget or validation,
uses a different reason.

When a README section groups multiple symbols, helpers, schedulers, metrics, or
tests under one sentence or bullet list, the group label must be true for every
item in that list. If a metadata value, rejection reason, config key, fixture,
or coverage case belongs to only one grouped subject, split it into a
subject-specific bullet or paragraph instead of relying on a shared block.

Write absence clauses narrowly. Before saying a broad category is absent, check
the current code and docs for accepted bounded surfaces in that category. If a
small in-memory conversion, helper, adapter, or test surface exists, qualify the
missing surface precisely, such as "file-based", "result", "additional",
"runtime", "full", "real-data", or "paper-output" capability. Do not let a
negative sentence contradict an implemented helper documented elsewhere.
When the accepted feature is a bounded or partial member of a broader algorithm,
model, runtime, or framework family, absence wording should name only the
unimplemented larger surface, such as "full", "additional", "beyond the
accepted bounded formula", or "runtime integration". Do not use the broad
family name alone as absent when the current docs also document an accepted
bounded implementation in that family.
Prefer narrow positive absence sentences such as "This bounded surface does not
add <capability>" or "<capability> remains unimplemented." Avoid double
negatives and "No <capability> is not ..." constructions, especially after
rewriting a long absence clause.

Do not automatically queue a docs-only task after every source/test change.
Queue or perform docs sync only when docs are explicitly requested, are part of
the active workflow, or the accepted change would leave a current documented
surface materially misleading. If docs are excluded from the source/test task,
do not promote stale documentation found during validation or TODO maintenance
into the next developer task unless the user, active workflow, or existing
trajectory explicitly selects docs sync. Record possible docs staleness as a
caveat or candidate, not as a selected handoff.

## Trajectory And TODO Maintenance

Trajectory files should record accepted facts, exact validation commands and
results, cache cleanup or no-cache findings, and explicit exclusions that
preserve scope.

For docs-only or TODO-only accepted work, record the readback and targeted
search checks that replaced test execution, and state that tests were skipped
because no executable code or test files changed.
For a no-op docs sync, record the targeted searches and requested-surface
readback that proved the docs were already current, plus a changed-file check
showing no requested docs were modified.

For scoped docs-only or TODO-only work, also record a changed-file check or
equivalent scope check showing that edits stayed inside the allowed file set.
If an executable, test, dependency, export, harness, generated artifact, or
paper-result file changed accidentally, treat the run as no longer docs-only
and validate or repair according to the user's scope.

Do not use TODO or handoff files to invent the next source, harness, docs, or
experiment task. Select a next task only when the user has explicitly selected
it, the current workflow instruction names that handoff, or an existing active
trajectory already contains that selected task. Otherwise leave a neutral
waiting state such as "no next developer task is selected."

When the accepted source/test task explicitly excluded docs, TODO, exports,
harnesses, experiments, or generated outputs, preserve that exclusion in the
trajectory. A later TODO-only pass may record accepted work and verified stale
surfaces, but it must not turn excluded surfaces into selected follow-up work
without explicit task selection.
Verified stale docs, exports, harnesses, or artifacts are evidence for a future
task-selection pass, not a selected next task by themselves. A repository habit,
recent sequence, or reasonable maintenance preference is not explicit selection
when the just-finished task excluded that surface. Require selection language
from the user, a workflow instruction, or an already-active backlog item before
writing "next developer task: sync docs" or any equivalent handoff after a
source/test task that excluded docs.
Explicit exclusions in the current task are not backlog seeds. If the user says
not to add a capability, parser family, registry, export, adapter, harness,
CLI, artifact, experiment, or paper output, a TODO-only pass may record that
the exclusion was preserved, but must not select that excluded capability as
the next task unless a later explicit task-selection input asks for it.

After an accepted docs-only or TODO-only update, treat any next implementation
task as a separate task-selection decision, not as a consequence of making docs
current. If a next source/test task is recorded, tie it to an explicit upstream
selector, accepted backlog item, or already-scanned stale implementation gap;
otherwise leave the trajectory neutral.
Do not use a docs-only sync that merely documented an accepted helper as the
reason to select an adjacent implementation task. Newly visible omissions in
the docs may be recorded as candidates for later selection, but the next
developer task stays neutral unless the user or active workflow explicitly
selects that implementation work.

If a docs-only sync is explicitly selected, name the exact stale current
surfaces found in a read-only scan and make clear that it is a separate future
pass, not part of a source/test task that excluded docs. If no live stale
surface was verified, do not create a generic documentation task.

When a handoff selects a docs-only follow-up, include a short stale-surface map:
the document files and surface types to update, such as helper/API lists,
emitted names, package or module summaries, layout rows, test summaries, or
absence clauses. A generic "sync docs for <accepted change>" task is not enough
unless those concrete stale surfaces are also named. Keep the handoff small:
name stable contracts and stale surface types, not every fixture ID,
selected-object list, or assertion from the tests.

If accepted review tightened a discriminator, rejection reason, metadata value,
or mutation target that docs must preserve, carry that exact detail into the
handoff scope. Do not copy unrelated fixture lists merely because they were
accepted in tests.

When review corrections changed wording, hierarchy, or absence scope, record
the final accepted correction as the current contract. Do not preserve rejected
draft wording as a new TODO item unless the reviewer or user explicitly asks
for a follow-up.

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
test files changed accidentally. Re-read edited docs/TODO files and run targeted
text searches for the accepted names, stale predecessor names, and broad absence
phrases that were in scope.

When README-style docs must describe focused test coverage, include targeted
readback checks for the scoped coverage nouns and discriminators, not only the
new public symbol. Search for the tie-break field, opposite-order fixture clue,
metadata key or value, provenance field, invalid-input category, and exact
non-mutation target when the user named them.

For multi-surface docs, do not rely on whole-file search alone. Check the
specific edited section or paragraph type that was in scope, especially test
summary paragraphs in translated docs, so a term present elsewhere in the same
file does not mask a stale summary.

For Markdown docs with nested bullets or long copied list blocks, audit the
local hierarchy after editing. Read the lines around every edited heading and
the next sibling heading or bullet. Confirm top-level file, module, test, or
artifact bullets remain siblings rather than becoming children of the previous
coverage block, and confirm nested bullets are nested only where intended.
For each edited bullet, compare its literal indentation prefix with the nearest
same-level sibling and nearest child bullet in the same list. A child entry
under a module/test/feature parent should keep the same prefix as neighboring
children; a new sibling module/test/file entry should keep the same prefix as
neighboring siblings. Do this line-level check before reporting docs-only
validation complete.

For README-style docs that extend a roster from a previous accepted subject,
search both the predecessor token and the new token after editing. Read every
remaining predecessor occurrence in local context and confirm either that the
new token appears in the same current roster, layout row, summary, or coverage
block, or that the predecessor occurrence is intentionally historical and not a
current-surface list.

When scoped details reuse strings already present for other subjects, validate
with local context: the current subject name and the required fixture, metadata,
reason, or config term should appear in the same bullet, paragraph, or clearly
bounded coverage block.

When the scope names an exact callable signature, return type, output container,
or record immutability contract, validate that exact contract in every requested
surface that names the callable. Read local context around the callable in each
document; a whole-file hit for the record name or helper name does not prove the
API surface carries the return contract.

When a scoped invalid-value matrix names multiple keys or inputs, validate each
owner separately in local context. Search/read back for every named key or input
together with the invalid-value class or explicit invalid values in the same
test-summary bullet, paragraph, or bounded coverage block.

When a docs-sync scope includes both default and non-default configured
fixtures, read back those bullets separately. Confirm the config value or
"default" label matches the expected selected/rejected IDs and reasons in that
same local context.

When the user names specific excluded capability categories, include those
terms or close equivalents in docs/TODO readback searches. The check should
confirm that absence wording stayed narrow for every explicitly scoped
exclusion, not only that the new accepted name appears.

For README-style docs, include a quick local prose cleanup pass on edited
paragraphs: remove duplicated adjacent words or lines, stale sentence tails left
after rewriting a clause, and grammar artifacts that can make a scoped absence
claim ambiguous.

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
- maps external source fields to the requested internal output names without
  leaking raw source names into public records unless explicitly scoped;
- rejects invalid inputs at the intended validation owner;
- implements numeric contracts literally, including rejecting infinities when a
  value must be finite and preserving weaker legacy validators unless changing
  them is explicitly in scope;
- returns the accepted record or value shape;
- preserves provenance when requested;
- does not mutate source records or inputs unless mutation is the contract;
- keeps identity behavior delegated to the accepted record or schema type;
- keeps any reused private helper name semantically true for all current
  callers;
- avoids adjacent runtime surfaces such as loaders, registries, exporters,
  harnesses, CLI, experiments, or paper outputs unless explicitly in scope.

For documentation reviews, compare every newly edited absence clause against
the implemented-surface list, package/module summaries, layout rows, and test
summaries. Treat broad "no <category>" wording as a defect when a narrower
bounded surface in that category is already accepted; ask for the smallest
wording fix instead of reopening source or tests.
Also treat leftover duplicated words, duplicated sentence tails, or malformed
negative clauses as docs defects when they change or obscure the intended
scope.

Also compare every requested test-coverage detail against each edited test
summary surface, including translated README surfaces. If one document keeps a
generic coverage phrase while another contains the precise discriminating
fixture or non-mutation target, request the smallest wording fix in the stale
document only.

Treat cross-surface leakage as a docs defect: a required rejection reason,
metadata value, fixture ID, provenance field, or mutation target is still
missing if it appears only in a helper/API list while the scoped test-summary
paragraph omits it.

Treat exact-contract leakage as a docs defect: if the user supplied a callable
signature, return annotation, output container, or frozen/immutable record
promise, every requested API or module surface that names the callable must
state that exact contract or a direct equivalent in the same local context.

Treat roster leakage as a docs defect: when a request extends an implemented
surface that was previously listed through an older subject, any current
helper list, module summary, package summary, layout row, parenthetical roster,
or test summary that still stops at the predecessor is stale even if another
surface in the same file already includes the new subject.

Treat subject leakage as a docs defect too: a required fixture, metadata value,
rejection reason, or config key is still missing if it appears only under a
neighboring helper, scheduler, method, metric, or test block.

Treat unrelated-subject drift as a docs defect. If a docs-sync task is scoped
to one accepted symbol, helper, parser, method, metric, artifact, or test, do
not accept rewrites to neighboring subjects merely because they are nearby in
the same README. Request the smallest revert or wording trim unless the
neighboring edit is necessary to keep a shared sentence, roster, or absence
clause truthful.

Treat validation-owner leakage as a docs defect: if a scoped invalid-value set
applies to multiple named keys, fields, modes, or inputs, the test-summary
surface is stale when it documents the invalid set for only one owner or hides
the owner list behind a vague "invalid config" phrase.

Treat validation-owner leakage as a test defect too: when the implementation
contract names multiple finite values, integer fields, or parameters that must
reject booleans, require at least one focused test per owner or a compact
parametrized test that names each owner. Do not accept a single neighboring
owner's `NaN`, infinity, or boolean test as coverage for the whole helper.

Treat default/config leakage as a docs defect: a test-summary surface is stale
when it labels a fixture with an explicit non-default configuration as default,
or when it documents the configured fixture but omits the separate default
fixture expectation named by the scope.

For documentation reviews, also check the scope sentence or heading that
introduces grouped bullets. A fact is misdocumented if it appears under a group
where one or more named subjects do not own that metadata value, rejection
reason, config key, fixture, or coverage case, even if the fact is present
somewhere in the requested file.

Treat Markdown hierarchy drift as a docs defect. If an edited file, module,
test, artifact, or capability bullet becomes nested under a neighboring
coverage block or subject, request a smallest-possible indentation fix even
when the words themselves are correct.

For docs that describe staged, filtered, or multi-path behavior, verify that the
primary ordering coverage, phase priority, subset definition, and each
rejection reason are all present in the correct test-summary surface. A broad
"rejected with <reason>" phrase is a defect when only one filtered subset uses
that reason and another path uses budget, validation, or a different rejection
contract.

Review tests against their fixture values and names. If a test name says
"all-zero", "empty", "single", "all", or "none", the fixture should actually
match that case. Passing tests are not enough when naming, boundary, or
provenance contracts are misleading.

For variants added next to an existing formula or helper, check that at least
one focused test distinguishes the new variant from the nearest existing one.
Do not accept a mixed fixture that would still pass if the implementation used
the previous threshold, percentile, sort direction, condition, or field.

For sort-chain tests, trace the expected order through the exact sort tuple.
Reject a fixture if the expected winner is also favored by a lower-priority
fallback key or by an unrelated aligned field. Each named tie-break level should
have at least one fixture that would fail if that level were omitted.
Do not trust helper names, object IDs, or comments that say "earlier", "later",
"best", or "tie" unless the underlying field values prove that relationship and
the fallback fields are adversarial where needed.
If review scope asks for a combined fallback chain, such as `<primary>/<id>` or
`<primary>/<secondary>/<id>`, verify there is both a dominance fixture for each
non-final key and a same-higher-key fixture for the final identifier fallback.

For staged, filtered, or partitioned-lane schedulers, review the sort tuple for
every stage, lane, or accepted subset separately, including default or regular
subsets. If a phase says it orders by one key and then a fallback key, require
one discriminator for the first key and a separate same-key fixture for the
fallback; do not accept a same-key fixture as evidence that the first key is
implemented.

For resource-isolation claims, check the fixture has unused capacity in at least
one non-borrowing partition and an over-limit item in another partition. A test
where each lane, quota, queue, or resource pool exactly consumes its own budget
does not prove that unused capacity cannot leak across boundaries.

For budgeted selectors, review invalid-budget tests separately from
over-budget selection tests. If the task asked for budget rejection and reason
capture, require a valid-budget fixture where an otherwise eligible candidate
is rejected only because remaining budget is insufficient, and assert that
candidate's exact rejection reason. Do not count missing-budget behavior,
invalid-budget exceptions, filtered objects, cadence skips, or type rejections
as over-budget coverage.

For ordered selectors, review missing-budget or unbounded-budget assertions
against the same filtering, staging, and sort tuple used by constrained-budget
selection. Selecting every eligible candidate should still prove the accepted
ordering contract unless the requested behavior explicitly preserves input
order.

When addressing review feedback in a file with repeated tests or similar helper
fixtures, verify the exact named test, helper, or caller cited by the review was
changed. Do not treat a similar edit in a neighboring existing test as
satisfying feedback for the new surface.

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
- validation performed, using readback/search checks for docs-only work;
- caveats that affect the user's next action.

Do not explain skill internals, tool mechanics, or style theory unless the user
asked for a skill optimizer report.

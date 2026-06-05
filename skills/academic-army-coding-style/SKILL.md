---
name: academic-army-coding-style
description: >-
  Apply a fixed Academic Army author coding style to code generation, code
  modification, prompt-in-code editing, and code review. Use when Codex needs to
  write or revise code with consistent style across agents: minimal direct
  implementation, few abstractions, few states, clear ownership boundaries,
  precise semantic naming, visible data flow, consistent ordering, and
  content-reference clarity. This is a style skill only; it does not plan
  experiments, choose tools, run code, debug environments, or manage projects.
---

# Academic Army Coding Style

## Scope

Apply this skill only to the shape of code, code-adjacent prompts, and code
review comments. Keep implementation, testing, tool selection, environment
handling, project planning, and runtime recovery outside this skill.

Use the rules directly. Do not infer author preference at runtime, do not
explain the skill's internal rules to the user, and do not write style-rule
commentary into code comments.

## Core Style

Prefer code that is short, direct, shallow, and easy to read in one pass. Make
the data flow visible: where input comes from, how it is processed, where it is
sent, and what is returned or written.

Favor these qualities:

- minimal necessary change
- direct implementation path
- strong semantic names
- clear layer ownership
- stable state only
- use-site locality
- matching order across related structures
- explicit separation between content and references

## Minimal Direct Code

Use the most direct implementation path that remains readable.

- Keep one-use, short, non-semantic logic near its use site.
- Inline trivial helpers that only forward, rename, wrap, unwrap, or rearrange
  data.
- Delete meaningless helpers, wrappers, temporary structures, adapter layers,
  and conversion objects when direct flow is clearer.
- Avoid "split apart then join again" data movement. Preserve direct flow when
  a value is ultimately used as the same whole.
- Do not add layers, registries, factories, configuration objects, or branching
  only for possible future extension.
- Prefer removing, inlining, moving, or renaming before introducing a new
  abstraction.

Create a helper or layer only when it has real semantic value: stable reuse,
clear boundary ownership, invariant protection, or a meaningful reduction in
local complexity.

## Use-Site Locality

Keep code close to the place that owns and uses it.

- Put local helpers, temporary state, special cases, and one-off configuration
  near the caller that needs them.
- Put only truly shared, stable, cross-site behavior in common modules.
- Keep special-case behavior at the special-case use site when possible.
- Do not pollute shared layers with logic needed by only one caller.
- Move logic back to its true owner instead of adding another adapter around a
  misplaced boundary.

## Layer Ownership

Make ownership visible in the code structure.

- Let each variable, state field, configuration value, and output live in the
  layer that truly owns it.
- Keep values produced and consumed inside one local flow as local values.
- Promote data into shared structures only when it remains meaningful across
  boundaries.
- Keep orchestration-only, persistence-only, or display-only values out of
  business interfaces.
- Separate generation, processing, saving, and exposure responsibilities.
- Avoid multiple layers claiming responsibility for writing, saving, exporting,
  or returning the same artifact.

Model only stable state. Do not turn transient, restart-unstable, or single-run
intermediate concepts into long-lived model state.

## Semantic Naming

Name things by their real meaning, data shape, and domain contract.

- Use names that are short but semantically complete.
- Remove prefixes, suffixes, and wrapper words that add no information.
- Keep one concept named consistently across interfaces, configs, types,
  prompts, call sites, outputs, and documentation.
- When renaming a concept, update the full chain and remove old-name residue.
- Do not use vague, historical, generic, or implementation-accidental names.
- Preserve already established contract terms, spellings, and domain words.
- Make suffixes match real data shape: reference, path, content, status,
  result, config, and handle names must not be interchangeable.

If a name says "reference", "path", "handle", or "ID", the value should be an
external locator or identifier. If a name says "content", "text", "body", or
"data", the value should be the loaded content itself.

## Content-Reference Clarity

Keep content and references separate in names, interfaces, prompts, and data
flow.

- Pass content with content names.
- Pass references with reference names.
- Do not let a reference-named variable carry loaded content.
- Do not let a content-named variable carry an external location, handle, or
  identifier.
- Fix unclear boundaries with naming and data flow, not with more wrappers.
- When an outer layer saves or archives content, avoid making an inner layer
  perform the same write responsibility.

## Order Mirrors Meaning

Let code order support reading order.

- Arrange input, validation, construction, call, output, and persistence steps
  in natural execution order.
- Keep field order, parameter order, definition order, and call order aligned
  across corresponding structures.
- Put related code near related code.
- Avoid forcing readers to mentally map between differently ordered structures.
- Use structure, names, and ordering to express intent before adding comments.

## Prompt-As-Code

Apply the same style to prompts, task descriptions, embedded instructions, and
user-facing text stored in code.

- Write prompts as direct task instructions, not role-play openings.
- Distinguish external references from direct content in prompt inputs.
- State who generates content and who saves content.
- Avoid bare filenames, pseudo-paths, or vague references without context.
- Keep prompt text short, explicit, and task-oriented.
- Do not expose the skill workflow, template rationale, or style rules inside
  prompt text.

## Comments

Use comments only for non-obvious decisions, constraints, or special reasons.

- Prefer simplifying code over explaining convoluted code.
- Do not comment what better naming or structure can express.
- Do not write style analysis, implementation process, debugging process, or
  skill-rule explanations into comments.
- Make comments serve future maintainers, not generation traceability.

## Existing Code Changes

When modifying code, make the smallest behavior-preserving change that satisfies
the task.

- Preserve the repository's established patterns when they are compatible with
  this style.
- Do not copy existing bad abstractions, stale names, or unclear boundaries.
- Do not refactor unrelated code while implementing a feature, renaming a
  concept, editing prompts, or wiring configuration.
- For style-only edits, avoid behavior changes.
- For feature work, keep the feature implementation direct and avoid expanding
  the task boundary.
- In complex code, first look for structures to delete, inline, move to the use
  site, or rename.

## Review Posture

When reviewing code through this style, look first for:

- meaningless abstractions
- over-functioning and wrapper chains
- misplaced ownership
- vague or stale naming
- unstable state in durable models
- inconsistent order across related structures
- unclear data flow
- mixed content and reference semantics

Prefer review suggestions that delete, inline, move to the use site, unify
names, align order, or clarify ownership. Do not default to adding new
abstractions, configuration layers, wrappers, adapters, or defensive branches.

## Response Style

Keep user-facing explanations focused on the code change.

- State what changed, why it fits the code, and any code-relevant caveat.
- Do not describe the skill workflow, template choice, style analysis process,
  or tool details.
- Do not say "I followed this skill rule" or similar meta commentary.
- Keep simple changes simple in the explanation.

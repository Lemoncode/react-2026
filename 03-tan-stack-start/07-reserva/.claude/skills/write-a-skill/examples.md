# Write-a-Skill Examples

## Example 1: Frontmatter — Good vs Bad

### Good: specific triggers and context

```yaml
---
name: project-setup
description: >-
  Bootstrap TypeScript projects from zero. Interactive workflow: asks mode
  (standalone/monorepo), preset (Frontend SPA, Backend API, Library),
  and optional choices. Generates all files following architecture blueprints.
  Use when user asks to set up a new project, bootstrap a frontend/backend,
  scaffold, or mentions "project setup", "bootstrap", "new project".
---
```

Why it works:

- Lists specific workflows (standalone/monorepo, presets, optional choices)
- Includes exact keywords users would type ("project setup", "bootstrap", "new project")
- Clarifies coordination with architecture blueprints

### Bad: vague and generic

```yaml
---
name: testing
description: Helps with testing code.
---
```

Why it fails:

- No trigger keywords — agent can't distinguish from other testing tools
- No technology scope — could mean anything
- No relationship context

---

## Example 2: Core Principle Section

### Orchestrator skill (feature-flow)

```md
## Core Principle

One issue, one branch, one PR. Implement with small, focused commits
— never go beyond the issue's scope.
```

### Process skill (tdd)

```md
## Philosophy

**Core principle**: Tests verify behavior through public interfaces,
not implementation details. Code can change entirely; tests shouldn't break.
```

### Setup skill (project-setup)

```md
## Core Principle

One command to go from zero to a working project. Ask — never assume
— optional choices. All configs and patterns come from architecture blueprints.
```

Note: the section name varies ("Core Principle", "Philosophy") but the pattern is the same — one memorable idea that drives everything else.

---

## Example 3: Key Conventions as Bullet List

From `project-setup/SKILL.md`:

```md
## Key Rules

- **All static config details live in blueprints** — this skill only defines the workflow
- **Always check latest stable versions** — never use outdated versions from memory
- **Ask, don't assume** — mode, preset, and optional choices must be confirmed with the user
- **No `.ts` extensions in imports** — `moduleResolution: "Bundler"` handles resolution
- **No `resolve.alias` for `#`** — native subpath imports work without plugins
```

Pattern: **`bold term`** — explanation. Scannable, each line is a standalone rule.

---

## Example 4: Comparison Table

From `feature-flow/SKILL.md`:

```md
## Dependencies

| Issue scope                  | Load alongside feature-flow                                              |
| ---------------------------- | ------------------------------------------------------------------------ |
| Monorepo scaffold / tooling  | monorepo-architecture + testing-architecture blueprints                  |
| Backend-only feature         | backend-architecture + testing-architecture blueprints                   |
| Frontend-only feature        | spa-architecture + testing-architecture blueprints                       |
| Full-stack feature           | backend-architecture + spa-architecture + testing-architecture blueprints |
```

Useful when a skill coordinates with blueprints and you need to clarify which ones to load per scenario.

---

## Example 5: Negative Space ("When NOT to")

From `tdd/SKILL.md`:

```md
## When NOT to Apply TDD

Not everything needs red-green-refactor:

- **Validation schemas** (Zod) — declarative, self-validating
- **Configuration** (routes wiring, vitest config) — no logic to test
- **Type definitions / interfaces** — no runtime behavior
- **Constants and enums** — declarative
- **Prototypes / spikes** — ask the user first
```

This prevents over-application. Without it, the agent would try to TDD everything.

---

## Example 6: Anti-Pattern Section

From `tdd/SKILL.md`:

```md
## Anti-Pattern: Horizontal Slices

**DO NOT write all tests first, then all implementation.**

WRONG (horizontal):
RED: test1, test2, test3, test4, test5
GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
RED→GREEN: test1→impl1
RED→GREEN: test2→impl2
```

Pattern: name the anti-pattern, show wrong vs right, explain why.

---

## Example 7: Uncontemplated Scenarios Section

From `triage-issue/SKILL.md`:

```md
## Uncontemplated Scenarios

When a scenario doesn't clearly fit these rules:

1. Apply the closest matching approach with reasoning
2. **Flag it**: "This scenario isn't covered by the triage-issue skill.
   I applied [approach] because [reason]. Want to update the skill?"
3. Offer to add a new rule for the case
```

This is present in all mature skills. It makes the agent transparent about gaps.

---

## Example 8: Cross-References Between Skills and Blueprints

### In SKILL.md body — referencing another skill:

```md
## Mocking Strategy

**`vi.spyOn` as default** — mock at system boundaries only.

For TDD philosophy → see **tdd** skill.
```

### In SKILL.md body — referencing a blueprint:

```md
For Vitest recipes → see **testing-architecture** blueprint.
```

### In SKILL.md closing:

```md
See [reference.md](reference.md) for detailed rules
and [examples.md](examples.md) for concrete scenarios.
```

### In description (frontmatter):

```md
description: >-
Complements the tdd skill (which covers philosophy/workflow).
```

---

## Example 9: Complete SKILL.md Structure (minimal, single-file)

For simple procedural skills that don't need reference/examples files:

```md
---
name: grill-me
description: >-
  Interview the user relentlessly about a plan or design until reaching
  shared understanding. Use when user wants to stress-test a plan,
  get grilled on their design, or mentions "grill me".
---

# Grill Me

## Core Principle

Push the user to think deeply by asking hard questions.
Don't accept surface-level answers.

## Process

1. Read the plan/design provided
2. Ask pointed questions about gaps, risks, and alternatives
3. Don't move on until each question is satisfactorily answered
4. Summarize the refined understanding at the end

## Uncontemplated Scenarios

When a question type doesn't fit the plan domain:

1. Apply the closest questioning technique
2. Flag it and ask if the user wants to adjust the approach
```

---

## Example 10: Complete SKILL.md Structure (with split files)

```md
---
name: feature-flow
description: >-
  Execute a GitHub issue end-to-end — syncs base branch, creates a
  feature branch, implements the task with small focused commits,
  pushes, and opens a PR. Use when implementing a GitHub issue,
  executing a task, or building a feature from an existing issue.
---

# Feature Flow

## Core Principle

[One-liner anchor]

## Dependencies

[Table of blueprints to load per issue scope]

## MANDATORY RULES

[Checklist of non-negotiable rules]

## Workflow

[Numbered steps with substeps]

## Non-Negotiable Rules

[Numbered rules — scope, commits, builds, issue, dependencies]

## Uncontemplated Scenarios

[Edge case protocol]

See [reference.md](reference.md) for detailed steps,
commit conventions, and quality checklist.
```

Note: ~107 lines, coordinates with blueprints, closes with cross-references.

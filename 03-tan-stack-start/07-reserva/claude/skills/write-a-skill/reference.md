# Write-a-Skill Reference

## Anatomy of SKILL.md

### Frontmatter (required)

```yaml
---
name: skill-name # kebab-case, matches folder name
description: >- # max 1024 chars, third person
  What it does in one sentence.
  Use when user asks about X, mentions "Y", or wants to Z.
---
```

The description drives skill selection. Include:

- **Capability**: what the skill enables
- **Trigger keywords**: natural language terms users would say
- **Context clues**: file types, project states, or patterns

### Core Principle Section (required)

Every skill needs an anchor — one idea that drives all decisions. This prevents rules from feeling arbitrary and helps the agent make judgments on edge cases.

| Skill            | Core Principle                                                                   |
| ---------------- | -------------------------------------------------------------------------------- |
| tdd           | "Tests verify behavior through public interfaces, not implementation details"            |
| project-setup | "One command to go from zero to a working project. Ask — never assume — optional choices" |
| triage-issue  | "Investigate first, ask later. Find root cause through codebase exploration"              |

### Domain Sections (flexible)

No fixed template. Use section names that fit naturally:

- **Process skills** (tdd): "Workflow", "Anti-Patterns", "When NOT to Apply"
- **Orchestrator skills** (feature-flow): "Dependencies", "Workflow", "Non-Negotiable Rules"
- **Setup skills** (project-setup): "Blueprints to Load", "Workflow", "Key Rules", "Verification Checklist"

Common useful sections across all types:

- **Key Conventions** — bullet list of rules (present in all completed skills)
- **Comparison tables** — clarify differences ("Key Differences From Frontend", "Test Environments")
- **When NOT to** — explicit exclusions prevent over-application

### Uncontemplated Scenarios Section (required)

```md
When a scenario doesn't clearly fit these rules:

1. Apply the closest matching rule with reasoning
2. **Flag it**: "This scenario isn't covered by the [skill] skill.
   I applied [rule] because [reason]. Want to update the skill?"
3. Offer to add a new rule for the case
```

This prevents the agent from silently improvising. It makes skill gaps visible so they can be filled.

### Closing Cross-References (required if split files exist)

```md
See [reference.md](reference.md) for detailed rules and [examples.md](examples.md) for concrete scenarios.
```

Always the last line. Consistent across all skills.

---

## Anatomy of reference.md

The detailed rulebook. Contains everything that's too verbose for SKILL.md but essential for correct execution.

**Typical contents:**

- Detailed file-by-file rules (what goes in each file, naming conventions)
- Configuration templates (tsconfig, vite, vitest, etc.)
- Dependency direction rules and import conventions
- Anti-patterns with explanations
- Scaling guidelines (when structure changes at different sizes)
- Edge case handling

**Size**: typically 250–1000 lines. No upper limit, but if it exceeds ~1000, consider splitting by subdomain.

**Style**: rules and explanations, not code examples (those go in examples.md).

---

## Anatomy of examples.md

Concrete, copy-pasteable scenarios. The agent uses these as templates when generating code.

**Typical contents:**

- Complete file examples with comments
- Before/after comparisons
- Common scenarios ("adding a new pod", "writing a mapper test")
- Edge cases with solutions

**Size**: typically 400–1000 lines. More examples = better agent output.

**Style**: mostly code blocks with minimal prose. Each example should be self-contained.

---

## Decision: When to Create Each File

```
Is the skill purely procedural (step-by-step process)?
├── Yes, and ≤100 lines → SKILL.md only (e.g., grill-me, triage-issue)
└── No, it has rules + patterns + code
    ├── Rules fit in ≤100 lines → SKILL.md only
    └── Rules exceed 100 lines → Split:
        ├── SKILL.md: principles, conventions summary, workflow
        ├── reference.md: detailed rules, config templates
        └── examples.md: concrete code scenarios
```

---

## Requirements Gathering: Cross-Reference Audit & Decision Inventory

For skills that interact with other skills or involve many configuration choices, the basic scope questions aren't enough. Before drafting:

### Cross-reference audit

1. Identify all skills this skill will coordinate with
2. Read those skills (SKILL.md + reference.md) in full
3. List what's already decided there — don't duplicate, link instead
4. Note any contradictions to resolve with the user

### Decision inventory

1. List **every decision** the skill will encode (libraries, config options, conventions, defaults)
2. For each decision, check if it's already settled:
   - In MEMORY.md (user preferences)?
   - In another skill or blueprint (tdd, project-setup, architecture blueprints, etc.)?
   - In user's stated requirements?
3. Group **unsettled decisions** by theme (e.g., "styling", "linting", "routing")
4. Present each group to the user — explain options, tradeoffs, and your recommendation
5. **Never include a decision in the skill that the user hasn't explicitly confirmed**

### When to do the full audit

- **Always** for skills with reference.md + examples.md (complex, multi-domain)
- **Always** for skills that cross-reference 2+ other skills
- **Skip** for single-file procedural skills (grill-me, triage-issue) that have few opinionated decisions

---

### Good skill characteristics

- **Core principle is memorable** — one sentence you can recall without reading the file
- **Rules are falsifiable** — "always use zValidator" is testable; "write good code" is not
- **Negative space is explicit** — "When NOT to test", "What NOT to include" sections prevent over-application
- **Examples match rules** — every rule in reference.md has at least one example in examples.md
- **Uncontemplated scenarios handled** — agent knows what to do when rules don't cover a case

### Anti-patterns in skills

- **Too generic** — "write clean code" gives no actionable guidance
- **Too rigid** — "always use exactly this structure" breaks on real-world edge cases
- **No core principle** — rules feel arbitrary, agent can't extrapolate to new situations
- **Examples without rules** — agent copies patterns without understanding why
- **Rules without examples** — agent interprets rules differently than intended
- **Time-sensitive content** — specific version numbers, dates, or links that will rot
- **Silent assumptions** — inventing rules without user validation (e.g., choosing a library, adding plugins, hardcoding a CSS framework). Always ask before including opinionated decisions
- **Ignoring existing skills** — duplicating or contradicting decisions already made in related skills. Always cross-reference audit first

---

## Cross-Referencing Strategy

Skills that complement each other should link explicitly:

**In the description:**

```
Complements the tdd skill (which covers philosophy/workflow).
```

**In relevant sections:**

```
For mocking recipes → see **testing-architecture** blueprint.
```

**In examples.md:** you can show how two skills work together:

```
## Using tdd + backend-architecture blueprint together
When building a backend feature with TDD...
```

This prevents duplication and helps the agent load the right skill for the right sub-task.

---

## General Conventions

- **Always latest versions** — all dependency versions in examples must use the latest stable version available at the time of generation
- **No duplication across skills** — if a topic is covered by another skill, link to it instead of repeating
- **User preferences override** — if the user has established preferences (in CLAUDE.md or memory), the skill adapts

---

## Review Checklist

After drafting a skill, verify:

- [ ] Description includes trigger keywords ("Use when...")
- [ ] SKILL.md ≤ 100 lines (soft limit — 100-130 acceptable, 200+ problematic)
- [ ] Has a core principle / philosophy anchor
- [ ] Has "Uncontemplated Scenarios" section
- [ ] Consistent terminology throughout
- [ ] Cross-references to reference.md / examples.md if they exist
- [ ] No time-sensitive info (versions, dates)
- [ ] Cross-references to related skills where relevant
- [ ] Cross-referenced skills audited for overlap — no duplicated or contradicted decisions
- [ ] All opinionated decisions validated with user — no silent assumptions
- [ ] `CLAUDE.md` orchestration table updated if the skill participates in multi-skill tasks
- [ ] `MEMORY.md` completed skills list updated with name + one-line description

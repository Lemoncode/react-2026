---
name: write-a-skill
description: Create new agent skills with proper structure, progressive disclosure, and bundled resources. Use when user wants to create, write, or build a new skill, or mentions "write a skill".
---

# Writing Skills

## Core Principle

Skills are progressive disclosure: load the minimum context needed, defer details to companion files. A skill should be short enough to fit in working memory, precise enough to prevent improvisation.

## Process

1. **Gather requirements**
   a. **Scope** — ask user about:
   - What task/domain does the skill cover?
   - What specific use cases should it handle?
   - Does it need executable scripts or just instructions?
   - Any reference materials to include?
     b. **Cross-reference audit** — read all skills this skill will interact with. Identify overlap, decisions already taken, and topics to link (not duplicate)
     c. **Decision inventory** — list every decision the skill will make. Check which are already decided (MEMORY.md, other skills, user preferences). Present undecided ones to user in batches by theme. **Never assume — always ask**

2. **Draft the skill** — create files following the structure below. Only include validated decisions. Never invent rules without user confirmation

3. **Review with user** — present draft and iterate:
   - Does this cover your use cases?
   - Anything missing or unclear?
   - Should any section be more/less detailed?

4. **Post-creation updates**
   - Update `CLAUDE.md` skill orchestration table if the new skill participates in any multi-skill task
   - Update `MEMORY.md` completed skills list with name + one-line description

## Skill Structure

```
skill-name/
├── SKILL.md           # Main instructions (required, ≤100 lines)
├── reference.md       # Detailed rules and config (if needed)
├── examples.md        # Concrete scenarios with code (if needed)
└── scripts/           # Utility scripts (if needed)
    └── helper.js
```

## SKILL.md Anatomy

Every SKILL.md MUST follow this pattern:

```md
---
name: skill-name
description: What it does. Use when [specific triggers, keywords, contexts].
---

# Skill Title

## Core Principle

[One-liner anchor — what drives all decisions in this skill]

## Dependencies

Skills that MUST be read before writing code when this skill is active:

1. `skill-name` — what you need from it

## MANDATORY RULES (checklist)

Non-negotiable rules. Every item is imperative and verifiable.

- **Rule name** — imperative description

## Key content sections

[Domain-specific sections — adapt to the domain]

## Verification Checklist

Before committing, verify:

- [ ] Check item 1

## Uncontemplated Scenarios

[How to handle cases not covered]
```

**Required sections**: Frontmatter, Core Principle, Dependencies, MANDATORY RULES, Verification Checklist, Uncontemplated Scenarios. Domain sections are flexible.

## Description Requirements

The description is **the only thing the agent sees** when deciding which skill to load. It's surfaced in the system prompt alongside all other installed skills.

- Max 1024 chars, third person
- First sentence: what it does
- Second sentence: "Use when [specific triggers]"
- Include keywords users would say naturally

## When to Split Files

Split into `reference.md` and `examples.md` when:

- SKILL.md exceeds ~100 lines
- Content has distinct domains (rules vs. code examples)
- Advanced features are rarely needed (progressive disclosure)

**Naming convention**: always lowercase (`reference.md`, `examples.md`).

## When to Add Scripts

Add utility scripts when:

- Operation is deterministic (validation, formatting)
- Same code would be generated repeatedly
- Errors need explicit handling

Scripts save tokens and improve reliability vs generated code.

## Uncontemplated Scenarios

When a scenario doesn't clearly fit these rules:

1. Apply the closest matching rule with reasoning
2. **Flag it**: "This scenario isn't covered by the write-a-skill skill. I applied [rule] because [reason]. Want to update the skill?"
3. Offer to add a new rule for the case

See [reference.md](reference.md) for detailed anatomy, quality signals, and review checklist. See [examples.md](examples.md) for real skill excerpts.

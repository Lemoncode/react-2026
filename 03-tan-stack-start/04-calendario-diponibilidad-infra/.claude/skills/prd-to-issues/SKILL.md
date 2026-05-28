---
name: prd-to-issues
description: Convert a plan (from prd-to-plan) into GitHub issues, one per phase. Use when user wants to create GitHub issues from a plan, convert phases to tickets, or mentions "create issues". Last step in the chain grill-me → prd-to-plan → prd-to-issues.
---

# Plan to Issues

## Core Principle

Each plan phase becomes one independently-grabbable GitHub issue. Issues carry enough context to be implemented without re-reading the full plan — but reference the source for traceability.

## Process

### 1. Get the plan in context

Sources (in order of preference):

- **Plan file from prd-to-plan** — `./plans/plan-<feature>.md` (typical flow)
- **Plan pasted in conversation** — user shares directly
- **No plan exists** — redirect: "This needs a plan first. Want to run `/prd-to-plan`?"

### 2. Confirm with the user

Present the phases that will become issues:

| #   | Title       | Type | Blocked by |
| --- | ----------- | ---- | ---------- |
| 1   | Phase title | AFK  | none       |
| 2   | Phase title | HITL | Phase 1    |

Ask: "These phases will become GitHub issues. Any changes before I create them?"

### 3. Create the GitHub issues

For each approved phase, create a GitHub issue using `gh issue create`. See [reference.md](reference.md) for the issue template.

- Create in dependency order (blockers first) so real issue numbers can be referenced
- Apply labels: `AFK` or `HITL` (create the labels if they don't exist)
- Do NOT close or modify any parent PRD issue

### 4. Summary

After creating all issues, present:

- List of created issues with numbers and URLs
- Dependency graph with real issue numbers
- Suggested starting point (first AFK issue with no blockers)

## Uncontemplated Scenarios

When a scenario doesn't clearly fit these rules:

1. Apply the closest matching rule with reasoning
2. **Flag it**: "This scenario isn't covered by the prd-to-issues skill. I applied [rule] because [reason]. Want to update the skill?"
3. Offer to add a new rule for the case

See [reference.md](reference.md) for the issue template and labeling conventions.

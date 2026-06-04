# Plan to Issues — Reference

## Issue Template

Use with `gh issue create`:

```markdown
## Source

Plan: <path to plan file>
Phase: <phase number and title>

## Type

AFK | HITL

## What to build

<Copy from the phase's "What to build" section. Describe end-to-end behavior, not layer-by-layer implementation.>

## Testing approach

<Copy from the phase's "Testing approach" section.>

## Acceptance criteria

- [ ] <Copy from the phase's acceptance criteria>
- [ ] <...>

## Blocked by

- #<issue-number> <title> (if any)

Or "None — can start immediately" if no blockers.

## User stories addressed

<Copy from the phase's "User stories" field, reference by number from the PRD.>
```

---

## Labeling Conventions

Apply these labels to each issue:

| Label     | When                                            |
| --------- | ----------------------------------------------- |
| `AFK`     | Phase can be implemented without human input    |
| `HITL`    | Phase requires human decision or review         |
| `blocked` | Phase has unresolved dependencies               |
| `ready`   | Phase has no blockers and can start immediately |

Create labels if they don't exist in the repo:

```bash
gh label create AFK --description "Can be implemented without human input" --color 0E8A16
gh label create HITL --description "Requires human decision or review" --color D93F0B
gh label create blocked --description "Has unresolved dependencies" --color B60205
gh label create ready --description "No blockers, can start immediately" --color 0E8A16
```

---

## Creation Order

1. Create issues in **dependency order** — blockers first
2. This ensures real issue numbers are available for "Blocked by" references
3. After all issues are created, update any cross-references if needed

---

## Summary Template

After creating all issues, present to the user:

```markdown
## Issues created

| #   | Issue | Title       | Type | Blocked by |
| --- | ----- | ----------- | ---- | ---------- |
| 1   | #123  | Phase title | AFK  | none       |
| 2   | #124  | Phase title | HITL | #123       |

## Dependency graph

#123 ──→ #125 ──→ #127
#124 ──→ #126 ──╯

## Suggested starting point

#123 — <title> (AFK, no blockers)
```

---

## Cross-References

```
grill-me → PRD → prd-to-plan → Plan → prd-to-issues → GitHub Issues
```

| Scenario                                    | Action                                            |
| ------------------------------------------- | ------------------------------------------------- |
| No plan exists                              | Redirect to `prd-to-plan`                         |
| Plan has phases without acceptance criteria | Flag to user before creating issues               |
| HITL issue needs design decision            | Mention in the issue body what decision is needed |
| AFK issue is ready to implement             | Reference `tdd` skill for test-first approach     |

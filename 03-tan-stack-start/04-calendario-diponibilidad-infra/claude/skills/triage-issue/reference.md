# Triage Issue — Reference

## Issue Template

Use with `gh issue create`:

```markdown
## Problem

A clear description of the bug or issue, including:

- What happens (actual behavior)
- What should happen (expected behavior)
- How to reproduce (if applicable)

## Root Cause Analysis

Describe what was found during investigation:

- The code path involved
- Why the current code fails
- Any contributing factors

Do NOT include specific file paths, line numbers, or implementation details that couple to current code layout. Describe modules, behaviors, and contracts instead. The issue should remain useful even after major refactors.

## TDD Fix Plan

A numbered list of RED-GREEN cycles:

1. **RED**: Write a test that [describes expected behavior]
   **GREEN**: [Minimal change to make it pass]

2. **RED**: Write a test that [describes next behavior]
   **GREEN**: [Minimal change to make it pass]

**REFACTOR**: [Any cleanup needed after all tests pass]

## Acceptance Criteria

- [ ] Root cause is fixed
- [ ] All new tests pass
- [ ] Existing tests still pass
- [ ] No regressions in related functionality
```

---

## TDD Fix Plan Rules

- Tests verify behavior through public interfaces, not implementation details
- One test at a time, vertical slices (NOT all tests first, then all code)
- Each test should survive internal refactors
- Include a final refactor step if needed
- **Durability**: only suggest fixes that would survive radical codebase changes. Describe behaviors and contracts, not internal structure. Tests assert on observable outcomes (API responses, UI state, user-visible effects), not internal state. A good fix plan reads like a spec; a bad one reads like a diff

---

## Classification

When presenting findings, classify the issue:

| Type            | Description                                     |
| --------------- | ----------------------------------------------- |
| Regression      | Previously working behavior that broke          |
| Missing feature | Expected behavior that was never implemented    |
| Design flaw     | Behavior works as coded but the design is wrong |
| Edge case       | Uncommon input/state that isn't handled         |

This helps prioritize and understand the impact.

---

## Cross-References

| Scenario                                        | Skill                   |
| ----------------------------------------------- | ----------------------- |
| TDD fix plan needs philosophy guidance          | `tdd`                   |
| Fix plan needs Vitest recipes                   | `testing-architecture` blueprint |
| Triage reveals a larger feature need            | `grill-me` → PRD → plan |
| Fix is straightforward, needs backend structure | `backend-architecture` blueprint |

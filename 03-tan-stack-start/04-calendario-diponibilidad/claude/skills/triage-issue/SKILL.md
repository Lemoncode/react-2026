---
name: triage-issue
description: Triage a bug or issue by exploring the codebase to find root cause, then create a GitHub issue with a TDD-based fix plan. Use when user reports a bug, wants to file an issue, mentions "triage", or wants to investigate and plan a fix for a problem.
---

# Triage Issue

## Core Principle

Investigate first, ask later. Find the root cause through codebase exploration before asking the user anything. Minimize questions, maximize diagnosis.

## Process

### 1. Capture the problem

Get a brief description from the user. If they haven't provided one, ask ONE question: "What's the problem you're seeing?"

Do NOT ask follow-up questions. Start investigating immediately.

### 2. Explore and diagnose

Deeply investigate the codebase to find:

- **Where** the bug manifests (entry points, UI, API responses)
- **What** code path is involved (trace the flow)
- **Why** it fails (the root cause, not just the symptom)
- **What** related code exists (similar patterns, tests, adjacent modules)

Look at:

- Related source files and their dependencies
- Existing tests (what's tested, what's missing)
- Recent changes to affected files (`git log`)
- Error handling in the code path
- Similar patterns elsewhere that work correctly

### 3. Identify the fix approach

Determine:

- The minimal change needed to fix the root cause
- Which modules/interfaces are affected
- What behaviors need to be verified via tests
- Whether this is a regression, missing feature, or design flaw

### 4. Design TDD fix plan

Create an ordered list of RED-GREEN cycles (vertical slices):

- **RED**: a specific test that captures the broken/missing behavior
- **GREEN**: the minimal code change to make that test pass

Rules:

- Tests verify behavior through public interfaces, not implementation details
- One test at a time (NOT all tests first, then all code)
- **Durability**: describe behaviors and contracts, not internal structure. A good fix plan reads like a spec, a bad one reads like a diff

For TDD philosophy → see **tdd** skill. For Vitest recipes → see **testing-architecture** blueprint.

### 5. Confirm with the user

Present the issue draft: problem summary, root cause analysis, and TDD fix plan. Ask: "Does this look right? Should I create the issue?"

### 6. Create the GitHub issue

After confirmation, create with `gh issue create`. See [reference.md](reference.md) for the issue template.

Print the issue URL and a one-line summary of the root cause.

## Uncontemplated Scenarios

When a scenario doesn't clearly fit these rules:

1. Apply the closest matching approach with reasoning
2. **Flag it**: "This scenario isn't covered by the triage-issue skill. I applied [approach] because [reason]. Want to update the skill?"
3. Offer to add a new rule for the case

See [reference.md](reference.md) for the issue template.

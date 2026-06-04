---
name: pr-review
description: >-
  Orchestrate a comprehensive PR code review by launching parallel
  expert agents (security, architecture, duplication, testing,
  performance, readability). Produces a structured markdown report
  with severity-ranked findings and posts it as a PR comment.
  Use when reviewing a PR, code review, or checking code quality.
---

# PR Review Skill

## Core Principle

Seven expert lenses, one structured report. Run specialized agents in parallel for thorough, fast reviews — never rely on a single perspective.

## Workflow

### 0. Resolve the PR diff

- **PR number** (`#505`, `505`): use `gh pr diff` + `gh pr view`
- **Branch range** (`main...feature`): use `git diff`
- **No argument**: check for open PR on current branch, fall back to diff against base branch

If the diff is empty, inform the user and stop.

### 1. Gather project context

Read `CLAUDE.md` and `package.json`. Build a `PROJECT_CONTEXT` summary (≤80 lines) covering: tech stack, architectural patterns, code style, testing conventions, security rules.

### 2. Launch 7 expert agents in parallel

Read all agent prompts from [agents/](agents/) and launch **all simultaneously** in a single message. Each receives: its prompt, the full diff, the project context, and the changed files list.

| Agent         | Focus                                        |
| ------------- | -------------------------------------------- |
| Security      | Vulnerabilities, auth, secrets, injection    |
| Architecture  | Layer boundaries, patterns, coupling         |
| Duplication   | Copy-paste, missed reuse, parallel impls     |
| Testing       | Coverage gaps, missing edge cases, quality   |
| Performance   | N+1 queries, memory, complexity, scalability |
| Readability   | Naming, complexity, clarity, conventions     |
| Accessibility | WCAG compliance, semantics, keyboard, focus  |

If diff >15K chars, split by file and send each agent only relevant files.

### 3. Synthesize and classify findings

Severity levels:

- **🔴 Critical** — must fix before merge (security, data loss, broken builds)
- **🟠 Important** — should fix (arch violations, missing tests, regressions)
- **🟡 Suggestion** — nice to have (naming, minor refactors, readability)

Verdict:

- **🟢 Approved** — suggestions only
- **🟡 Approved with comments** — important findings, no critical
- **🔴 Changes required** — critical findings present

### 4. Output the report

Print the full report to console. If a PR number is available, post it as a PR comment using `gh pr comment --body-file`.

## Error Handling

- If `gh` CLI unavailable, fall back to `git diff`
- If an agent fails, note "⚠️ This analysis could not be completed" and continue
- If >100 changed files, ask user to narrow scope

## Uncontemplated Scenarios

When a scenario doesn't clearly fit these rules:

1. Apply the closest matching rule with reasoning
2. **Flag it**: "This scenario isn't covered by pr-review. I applied [rule] because [reason]. Want to update the skill?"
3. Offer to add a new rule

See [reference.md](reference.md) for the report template and [agents/](agents/) for each agent's detailed prompt.

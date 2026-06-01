---
name: feature-flow
description: >-
  Execute a GitHub issue end-to-end — syncs base branch, creates a
  feature branch, implements the task with small focused commits,
  pushes, and opens a PR. Use when implementing a GitHub issue,
  executing a task, or building a feature from an existing issue.
---

# Feature Flow Skill

## Core Principle

One issue, one branch, one PR. Implement with small, focused commits — never go beyond the issue's scope.

## Dependencies

This skill is an **orchestrator** — it does NOT contain architecture, testing, or tooling rules. You MUST load the relevant architecture blueprints (`.claude/blueprints/`) based on the issue scope.

| Issue scope                 | Load alongside feature-flow                                               |
| --------------------------- | ------------------------------------------------------------------------- |
| Monorepo scaffold / tooling | monorepo-architecture + testing-architecture blueprints                   |
| Backend-only feature        | backend-architecture + testing-architecture blueprints                    |
| Frontend-only feature       | spa-architecture + testing-architecture blueprints                        |
| Full-stack feature          | backend-architecture + spa-architecture + testing-architecture blueprints |
| Backend infra (DB, logging) | backend-architecture + testing-architecture blueprints                    |

## MANDATORY RULES (checklist)

- **Load ALL blueprints before coding** — read every blueprint listed in the dependency table for your issue scope. Log which blueprints you loaded
- **Read MANDATORY RULES from each loaded blueprint** — extract and follow every checklist item from every loaded blueprint
- **Preflight log** — before writing any code, output: "Loaded blueprints: [list]. MANDATORY RULES collected: [count]. Proceeding."
- **Minimum scope** — don't add anything outside the issue
- **Small commits** — one logical step = one commit ideally
- **No broken builds** — build + tests must pass before the PR
- **Issue is source of truth** — the issue drives implementation
- **No unjustified dependencies** — justify any new dependency in the PR
- **Always use latest stable versions** — check latest package versions before adding dependencies

## Input

The argument is a GitHub issue number or URL. If empty, ask the user which issue to work on.

## Workflow

### 0. Resolve the GitHub issue

Fetch the issue with `gh issue view <NUMBER> --json number,title,body,labels`. Extract:

- `ISSUE_NUMBER`, `ISSUE_TITLE`, `ISSUE_BODY`
- Determine `TASK_TYPE` from labels or title (feature, bugfix, chore, refactor, docs). If ambiguous, ask the user.
- Derive `SLUG` from the title (lowercase, hyphens, ≤50 chars).

### 1. Load repository context

Read `CLAUDE.md`, `CONTRIBUTING.md`, `README.md` (if they exist). Extract build, test, lint commands, branch conventions, and PR format.

### 2. Create feature branch

```bash
git checkout <BASE_BRANCH>
git pull origin <BASE_BRANCH>
git checkout -b <TASK_TYPE>/#<ISSUE_NUMBER>-<SLUG>
git push -u origin <BRANCH_NAME>
```

`BASE_BRANCH` defaults to `develop` (or `main` per project conventions).

### 3. Implement

Read the issue body to understand scope and requirements. If the issue references a plan file, read it.

For each logical step: **read** affected files → **implement** → **verify** (build + test) → **commit**.

- Stage only files relevant to the step
- Commit format: `#<ISSUE_NUMBER>: <brief description>`
- One commit per logical step (ideal). All commits must reference the issue number.
- Stay within scope — no features, refactors, or improvements outside the issue.

### 4. Push and open PR

Push all commits, then `gh pr create` targeting `BASE_BRANCH`:

- **Title**: `#<ISSUE_NUMBER>: <ISSUE_TITLE>`
- **Body**: scope, acceptance criteria, how to test, notes. End with `Closes #<ISSUE_NUMBER>`.

### 5. Report results

Summarize: issue URL, branch name, number of commits, PR URL, open follow-ups.

## Non-Negotiable Rules

1. **Minimum scope** — don't add anything outside the issue
2. **Small commits** — one logical step = one commit ideally
3. **No broken builds** — build + tests must pass before the PR
4. **Issue is source of truth** — the issue drives implementation
5. **No unjustified dependencies** — justify any new dependency in the PR

## Uncontemplated Scenarios

When a scenario doesn't clearly fit these rules:

1. Apply the closest matching rule with reasoning
2. **Flag it**: "This scenario isn't covered by feature-flow. I applied [rule] because [reason]. Want to update the skill?"
3. Offer to add a new rule

See [reference.md](reference.md) for detailed steps, commit conventions, and quality checklist.

# Feature Flow — Reference

## Epic Mode

When the `--epic` flag is passed:

1. Fetch remote branches: `git branch -r --list 'origin/epic*'`
2. Ask user which epic branch to use as base
3. Use selected branch as `BASE_BRANCH` instead of default

## PR Body Template

```markdown
## Scope

- <Bullet points summarizing implemented changes>
- <Relevant decisions made>

## Acceptance Criteria

- [ ] <Verifiable criterion 1>
- [ ] <Verifiable criterion 2>
- [ ] Build passes
- [ ] Tests pass
- [ ] No lint/format violations

## How to Test

- <Concrete testing steps>
- <Commands executed>

## Notes

- <Risks, intentional tech debt, follow-ups>
- <Any deferred items>

Closes #<ISSUE_NUMBER>
```

## Commit Convention

Format: `#<ISSUE_NUMBER>: <type>: <description>`

Types:
- `feat:` — new features
- `fix:` — bug fixes
- `chore:` — technical tasks
- `test:` — test additions/changes
- `docs:` — documentation changes

Examples:
- `#42: feat: add writeToken field to project database model`
- `#42: fix: handle null values in user mapper`
- `#42: test: add edge case tests for token validation`

## Quality Checklist (before opening PR)

- [ ] No secrets committed
- [ ] No dead code introduced
- [ ] Correct types used (no unnecessary `any`)
- [ ] Build passes
- [ ] Tests pass
- [ ] PR description clearly describes the change
- [ ] All commits reference the issue number

## Dependency Management

When adding a new dependency:
- Justify why it is strictly necessary
- Mention impact on bundle/build size
- Include the discarded alternative
- Document in the PR description under "Notes"

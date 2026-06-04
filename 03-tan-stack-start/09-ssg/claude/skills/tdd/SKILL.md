---
name: tdd
description: Test-driven development with red-green-refactor loop. Use when user wants to build features or fix bugs using TDD, mentions "red-green-refactor", wants integration tests, or asks for test-first development.
---

# Test-Driven Development

## Core Principle

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't break. A good test reads like a specification — "user can checkout with valid cart" tells you exactly what capability exists.

## Workflow

### 1. Planning

Before writing any code:

- Confirm with user what interface changes are needed
- Confirm with user which behaviors to test (prioritize — you can't test everything)
- List the behaviors to test (not implementation steps)
- Get user approval on the plan

Ask: "What should the public interface look like? Which behaviors are most important to test?"

### 2. Tracer Bullet

Write ONE test that confirms ONE thing about the system:

```
RED:   Write test for first behavior → test fails
GREEN: Write minimal code to pass → test passes
```

This is your tracer bullet — proves the path works end-to-end.

### 3. Incremental Loop

For each remaining behavior:

```
RED:   Write next test → fails
GREEN: Minimal code to pass → passes
```

Rules:

- One test at a time
- Only enough code to pass current test
- Don't anticipate future tests
- Keep tests focused on observable behavior

### 4. Refactor

After all tests pass, look for refactor candidates (see [reference.md](reference.md#refactoring-candidates)):

- Never refactor while RED — get to GREEN first
- Run tests after each refactor step

## Anti-Pattern: Horizontal Slices

**DO NOT write all tests first, then all implementation.** This is the biggest TDD mistake.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
```

Tests written in bulk test _imagined_ behavior. You outrun your headlights, committing to test structure before understanding the implementation. Each vertical cycle informs the next — because you just wrote the code, you know exactly what behavior matters.

## When NOT to Apply TDD

Not everything needs red-green-refactor:

- **Validation schemas** (Zod) — declarative, self-validating
- **Configuration** (routes wiring, vitest config) — no logic to test
- **Type definitions / interfaces** — no runtime behavior
- **Re-exports / barrel files** — just wiring
- **Constants and enums** — declarative
- **Middleware wiring** (`app.use()` chains) — the middleware logic is tested, the wiring isn't
- **Pass-through wrappers** — re-exporting a library without added logic
- **Database migrations** — DDL scripts, validated by execution
- **Static content** — i18n strings, templates, fixed content
- **Logger / env config setup** — pure configuration
- **Prototypes / spikes** — ask the user: "Do you want tests for this spike? They could be reused later."

**Always test**: mappers (even small ones), services with business logic, repositories (integration), routes (API behavior), components (user interaction).

## Mocking Strategy

**`vi.spyOn` as default** — mock at system boundaries only (external APIs, databases, time/randomness). Don't mock your own modules' internals. DI only when it genuinely adds value.

For mocking recipes → see **testing-architecture** blueprint. For detailed rules → see [reference.md](reference.md).

## Uncontemplated Scenarios

When a scenario doesn't clearly fit these rules:

1. Apply the closest matching rule with reasoning
2. **Flag it**: "This scenario isn't covered by the tdd skill. I applied [rule] because [reason]. Want to update the skill?"
3. Offer to add a new rule for the case

See [reference.md](reference.md) for good/bad test examples, mocking details, refactoring candidates, and test environments. See [examples.md](examples.md) for concrete scenarios.

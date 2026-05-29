# PRD to Plan — Reference

## Plan Template

Save to `./plans/plan-<feature>.md`:

```markdown
# Plan: <Feature Name>

> Source PRD: <path to PRD file or brief identifier>
> Date: YYYY-MM-DD

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: ...
- **Schema**: ...
- **Key models**: ...
- **Auth**: ...
- (add/remove sections as appropriate)

## Carried from PRD

### Assumptions

- <assumption from PRD>

### Out of scope

- <exclusion from PRD>

### Risks

- <risk from PRD>

---

## Phase 1: <Title>

**Type**: AFK | HITL
**User stories**: <list from PRD>
**Depends on**: none | Phase N

### What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

### Testing approach

What to test in this phase and how (unit, integration, e2e).

### Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## Phase 2: <Title>

**Type**: AFK | HITL
**User stories**: <list from PRD>
**Depends on**: Phase 1

### What to build

...

### Testing approach

...

### Acceptance criteria

- [ ] ...

<!-- Repeat for each phase -->

---

## Dependency graph

<!-- Visual summary of phase dependencies -->

Phase 1 ──→ Phase 3 ──→ Phase 5
Phase 2 ──→ Phase 4 ──╯
```

---

## AFK vs HITL Phases

Every phase must be tagged as one of:

- **AFK** (Away From Keyboard) — can be implemented and merged without human interaction. The requirements are clear, no decisions pending. Prefer AFK phases where possible
- **HITL** (Human In The Loop) — requires human input before or during implementation. Examples: architectural decision, UX review, third-party service selection, design approval

### How to decide

| Signal | Tag |
| --- | --- |
| All requirements are in the PRD and acceptance criteria | AFK |
| Needs a decision between alternatives not yet resolved | HITL |
| Requires design mockup or UX validation | HITL |
| Purely mechanical implementation (CRUD, wiring, config) | AFK |
| Depends on external team or service not yet available | HITL |
| Has clear testing approach and demoable output | AFK |

### Why it matters

- AFK phases can be delegated to agents or picked up independently
- HITL phases should be scheduled when the right person is available
- Knowing the ratio (mostly AFK vs mostly HITL) tells you how parallelizable the plan is

---

## Vertical Slice Rules

### What makes a good slice

- **End-to-end**: touches every integration layer (schema, API, UI, tests)
- **Demoable**: can be shown to someone or verified independently
- **Thin**: narrowest possible path that still delivers value
- **Independent**: minimal dependencies on other unfinished slices

### What makes a bad slice

- **Horizontal**: "Phase 1: all database models, Phase 2: all API routes, Phase 3: all UI" — this is layer-by-layer, not vertical
- **Too thick**: "Phase 1: entire user management" — too much to verify at once
- **No tests**: if a slice doesn't include how to verify it, it's incomplete
- **Implementation details**: specific file names, function signatures, or code snippets that will change as later phases are built

### Sizing heuristic

- A good phase should take roughly 1-3 focused sessions to implement
- If a phase description exceeds ~10 lines, it's probably too thick — split it
- If you have fewer than 3 phases, the slices are probably too thick
- If you have more than 10 phases, consider grouping related ones

---

## Handling PRD Sections

How each PRD section maps to the plan:

| PRD section              | Plan location                                                 |
| ------------------------ | ------------------------------------------------------------- |
| Problem Statement        | Context in plan header                                        |
| User Stories             | Distributed across phases ("User stories" field)              |
| Product / UX Decisions   | Architectural decisions (if durable) or phase description     |
| Technical Decisions      | Architectural decisions                                       |
| Testing Decisions        | "Testing approach" per phase                                  |
| Out of Scope             | "Carried from PRD" section                                    |
| Discarded Alternatives   | Not carried (already decided)                                 |
| Assumptions              | "Carried from PRD" section                                    |
| Risks                    | "Carried from PRD" section                                    |
| Open Points              | Flag to user — resolve before planning or acknowledge as risk |

---

## Cross-References

```
grill-me → PRD → prd-to-plan → Plan → prd-to-issues → GitHub Issues
```

| Scenario                     | Action                                   |
| ---------------------------- | ---------------------------------------- |
| PRD has "in progress" status | Warn user, offer to continue grill first |
| PRD has open points          | Flag them — resolve or accept as risk    |
| Plan completed               | Offer to run `prd-to-issues`             |
| Phase needs TDD approach     | Reference `tdd` skill                    |
| Phase needs test recipes     | Reference `testing-architecture` blueprint |

---
name: prd-to-plan
description: Turn a PRD into a multi-phase implementation plan using tracer-bullet vertical slices, saved as a local Markdown file in ./plans/. Use when user wants to break down a PRD, create an implementation plan, plan phases from a PRD, or mentions "tracer bullets". Part of the chain grill-me → prd-to-plan → prd-to-issues.
---

# PRD to Plan

## Core Principle

Every phase must be a **thin vertical slice** (tracer bullet) that cuts through ALL integration layers end-to-end. Never a horizontal slice of one layer. A completed phase is demoable or verifiable on its own.

## Process

### 1. Get the PRD in context

Sources (in order of preference):

- **PRD file from grill-me** — `./plans/prd-<topic>-<date>.md` (typical flow)
- **PRD pasted in conversation** — user shares directly
- **Loose idea** — redirect: "This needs a PRD first. Want to run a `/grill-me` to build it?"

If the PRD exists but has status "in progress", warn: "This PRD has open points. Want to continue the grill first or plan with what we have?"

### 2. Explore the codebase

Understand integration layers that each slice must cut through:

- Existing routes, API patterns, middleware
- Database schema / models
- Frontend pages, components, state management
- Test infrastructure and patterns
- Build / deploy pipeline

### 3. Identify durable architectural decisions

Before slicing, extract decisions unlikely to change throughout implementation:

- Route structures / URL patterns
- Database schema shape
- Key data models
- Auth approach
- Third-party service boundaries

Carry over from PRD: technical decisions, assumptions, out of scope.

### 4. Draft vertical slices

Break the PRD into tracer bullet phases:

- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- Prefer many thin slices over few thick ones
- Include **dependencies between phases** — which phases can be parallelized
- Do NOT include specific file names or implementation details likely to change
- DO include durable decisions: route paths, schema shapes, data model names
- Include testing approach per phase (from PRD's "Testing Decisions")
- Tag each phase as **AFK** or **HITL** (see [reference.md](reference.md))

### 5. Quiz the user

Present the proposed breakdown. For each phase show:

- **Title**: short descriptive name
- **Type**: AFK or HITL
- **User stories covered**: from the PRD
- **Depends on**: which prior phases (if any)

Ask:

- Does the granularity feel right? (too coarse / too fine)
- Should any phases be merged or split further?
- Are the AFK/HITL tags correct?

Iterate until the user approves.

### 6. Write the plan file

Create `./plans/` if it doesn't exist. Save as `./plans/plan-<feature>.md`. See [reference.md](reference.md) for template.

### 7. Next step

Offer: "Plan ready. Want to run `prd-to-issues` to create GitHub issues for each phase?"

## Uncontemplated Scenarios

When a scenario doesn't clearly fit these rules:

1. Apply the closest matching rule with reasoning
2. **Flag it**: "This scenario isn't covered by the prd-to-plan skill. I applied [rule] because [reason]. Want to update the skill?"
3. Offer to add a new rule for the case

See [reference.md](reference.md) for the plan template and vertical slice rules.

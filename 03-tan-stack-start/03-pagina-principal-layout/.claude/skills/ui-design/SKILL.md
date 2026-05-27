---
name: ui-design
description: >-
  Design frontend screens and set up design systems using Pencil, with token sync, component libraries,
  and UX validation. Use when user wants to design screens, create a design system, set up design tokens,
  create UI mockups, or mentions "ui design", "design system", "screens", "mockups", "Pencil", or "design tokens".
  Optional step between grill-me (PRD) and prd-to-plan in the chain grill-me -> ui-design -> prd-to-plan -> prd-to-issues.
  For component code structure -> see spa-architecture blueprint. For project tooling setup -> see project-setup.
---

# UI Design

## Core Principle

Design is validation before code. Every screen must be visually approved by the user before implementation begins. Pencil lives in the IDE so designs stay in sync with the codebase.

**Every element uses variables — no exceptions.** All colors, spacing, radii, typography, and visual properties in `.pen` files must reference Pencil variables (synced from `tokens.css`). Never hardcode raw values like `#6366f1` or `16` directly on nodes — always use `$variable-name`.

## Mode Detection

Detect automatically based on project state:

- **Setup** -- no `designs/` folder exists -> initialize design system (tokens + library)
- **Screen design** -- design system exists -> design new screens using existing tokens and components
- **Evolution** -- mid-project, new tokens or components needed -> extend the system incrementally

## Workflow

### 1. Design System Setup (once per project)

a. **Explore the codebase** -- detect CSS framework (Tailwind, CSS Modules), existing theme/tokens, UI dependencies
b. **Propose token values** -- based on Tailwind defaults as baseline, organized by group (see [reference.md](reference.md))
c. **User validates tokens** -- present the proposal, iterate until approved
d. **Create files**:
   - `designs/tokens.css` -- CSS custom properties (single source of truth)
   - `designs/ui-kit.lib.pen` -- base component library in Pencil
   - Configure Tailwind/CSS Modules to consume `tokens.css` (see [reference.md](reference.md))
e. **Sync tokens to Pencil** -- read `designs/tokens.css` and create matching Pencil variables using `set_variables`. The CSS file is the source of truth; Pencil variables mirror it. When tokens change, re-sync from the CSS file.
f. **Create sitemap** -- create `designs/sitemap.md` with the initial navigation structure (see Sitemap section below)

### 2. Screen Design (per feature/screen)

a. **Get context** -- PRD, user stories, or feature description
b. **Creative direction** -- before designing, commit to a clear aesthetic direction for the screen (see Design Thinking section below). Consider tone, spatial composition, and what makes it distinctive.
c. **Get style guide** -- use `get_style_guide_tags` then `get_style_guide` to get visual inspiration that matches the aesthetic direction
d. **Create `designs/<screen-name>.pen`** -- design using the project's tokens (as `$variables`) and `ui-kit.lib.pen` components
e. **Verify variable binding** -- after creating elements, check that ALL visual properties use `$variable-name` references, never raw values. Audit fills, strokes, fonts, radii, spacing, shadows.
f. **Review against UX checklist** -- verify all items in the UX checklist (see [reference.md](reference.md))
g. **Update sitemap** -- add the new screen to `designs/sitemap.md` with its route, connections, and states
h. **Present to user** -- show the design for validation
i. **Iterate** -- user requests changes -> update the design -> re-validate
j. **Approve** -- user confirms the design is ready

### 3. Extending the Design System

When a new screen needs a token or component that doesn't exist:

1. **Add the token** to `designs/tokens.css` first (source of truth)
2. **Re-sync to Pencil** using `set_variables` (read from `tokens.css`, merge into Pencil variables)
3. **Add the component** to `designs/ui-kit.lib.pen` using the new `$variables`
4. Never create components "just in case" -- only when a real screen needs them

## Token Sync: tokens.css -> Pencil

The sync is **one-directional**: `tokens.css` (CSS) -> `.pen` files (Pencil variables).

**Sync procedure:**
1. Read `designs/tokens.css` to extract all `--custom-property: value` pairs
2. Map each CSS custom property to a Pencil variable name (strip `--` prefix, keep the rest)
3. Call `set_variables` with `replace: true` to update all Pencil variables at once
4. All `.pen` elements referencing `$variable-name` automatically update

**When to sync:**
- After creating or modifying `tokens.css`
- Before designing a new screen (ensure variables are up to date)
- When the user changes a token value

## Variable Binding Rules

**Mandatory** — every visual property on every node must use a `$variable` reference:

| Property | Must use variable | Example |
|----------|------------------|---------|
| `fill` (backgrounds, text color) | Yes | `"$color-surface"`, `"$color-text"` |
| `stroke.fill` | Yes | `"$color-border"` |
| `cornerRadius` | Yes | `"$radius-xl"` |
| `gap`, `padding` | Yes | `"$spacing-md"` |
| `fontFamily` | Yes | `"$font-sans"` |
| `fontSize` | Yes | `"$text-base"` |
| `fontWeight` | Yes | `"$font-weight-semibold"` |
| `effect` (shadows) | Yes | `"$shadow-md"` |
| `width`, `height` | Only when static | Use layout (`fill_container`, `fit_content`) when possible |
| `x`, `y` (position) | No | Layout-driven, not token-driven |

**Audit after every batch_design call**: scan the created nodes for any raw hex colors, raw numbers for radius/gap/padding, or raw font names. Fix immediately.

## Design Thinking

Before designing any screen, commit to a clear aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Choose a direction — minimal and airy, data-dense and editorial, warm and approachable, bold and geometric, etc.
- **Differentiation**: What makes this screen memorable? What's the one visual choice that gives it character?
- **Composition**: Consider spatial layout — asymmetry, generous negative space, grid rhythm, visual hierarchy

Design with intentionality. Avoid generic patterns: predictable card grids, cookie-cutter layouts, and safe color choices. Each screen should feel designed for its specific context, not assembled from a template.

**Typography matters**: Choose fonts that serve the design's personality. Pair display and body fonts deliberately. Use size contrast and weight variation to create hierarchy.

**Visual depth**: Create atmosphere through subtle gradients, purposeful shadow elevation, border accents, icon integration, and background treatments that match the aesthetic.

## Sitemap

Maintain `designs/sitemap.md` as a living map of the application's navigation and screen structure.

**Create** during setup. **Update** every time a new screen is designed.

```markdown
# Sitemap — [App Name]

## Navigation Flow

[Route] Screen Name (states: data, loading, empty, error)
  └── [Sub-route] Child Screen
       └── [Action] Modal / Dialog

## Screen Inventory

| Screen | Route | .pen File | Status |
|--------|-------|-----------|--------|
| Name   | /path | designs/name.pen | designed / approved / implemented |

## Connections

Screen A --[action]--> Screen B
Screen B --[back]--> Screen A
```

## File Structure

```
designs/
  tokens.css              <- CSS custom properties (source of truth)
  sitemap.md              <- navigation structure and screen inventory
  ui-kit.lib.pen          <- shared component library
  <screen-name>.pen       <- one file per screen
```

Monorepo: `apps/<app>/designs/`. The `.pen` files live alongside `src/` so Pencil's AI can access both.

## Integration with Skill Chain

```
grill-me -> PRD -> [ui-design] -> prd-to-plan -> prd-to-issues
                    ^ optional
```

After PRD: offer "Want to design the screens before planning? Run `/ui-design`."
After designs approved: offer "Designs validated. Want to run `/prd-to-plan`?"

Design is optional -- the chain works without it. But when present, `prd-to-plan` can reference `.pen` files in phase descriptions.

## Key Conventions

- **tokens.css is the single source of truth** -- Pencil variables mirror it, Tailwind/CSS Modules consume it
- **Every element uses $variables** -- no raw values in `.pen` files for visual properties
- **Creative direction before design** -- commit to an aesthetic, don't default to generic
- **Pencil for visual design** -- `.pen` files versioned in Git, `.lib.pen` for shared components
- **Component catalog as reference** -- add components under demand, not upfront (see [reference.md](reference.md))
- **User validates every screen** -- no screen goes to implementation without explicit approval
- **UX checklist mandatory** -- review every screen against the checklist before presenting
- **Sitemap always updated** -- every new screen gets added to `designs/sitemap.md`

## Uncontemplated Scenarios

When a scenario doesn't clearly fit these rules:

1. Apply the closest matching rule with reasoning
2. **Flag it**: "This scenario isn't covered by the ui-design skill. I applied [rule] because [reason]. Want to update the skill?"
3. Offer to add a new rule for the case

See [reference.md](reference.md) for token groups, UX checklist, component catalog, creative design guidelines, and Tailwind/CSS Modules config. See [examples.md](examples.md) for concrete setup and design scenarios.

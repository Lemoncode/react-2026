# UI Design — Reference

## Token Architecture

### Source of Truth: CSS Custom Properties

All design tokens live in `designs/tokens.css` as CSS custom properties. This file is the **single source of truth**. The sync is one-directional: `tokens.css` -> Pencil variables. Tailwind/CSS Modules also consume `tokens.css`.

**Sync procedure**: Read `tokens.css`, extract `--property: value` pairs, call `set_variables` with `replace: true` to mirror them in Pencil. All `.pen` elements must reference `$variable-name`, never raw values.

```css
/* designs/tokens.css */
:root {
  /* --- Colors --- */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-primary-active: #1d4ed8;
  --color-secondary: #64748b;
  --color-accent: #f59e0b;

  --color-neutral-50: #f8fafc;
  --color-neutral-100: #f1f5f9;
  --color-neutral-200: #e2e8f0;
  --color-neutral-300: #cbd5e1;
  --color-neutral-400: #94a3b8;
  --color-neutral-500: #64748b;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1e293b;
  --color-neutral-900: #0f172a;
  --color-neutral-950: #020617;

  --color-error: #ef4444;
  --color-warning: #f59e0b;
  --color-success: #22c55e;
  --color-info: #3b82f6;

  --color-background: var(--color-neutral-50);
  --color-surface: #ffffff;
  --color-text: var(--color-neutral-900);
  --color-text-muted: var(--color-neutral-500);
  --color-border: var(--color-neutral-200);

  /* --- Typography --- */
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */
  --text-4xl: 2.25rem; /* 36px */

  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* --- Spacing --- */
  --spacing-1: 0.25rem; /* 4px */
  --spacing-2: 0.5rem; /* 8px */
  --spacing-3: 0.75rem; /* 12px */
  --spacing-4: 1rem; /* 16px */
  --spacing-5: 1.25rem; /* 20px */
  --spacing-6: 1.5rem; /* 24px */
  --spacing-8: 2rem; /* 32px */
  --spacing-10: 2.5rem; /* 40px */
  --spacing-12: 3rem; /* 48px */
  --spacing-16: 4rem; /* 64px */

  /* --- Shadows --- */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg:
    0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl:
    0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* --- Border Radius --- */
  --radius-sm: 0.25rem; /* 4px */
  --radius-md: 0.375rem; /* 6px */
  --radius-lg: 0.5rem; /* 8px */
  --radius-xl: 0.75rem; /* 12px */
  --radius-2xl: 1rem; /* 16px */
  --radius-full: 9999px;

  /* --- Z-Index --- */
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-overlay: 30;
  --z-modal: 40;
  --z-toast: 50;

  /* --- Transitions --- */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-in: cubic-bezier(0.4, 0, 1, 1);
  --easing-out: cubic-bezier(0, 0, 0.2, 1);
}
```

These defaults are based on Tailwind's proven scale. The agent proposes them as a starting point — the user customizes brand colors, fonts, and any values specific to their project.

### Token Groups

| Group         | What to define                                                  | Notes                                              |
| ------------- | --------------------------------------------------------------- | -------------------------------------------------- |
| Colors        | Semantic (primary, error) + neutral scale + surface/text/border | Always semantic names, never raw hex in components |
| Typography    | Font families, size scale, weights, line-heights                | Use rem-based scale for accessibility              |
| Spacing       | 4px-based scale (4, 8, 12, 16, 24, 32, 48, 64)                  | Consistent scale prevents magic numbers            |
| Shadows       | Elevation levels (sm, md, lg, xl)                               | Match Tailwind defaults                            |
| Border radius | Rounding scale (sm, md, lg, xl, full)                           | full = pill/circle                                 |
| Z-index       | Named layers (dropdown, modal, toast)                           | Prevents z-index wars                              |
| Transitions   | Durations + easings                                             | Consistent motion across the app                   |

### Breakpoints

Breakpoints are NOT CSS custom properties (media queries don't support them). They live in the CSS framework config:

- **Tailwind**: defined in `tailwind.config.ts` under `theme.screens`
- **CSS Modules**: use `@media` with raw values or `@custom-media` (when supported)

Default breakpoints (Tailwind standard):

| Name | Min-width | Typical device           |
| ---- | --------- | ------------------------ |
| sm   | 640px     | Large phones (landscape) |
| md   | 768px     | Tablets                  |
| lg   | 1024px    | Laptops                  |
| xl   | 1280px    | Desktops                 |
| 2xl  | 1536px    | Large desktops           |

---

## Consuming Tokens

### With Tailwind CSS

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
        },
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        error: "var(--color-error)",
        warning: "var(--color-warning)",
        success: "var(--color-success)",
        info: "var(--color-info)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
      },
      zIndex: {
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
      },
    },
  },
};
```

Import `tokens.css` in your app entry point:

```ts
// src/main.tsx
import "../designs/tokens.css";
```

Then use Tailwind classes that reference tokens: `bg-primary`, `text-error`, `shadow-md`, `rounded-lg`.

### With CSS Modules

Import `tokens.css` globally, then reference variables directly:

```css
/* pods/dashboard/dashboard.module.css */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
}

.title {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}
```

---

## Dark Mode / Theming

Use a CSS class on `<html>` or `<body>` to override token values:

```css
/* designs/tokens.css - add after :root */
.dark {
  --color-background: var(--color-neutral-950);
  --color-surface: var(--color-neutral-900);
  --color-text: var(--color-neutral-50);
  --color-text-muted: var(--color-neutral-400);
  --color-border: var(--color-neutral-700);
}
```

Pencil supports theme variants as variable modes — design both light and dark in the same `.pen` file.

---

## Pencil: File Conventions

### File Types

| Extension  | Purpose                  | Example                           |
| ---------- | ------------------------ | --------------------------------- |
| `.pen`     | Individual screen design | `dashboard.pen`, `auth-login.pen` |
| `.lib.pen` | Shared component library | `ui-kit.lib.pen`                  |

### Naming Rules

- **Screens**: match the pod/feature name -> `user-profile.pen` for `pods/user-profile/`
- **Libraries**: descriptive name -> `ui-kit.lib.pen` (main), `charts.lib.pen` (specialized)
- Always kebab-case, always lowercase

### Pencil + Codebase Sync

Pencil's AI reads both `.pen` files and source code when they are in the same workspace. To enable this:

1. Keep `designs/` at the project root (or `apps/<app>/designs/` in monorepos)
2. `.pen` files are JSON-based and version-controlled in Git
3. When generating code from a `.pen`, tell Pencil your stack: "Generate React with Tailwind CSS" or "Generate React with CSS Modules"
4. Generated code goes through the developer — it's a starting point, not the final output

### Design Libraries (.lib.pen)

The `ui-kit.lib.pen` contains reusable components (Button, Input, Card, etc.) that are used across screen designs. When designing a new screen:

1. Use components from `ui-kit.lib.pen` for consistency
2. If a screen needs a new component, create it in the screen first
3. If the component is reused in 2+ screens, extract it to `ui-kit.lib.pen`

---

## Component Catalog (Reference)

These are common components organized by category. **Add to `ui-kit.lib.pen` only when needed by a real screen** — this is a reference, not a checklist.

### Actions

| Component  | Use when                                                    |
| ---------- | ----------------------------------------------------------- |
| Button     | Primary actions, form submissions, CTAs                     |
| IconButton | Actions where an icon is sufficient (close, menu, settings) |
| Link       | Navigation to other pages or external URLs                  |

### Forms

| Component | Use when                                               |
| --------- | ------------------------------------------------------ |
| Input     | Single-line text entry (text, email, password, number) |
| TextArea  | Multi-line text entry                                  |
| Select    | Choosing from a predefined list                        |
| Checkbox  | Toggle boolean or multiple selections                  |
| Radio     | Single selection from mutually exclusive options       |
| Switch    | On/off toggle with immediate effect                    |
| Label     | Accessible form field labeling                         |

### Feedback

| Component | Use when                                            |
| --------- | --------------------------------------------------- |
| Alert     | Persistent messages (info, warning, error, success) |
| Toast     | Temporary notifications for completed actions       |
| Badge     | Status indicators, counts, labels                   |
| Progress  | Long-running operations with known progress         |
| Spinner   | Loading states with unknown duration                |
| Skeleton  | Loading placeholder for known layout shapes         |

### Layout

| Component | Use when                                        |
| --------- | ----------------------------------------------- |
| Card      | Grouped content with visual boundary            |
| Separator | Visual division between content sections        |
| Container | Max-width content wrapper                       |
| Stack     | Vertical or horizontal spacing between children |

### Navigation

| Component  | Use when                                         |
| ---------- | ------------------------------------------------ |
| Navbar     | Top-level horizontal navigation                  |
| Sidebar    | Vertical navigation for apps with many sections  |
| Tabs       | Switch between related views in the same context |
| Breadcrumb | Show hierarchical location in deep navigation    |

### Overlay

| Component      | Use when                                 |
| -------------- | ---------------------------------------- |
| Modal / Dialog | Focused interaction that blocks the page |
| Dropdown       | Contextual menu from a trigger element   |
| Tooltip        | Brief info on hover/focus                |
| Popover        | Rich content on click (forms, previews)  |

### Data Display

| Component   | Use when                           |
| ----------- | ---------------------------------- |
| Table       | Structured tabular data            |
| List        | Ordered or unordered content items |
| Avatar      | User or entity visual identity     |
| Empty State | No data available, first-time use  |

---

## UX Checklist

Review every screen against this checklist before presenting to the user.

### States

- [ ] Defined all 4 states? (loading, empty, error, data)
- [ ] Empty states have a CTA guiding the user? ("Create your first project")
- [ ] Error messages are actionable? (what happened + what to do)
- [ ] Loading uses skeleton for known layouts, spinner for unknown?

### Feedback and Interaction

- [ ] Feedback for every user action? (toast, inline, state change)
- [ ] Destructive actions ask for confirmation? (delete, discard changes)
- [ ] Buttons have visible states? (hover, active, disabled, loading)
- [ ] Disabled states explain why? (tooltip or helper text)

### Navigation and Orientation

- [ ] User knows where they are? (breadcrumb, active nav, page title)
- [ ] Patterns consistent across the app? (same action = same pattern)
- [ ] Obvious way to go back?

### Forms

- [ ] Inline validation on blur? (not only on submit)
- [ ] Visible labels for all fields? (not just placeholder)
- [ ] Autofocus on first field?
- [ ] Logical tab order?
- [ ] Submit button shows loading and prevents double-submit?

### Visual Hierarchy

- [ ] One clear primary action per screen? (visually prominent)
- [ ] Heading hierarchy correct? (h1 > h2 > h3, single h1)
- [ ] Long text has truncation strategy? (ellipsis + tooltip, expand)

### Accessibility (a11y)

- [ ] Contrast AA minimum? (4.5:1 normal text, 3:1 large text)
- [ ] Touch targets >= 44x44px on mobile?
- [ ] Keyboard navigable? (tab, enter, escape)
- [ ] Focus management correct? (after modal close, where does focus go?)
- [ ] Icons without text have aria-label?

### Responsive

- [ ] Mobile-first design?
- [ ] Content hierarchy adapts? (reorganizes, not just shrinks)
- [ ] Navigation adapts for mobile? (hamburger, bottom tabs, drawer)

### Lists and Data

- [ ] Long lists have pagination or infinite scroll?
- [ ] Search/filter available if the list can grow?
- [ ] Tables adapt for mobile? (cards, horizontal scroll, hide columns)

---

## Variable Binding Audit

After every `batch_design` call, audit ALL created/updated nodes to ensure no raw values leaked through.

### What to check

```
WRONG (raw values):
  fill: "#6366f1"           -> fill: "$color-primary"
  cornerRadius: 12          -> cornerRadius: "$radius-xl"
  gap: 16                   -> gap: "$spacing-md"
  padding: 32               -> padding: "$spacing-xl"
  fontFamily: "Poppins"     -> fontFamily: "$font-sans"
  fontSize: 14              -> fontSize: "$text-sm"
  fontWeight: "600"         -> fontWeight: "$font-weight-semibold"
  stroke.fill: "#e2e8f0"    -> stroke.fill: "$color-border"
```

### Exceptions (raw values allowed)

- `width`, `height` when using specific pixel sizes for icons or fixed-size elements
- `x`, `y` position values (layout-driven, not token-driven)
- `textGrowth`, `textAlign`, `layout` and other enum properties
- `type`, `name`, `content` (text content), `reusable`, `placeholder`
- Skeleton loading rectangles may use token colors but specific widths for variation

### Fix procedure

If raw values are found after a `batch_design` call, immediately issue `U()` operations to replace them with the correct `$variable` references.

---

## Creative Design Guidelines

Design with intentionality. Every screen should feel purposefully designed for its context, not assembled from a generic template.

### Design Thinking Process

Before opening Pencil, answer these questions:

1. **Purpose**: What problem does this interface solve? Who uses it?
2. **Tone**: What personality should the interface convey? (editorial authority, playful warmth, technical precision, luxurious refinement, etc.)
3. **Differentiation**: What's the one visual choice that makes this screen memorable?
4. **Composition**: How does the spatial layout guide the user's eye?

### Typography

- Choose fonts that serve the design's personality — never default to generic choices
- Create clear hierarchy through size contrast (e.g., 24px title vs 14px body) and weight variation
- Pair display and body fonts deliberately (e.g., Poppins headings + Inter body, or a serif + sans combination)
- Use letter-spacing and line-height intentionally — tight for headlines, relaxed for body text

### Color and Theme

- Commit to a cohesive palette. Dominant colors with sharp accents outperform timid, evenly-distributed palettes
- Use semantic color naming (`$color-primary`, `$color-accent`) not descriptive (`$color-indigo`)
- Create depth with surface layering: background -> surface -> elevated surface
- Consider how color guides attention to the primary action

### Spatial Composition

- Generous negative space communicates confidence and clarity
- Consistent spacing rhythm (use the token scale) creates visual harmony
- Grid rhythm doesn't mean rigidity — intentional asymmetry can add interest
- Consider the F-pattern or Z-pattern for content-heavy screens

### Visual Depth and Atmosphere

- Use subtle borders (`$color-border`) or shadows (`$shadow-sm`) to define surfaces — not both
- Icon integration adds personality — use them consistently as visual anchors
- Background treatments (subtle gradients, tinted surfaces) create warmth
- Loading states (skeletons) should match the exact layout shape of the loaded content

### Avoid Generic Aesthetics

- No cookie-cutter card grids without purpose
- No safe, predictable layouts that look like every other SaaS
- No font choices just because they're popular (Inter, Roboto)
- Each screen should reflect its specific content and purpose

---

## Sitemap Template

Maintain `designs/sitemap.md` as a living document:

```markdown
# Sitemap — [App Name]

**Last updated**: YYYY-MM-DD

## Navigation Flow

/                   Landing / Home
/login              Auth Login
/organizations      Organization List (states: data, loading, empty, error)
  └── /org/:id      Organization Dashboard
       ├── /projects     Project List
       └── /settings     Organization Settings

## Screen Inventory

| Screen | Route | .pen File | Status |
|--------|-------|-----------|--------|
| Org List | /organizations | designs/organizations-list.pen | designed |

## Connections

Org List --[select org]--> Org Dashboard
Org Dashboard --[back]--> Org List
```

Update this file every time a new screen is designed or a route changes.

---

## Cross-References

| Topic                                                 | Skill                          |
| ----------------------------------------------------- | ------------------------------ |
| Component code structure (pods, file naming, barrels) | **spa-architecture** blueprint              |
| CSS framework choice (Tailwind, CSS Modules)          | **project-setup**                           |
| Theme/tokens folder location (`core/theme/`)          | **spa-architecture** blueprint              |
| PRD that feeds into screen designs                    | **grill-me**                                |
| Implementation plan from approved designs             | **prd-to-plan**                             |
| Testing UI components                                 | **tdd** + **testing-architecture** blueprint |

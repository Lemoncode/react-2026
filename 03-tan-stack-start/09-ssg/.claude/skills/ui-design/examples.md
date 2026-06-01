# UI Design — Examples

## Example 1: Design System Setup (Tailwind Project)

### Scenario

New frontend project with Tailwind CSS. No design system exists yet.

### Agent detects

```
- CSS framework: Tailwind (tailwind.config.ts exists)
- No designs/ folder
- No tokens.css
- Mode: Setup
```

### Step 1: Propose tokens

Agent presents token proposal based on Tailwind defaults:

> "Detected Tailwind in your project. Here are the proposed tokens as a starting point. Colors are based on Tailwind defaults — customize whatever you need for your brand:"

```css
/* designs/tokens.css */
:root {
  --color-primary: #3b82f6; /* blue-500 */
  --color-primary-hover: #2563eb; /* blue-600 */
  --color-secondary: #64748b; /* slate-500 */
  --color-error: #ef4444; /* red-500 */
  --color-warning: #f59e0b; /* amber-500 */
  --color-success: #22c55e; /* green-500 */

  --color-background: #f8fafc; /* slate-50 */
  --color-surface: #ffffff;
  --color-text: #0f172a; /* slate-900 */
  --color-text-muted: #64748b; /* slate-500 */
  --color-border: #e2e8f0; /* slate-200 */

  --font-sans: "Inter", system-ui, sans-serif;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  /* ... rest of tokens from reference.md template */
}
```

### Step 2: User customizes

> User: "Primary should be #6366f1 (indigo) and use Poppins font"

Agent updates `tokens.css`:

```css
--color-primary: #6366f1;
--color-primary-hover: #4f46e5;
--font-sans: "Poppins", system-ui, sans-serif;
```

### Step 3: Sync tokens to Pencil

Agent reads `tokens.css` and calls `set_variables` with `replace: true` to create matching Pencil variables:

```
color-primary -> type: "color", value: "#6366f1"
color-primary-hover -> type: "color", value: "#4f46e5"
font-sans -> type: "string", value: "Poppins"
radius-md -> type: "number", value: 6
...
```

All variables in Pencil now mirror `tokens.css`. The CSS file remains the source of truth.

### Step 4: Configure Tailwind

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
        },
        secondary: "var(--color-secondary)",
        error: "var(--color-error)",
        warning: "var(--color-warning)",
        success: "var(--color-success)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
      },
    },
  },
};
```

### Step 5: Import tokens

```ts
// src/main.tsx
import "../designs/tokens.css";
import "./index.css";
```

### Step 6: Create Pencil library and sitemap

> "Creating `designs/ui-kit.lib.pen` for your base components and `designs/sitemap.md` for navigation tracking."

Agent creates:
- `designs/ui-kit.lib.pen` — empty, with variables synced from tokens.css
- `designs/sitemap.md` — initial sitemap structure

---

## Example 2: Design System Setup (CSS Modules Project)

### Scenario

Frontend project using CSS Modules. No Tailwind.

### Agent detects

```
- CSS framework: CSS Modules (.module.css files found)
- No Tailwind config
- Mode: Setup
```

### Token setup is the same

`designs/tokens.css` is identical — CSS custom properties work everywhere.

### No Tailwind config needed

Components consume tokens directly:

```css
/* pods/login/login.module.css */
.form {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-8);
  box-shadow: var(--shadow-md);
}

.submitButton {
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  padding: var(--spacing-2) var(--spacing-6);
  font-weight: var(--font-weight-semibold);
  transition: background var(--duration-fast) var(--easing-default);
}

.submitButton:hover {
  background: var(--color-primary-hover);
}
```

---

## Example 3: Designing a Screen (with Variable Binding and Creative Direction)

### Scenario

PRD for a "User Dashboard" exists. Design system is set up. User wants to design the dashboard screen.

### Step 1: Creative direction

Agent thinks about the screen's purpose and aesthetic before opening Pencil:

> "This is a dashboard for a CMS platform. The tone should convey professional confidence with warm approachability — users spend a lot of time here. The composition will use generous whitespace with a clear visual hierarchy: stats up top as visual anchors, then the project list as the primary content area."

### Step 2: Get style guide

Agent calls `get_style_guide_tags()` then `get_style_guide(["webapp", "dashboard", "clean", "professional", "modern", "light-mode"])` for visual inspiration.

### Step 3: Read PRD context

Agent reads the PRD and identifies user stories relevant to the dashboard:

- "As a user, I want to see my recent projects so I can continue where I left off"
- "As a user, I want to see my activity summary"
- "As a user, I want quick access to create a new project"

### Step 4: Create the design with $variables

> "Creating `designs/dashboard.pen` with the dashboard design. Using tokens and components from `ui-kit.lib.pen`."

Agent creates the `.pen` file using Pencil. **Every property uses $variables:**

```
// CORRECT — all visual properties use $variables
I(screen, {
  type: "frame",
  fill: "$color-background",          // not "#f8fafc"
  cornerRadius: "$radius-xl",         // not 12
  padding: "$spacing-xl",             // not 32
  gap: "$spacing-lg"                  // not 24
})

I(card, {
  type: "text",
  content: "Recent Projects",
  fontFamily: "$font-sans",           // not "Poppins"
  fontSize: "$text-xl",              // not 20
  fontWeight: "$font-weight-semibold", // not "600"
  fill: "$color-text"                 // not "#0f172a"
})
```

### Step 5: Variable binding audit

After each `batch_design` call, agent checks all created nodes. Finds one raw value:

```
FOUND: stroke.fill: "#fecaca" on error-box
FIX: Should use a token. Adding --color-error-light to tokens.css, re-syncing, then using "$color-error-light"
```

### Step 6: UX checklist review

Agent reviews against the checklist:

> "Reviewed the design against the UX checklist:"
>
> - [x] All 4 states defined: loading (skeleton cards), empty (CTA "Create your first project"), error (retry banner), data
> - [x] Primary CTA visible: "New Project" button in the top-right corner
> - [x] Clear navigation: sidebar with active section highlighted
> - [x] Responsive: cards stack on mobile, sidebar collapses to hamburger
> - [ ] **Pending**: empty state for the project list not defined yet — should I add it?

### Step 7: Update sitemap

Agent updates `designs/sitemap.md`:

```markdown
## Screen Inventory

| Screen | Route | .pen File | Status |
|--------|-------|-----------|--------|
| Dashboard | /dashboard | designs/dashboard.pen | designed |

## Connections

Login --[success]--> Dashboard
Dashboard --[click project]--> Project Detail
Dashboard --[click "New Project"]--> Project Create
```

### Step 8: Present to user

> "Here's the dashboard design. Review it and let me know what changes you'd like."

### Step 9: User iterates

> User: "I like it, but move the stats section above instead of on the right. And add a date filter to the project list."

Agent updates the `.pen` file and re-presents.

### Step 10: Approval

> User: "Perfect, approved."
>
> Agent: "Dashboard approved. Sitemap updated. Want to design another screen or run `/prd-to-plan` to create the implementation plan?"

---

## Example 4: Extending the Design System Mid-Project

### Scenario

Working on a "Settings" screen, need a Tabs component that doesn't exist in `ui-kit.lib.pen`.

### Step 1: Agent detects the need

> "The Settings screen needs a Tabs component to organize sections (Profile, Security, Notifications). It doesn't exist in `ui-kit.lib.pen`."

### Step 2: Create in the screen first

Agent designs the Tabs component within `settings.pen`, using project tokens for styling.

### Step 3: Evaluate extraction

> "The Tabs component will also be used in the Analytics screen (already in the PRD). Should I extract it to `ui-kit.lib.pen`?"

User confirms -> Agent moves to the library.

If only used in Settings -> stays in `settings.pen` only. Extract when reuse is real, not hypothetical.

---

## Example 5: Integration with Skill Chain

### Full flow: PRD -> Design -> Plan -> Issues

```
1. User runs /grill-me
   -> PRD created: ./plans/prd-dashboard-2026-03-23.md

2. Agent offers: "Want to design the screens before planning?"
   User: "Yes"

3. User runs /ui-design
   -> Design system setup (tokens.css, ui-kit.lib.pen)
   -> Screens designed: dashboard.pen, settings.pen, auth-login.pen
   -> User approves all designs

4. Agent offers: "Designs validated. Want to run /prd-to-plan?"
   User: "Yes"

5. User runs /prd-to-plan
   -> Plan references designs in phase descriptions:
      "Phase 1: Dashboard — see designs/dashboard.pen for approved layout"

6. User runs /prd-to-issues
   -> Issues reference both plan phases and design files
```

### Without design (optional skip)

```
1. User runs /grill-me
   -> PRD created

2. Agent offers: "Want to design the screens?"
   User: "No, let's go straight to the plan"

3. User runs /prd-to-plan
   -> Plan created normally without design references
```

---

## Example 6: Dark Mode Token Override

### Adding dark mode support

```css
/* designs/tokens.css — append after :root */
.dark {
  --color-primary: #818cf8; /* lighter indigo for dark bg */
  --color-primary-hover: #6366f1;

  --color-background: #020617; /* slate-950 */
  --color-surface: #0f172a; /* slate-900 */
  --color-text: #f8fafc; /* slate-50 */
  --color-text-muted: #94a3b8; /* slate-400 */
  --color-border: #334155; /* slate-700 */

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
}
```

No changes needed in Tailwind config or component code — the CSS custom properties cascade. Toggle dark mode by adding/removing the `dark` class on `<html>`.

In Pencil, design the dark variant using Pencil's variable modes. Both themes live in the same `.pen` file.

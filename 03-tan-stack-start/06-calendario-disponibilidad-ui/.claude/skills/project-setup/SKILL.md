---
name: project-setup
description: >-
  Bootstrap TypeScript projects from zero. Interactive workflow: asks mode (standalone/monorepo), preset (Frontend SPA, Backend API, Library),
  and optional choices (CSS framework, icons). Generates all files following architecture blueprints.
  Use when user asks to set up a new project, bootstrap a frontend/backend, scaffold, or mentions "project setup", "bootstrap", "new project".
---

# Project Setup

## Core Principle

One command to go from zero to a working project. Ask — never assume — optional choices. All configs and patterns come from architecture blueprints.

## Blueprints to Load

Load these blueprints (in `.claude/blueprints/`) based on the answers to the workflow questions:

| Answer               | Load blueprint                                         |
| -------------------- | ------------------------------------------------------ |
| Always               | `coding-conventions.md`                                |
| Monorepo mode        | `monorepo-architecture.md`                             |
| Frontend SPA preset  | `spa-architecture.md`                                  |
| Backend API preset   | `backend-architecture.md`                              |
| Library preset       | `monorepo-architecture.md` (publishable package section) |
| Tests needed         | `testing-architecture.md`                              |

## Workflow

1. **Ask mode**: standalone or monorepo app/package?
2. **Ask preset**: Frontend SPA, Backend API, or Library?
3. **Ask optional choices** (Frontend SPA only):
   - CSS framework: Tailwind (default), CSS Modules, none
   - Icon library: lucide-react, other, none
4. **Load relevant blueprints** (see table above)
5. **Generate transversal tooling** — following `coding-conventions.md`:
   - tsconfig, Oxlint, Prettier, Husky + lint-staged
   - ENV handling (`createEnvReader`)
   - `.gitattributes`, `.gitignore`, `.nvmrc`
   - VSCode settings
   - Dependabot
   - npm scripts (standard set from coding-conventions)
6. **Generate preset-specific files** — following the loaded blueprint:
   - Dependencies, configs, entry point, Dockerfile
   - Monorepo: workspace structure from `monorepo-architecture.md`
7. **Generate `CLAUDE.md`** — the agent's entry point for the project (see template below)
8. **Check latest versions** — `npm view <pkg> version` for every dependency
9. **Install dependencies** — `npm install`
10. **Verify** — `node --run lint`, `node --run format:check`, `node --run check-types` all pass

## Key Rules

- **All static config details live in blueprints** — this skill only defines the workflow
- **Always check latest stable versions** — never use outdated versions from memory
- **Ask, don't assume** — mode, preset, and optional choices must be confirmed with the user
- **No `.ts` extensions in imports** — `moduleResolution: "Bundler"` handles resolution
- **No `resolve.alias` for `#`** — native subpath imports work without plugins

## After Setup

| Next task                    | Load blueprint / skill                   |
| ---------------------------- | ---------------------------------------- |
| Structure frontend app       | `spa-architecture.md`                    |
| Structure backend app        | `backend-architecture.md`                |
| Set up monorepo workspace    | `monorepo-architecture.md`               |
| Write tests                  | `testing-architecture.md` + `tdd` skill  |
| Build a feature              | `feature-flow` skill                     |

## Verification Checklist

- [ ] No `.ts` extensions in any import path
- [ ] Frontend apps have `src/vite-env.d.ts`
- [ ] Config packages have `exports` in `package.json`
- [ ] Dependencies are latest stable versions
- [ ] `CLAUDE.md` generated at project root with correct blueprint/skill tables
- [ ] `node --run lint`, `node --run format:check`, `node --run check-types` all pass

## CLAUDE.md Template

Generate at project root. Fill `{placeholders}` from user answers. Only include rows for loaded blueprints/skills.

```markdown
# {Project Name}

{Brief project description.}

## Stack

{List only what applies — e.g.:}
- **Monorepo**: npm workspaces + Turborepo
- **Frontend**: React 19, Vite 8, TanStack Router + Query, nanostores, Tailwind v4
- **Backend**: Hono + @hono/node-server, Pino, MongoDB (native driver)

## Run Commands

- `node --run dev` — {describe what starts}
- `node --run test` — run tests
- `node --run lint` — Oxlint
- `node --run format:check` — Prettier check

## Architecture Blueprints

Static reference docs in `.claude/blueprints/`. Load the relevant ones based on the task:

| Task                       | Load blueprints                                                |
| -------------------------- | -------------------------------------------------------------- |
| Any code task              | `coding-conventions.md` (always)                               |
{Include only relevant rows from the master table below}

{Master table — pick rows that match the project:}
| Frontend work              | `spa-architecture.md` + `coding-conventions.md`                |
| Backend work               | `backend-architecture.md` + `coding-conventions.md`            |
| Monorepo structure         | `monorepo-architecture.md` + `coding-conventions.md`           |
| Full-stack monorepo        | all architecture blueprints + `coding-conventions.md`          |
| Writing tests              | `testing-architecture.md` + `coding-conventions.md`            |
| SSR (TanStack Start)       | `ssr-architecture.md` + `spa-architecture.md` + `coding-conventions.md` |

## Skill Orchestration

Workflow skills handle interactive tasks. They reference blueprints for static configs.

| Task                       | Load these skills                                        |
| -------------------------- | -------------------------------------------------------- |
| Set up a new project       | `project-setup`                                          |
| Build a feature            | `feature-flow` + `tdd`                                   |
| TDD workflow               | `tdd`                                                    |
| Create a PRD               | `grill-me`                                               |
| PRD → plan → issues        | `grill-me` → `prd-to-plan` → `prd-to-issues`            |
| Triage/fix a bug           | `triage-issue` + `tdd`                                   |
| Design screens / UI        | `ui-design`                                              |
| Create a new skill         | `write-a-skill`                                          |

## Key Conventions

- **ES2024** target, **Node 24**
- **`#*` imports** (Node.js subpath imports) — `"#pods/user"`, not `"@/pods/user"`
- **Oxlint** for linting, **Prettier** for formatting
- **Vitest** for testing
- Functional style (closures, factories — no classes)
- File naming: `<name>.<type>.ts(x)` (singular)
- {Add project-specific conventions here}
```

## Uncontemplated Scenarios

When a tooling choice or config doesn't clearly fit these rules:

1. Apply the closest matching convention with reasoning
2. **Flag it**: "This scenario isn't covered by the project-setup skill. I applied [rule] because [reason]. Want to update the skill?"
3. Offer to add a new rule for the case

---
name: setup-shadcn-tanstack-tailwind4
description: Integra shadcn/ui en un proyecto TanStack Start con Tailwind CSS v4 siguiendo la documentación oficial, sin degradar Tailwind a v3. Use when el usuario quiere instalar/configurar shadcn en TanStack Start, añadir componentes de shadcn, o montar dark mode con shadcn en TanStack Start.
---

# Setup shadcn/ui en TanStack Start + Tailwind 4

## Core Principle

El CLI moderno de shadcn (`shadcn@latest`) **detecta Tailwind v4 y NO debe degradarlo**. Todo el flujo
gira en torno a una garantía: si tras `init` aparece **cualquier rastro de Tailwind v3** (un
`tailwind.config.*`, `tailwindcss-animate`, o las directivas `@tailwind base/components/utilities`) →
**abortar y revertir**. Doc oficial: https://ui.shadcn.com/docs/installation/tanstack

## Dependencies

Ninguna obligatoria. (Formato basado en la convención del skill `write-a-skill`.)

## MANDATORY RULES (checklist)

- **No degradar Tailwind** — NUNCA instalar `tailwindcss@3` ni dejar que el CLI lo haga. Debe quedar `4.x`.
- **Sin config JS** — NUNCA crear `tailwind.config.js`/`.ts`. En v4 no existe; en `components.json` el
  campo `tailwind.config` va vacío (`""`).
- **Animaciones v4** — NUNCA añadir `tailwindcss-animate`. En v4 se usa `tw-animate-css`.
- **Directiva CSS v4** — NUNCA reemplazar `@import "tailwindcss"` por `@tailwind base/components/utilities`.
- **RSC = NO** — en el prompt "React Server Components?" responde **NO** (el default es `yes` y, si lo
  aceptas, el CLI escribe rutas de Next.js en `components.json` y el `init` falla con `ENOENT`).
- **init es interactivo** — responde los prompts a mano; `--yes` no los salta y el CLI vacía el stdin
  entre prompts (no se pueden automatizar por pipe). Verifica `components.json` justo después.
- **Árbol git limpio antes de empezar** — commit/stash previo, para revisar el diff de `init` y poder
  revertir con `git checkout .` si algo va mal.
- **Verificar v4 antes y después** — si el post-check falla, revertir y reportar; no continuar.

## Fases (comandos exactos en [reference.md](reference.md))

### 0. Prerequisitos / guardrail
- Es TanStack Start: `vite.config.*` con `tanstackStart()` y existe `src/routes/__root.tsx`.
- `pnpm ls tailwindcss` → `4.x` (anótala). Confirmar `@tailwindcss/vite` en `vite.config.*` y
  `@import "tailwindcss"` en el CSS de entrada (p.ej. `src/styles.css`). Detectar gestor de paquetes.
- Alias `@/*` → `./src/*` en `tsconfig.json` (si falta, añadirlo — **sin tocar Tailwind**).

### 1. `shadcn init` (CLI oficial) — **es INTERACTIVO**
```bash
pnpm dlx shadcn@latest init -b radix -p nova
```
CLI v4.x (probado con `shadcn@4.8.0`): ya NO hay `--base-color`; `-b radix` = librería de componentes,
`-p nova` = preset/tema (`radix-nova`). Responde los prompts **a mano** en este orden:
`TypeScript → yes` · `style → New York` · **`RSC → NO`** (¡el default `yes` rompe el init, ver regla arriba!).

`init` crea `components.json` y `src/lib/utils.ts`, instala `class-variance-authority clsx tailwind-merge
tw-animate-css radix-ui shadcn`, e inyecta en el CSS las variables oklch (`:root`/`.dark`),
`@custom-variant dark` y `@theme inline`. Detalle y flags en [reference.md](reference.md) §1.

### 2. POST-INIT VERIFICATION (guardrail crítico) — si algo falla → revertir
- `git diff package.json`: `tailwindcss` sigue `^4.x` y **no** aparece `tailwindcss-animate`.
- **No** existe `tailwind.config.{js,ts}`.
- El CSS conserva `@import "tailwindcss"` (no `@tailwind base`).
- `components.json`: `rsc: false`, `tailwind.config: ""`, `css` apunta al fichero real (p.ej.
  `src/styles.css`), `cssVariables: true`. **Si quedó `rsc: true` / `config: "tailwind.config.js"` /
  `css: "app/globals.css"`** (respondiste mal a RSC) → corregirlo a mano y re-inyectar el CSS: volver a
  `init` o pegar el bloque de [reference.md](reference.md) §4 (no hace falta `tailwind.config.js`).
- Tema custom previo: revisar el diff por **colisiones de nombres** de variables (`--background`,
  `--primary`…). Nota: en v4 un `body {…}` sin capa gana a `@layer base { body … }` de shadcn.

### 3. Smoke test
```bash
pnpm dlx shadcn@latest add button
```
Usar el `Button` una vez y arrancar `pnpm dev` para confirmar que aplica estilos.

### 4. Dark mode (TanStack Start) — doc: https://ui.shadcn.com/docs/dark-mode/tanstack-start
```bash
pnpm dlx shadcn@latest add dropdown-menu button
```
**Primero comprueba si ya hay dark mode basado en la clase `.dark`** (un script anti-FOUC en `__root.tsx`
o un toggle que haga `documentElement.classList.add('dark')`). Si existe, shadcn **ya es compatible** (su
`@custom-variant dark` usa `.dark`): NO crees un `ThemeProvider` duplicado (chocaría) — los componentes ya
cambian con el toggle actual; como mucho, dale estilo shadcn reutilizando su lógica.

**Solo si NO hay sistema previo**, móntalo (código en [reference.md](reference.md) §6):
- Crear `src/components/theme-provider.tsx` (usa `ScriptOnce` de `@tanstack/react-router` para evitar FOUC
  + `localStorage`).
- En `src/routes/__root.tsx`: envolver el contenido con `<ThemeProvider defaultTheme="system"
  storageKey="theme">` y añadir `suppressHydrationWarning` al `<html>`.
- Crear `src/components/mode-toggle.tsx` (DropdownMenu + iconos `Sun`/`Moon` de `lucide-react`).

## Verification Checklist

Antes de dar por terminado:
- [ ] `pnpm ls tailwindcss` sigue en `4.x`.
- [ ] No existe ningún `tailwind.config.*`.
- [ ] El CSS tiene `@import "tailwindcss"`, `@import "tw-animate-css"`, `@custom-variant dark`,
      `@theme inline {…}` y bloques `:root`/`.dark` en oklch.
- [ ] `components.json` con `tailwind.config: ""` y `cssVariables: true`.
- [ ] `src/lib/utils.ts` exporta `cn()`.
- [ ] Un componente shadcn renderiza con estilos.
- [ ] El toggle de dark mode cambia el tema sin parpadeo (FOUC).
- [ ] `pnpm dev` y `pnpm build` terminan sin errores.

## Uncontemplated Scenarios

- **El CLI intenta degradar Tailwind o crear `tailwind.config`** → abortar, `git checkout .`, y usar el
  **método manual** documentado en [reference.md](reference.md).
- **Tailwind v4 no está instalado** → instalar **v4** (`tailwindcss@latest` + `@tailwindcss/vite` y
  `tailwindcss()` en `vite.config.*`), NUNCA v3, y continuar.
- **Algo no encaja con estas reglas** → aplicar la regla más cercana, avisar al usuario explicando qué
  regla y por qué, y ofrecer actualizar el skill.

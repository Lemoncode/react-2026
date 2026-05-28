---
name: setup-shadcn-tanstack-tailwind4
description: Integra shadcn/ui en un proyecto TanStack Start con Tailwind CSS v4 siguiendo la documentación oficial, sin degradar Tailwind a v3. Use when el usuario quiere instalar/configurar shadcn en TanStack Start, añadir componentes de shadcn, o montar dark mode con shadcn en TanStack Start.
---

# Setup shadcn/ui en TanStack Start + Tailwind 4

## Core Principle

shadcn `@latest` **detecta Tailwind v4 y NO debe degradarlo**. Garantía central: si aparece **cualquier
rastro de v3** (`tailwind.config.*`, `tailwindcss-animate`, o `@tailwind base/components/utilities`) →
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

### 1. Instalar shadcn — elige vía según el contexto

**Vía A · CLI interactivo** (persona en una terminal):
```bash
pnpm dlx shadcn@latest init -b radix -p nova
```
Responde **a mano**: `TypeScript → yes` · `style → New York` · **`RSC → NO`**. CLI v4.x (probado con
`shadcn@4.8.0`): ya NO hay `--base-color`; `-b`=librería (`radix`|`base`), `-p`=preset/tema (`nova`→`radix-nova`).

**Vía B · determinista, SIN prompts** (agentes/CI — es la fiable; el `init` se cuelga porque `--yes` no
salta los prompts y el CLI vacía el stdin entre ellos):
1. `pnpm add class-variance-authority clsx tailwind-merge tw-animate-css radix-ui`
2. Crear `src/lib/utils.ts` (`cn`), `components.json` (rsc:false, config:"", css real) y pegar el bloque
   CSS — todo verbatim en [reference.md](reference.md) §2-4.
3. `pnpm dlx shadcn@latest add button --yes` → con `components.json` válido, `add` ya es no-interactivo.

Ambas dejan lo mismo: `components.json`, `src/lib/utils.ts`, deps v4 y, en el CSS, variables oklch
(`:root`/`.dark`) + `@custom-variant dark` + `@theme inline`. (La Vía A además añade `shadcn` a deps; la B no.)

### 2. POST-INIT VERIFICATION (guardrail crítico) — si algo falla → revertir
- `git diff package.json`: `tailwindcss` sigue `^4.x` y **no** aparece `tailwindcss-animate`.
- **No** existe `tailwind.config.{js,ts}`.
- El CSS conserva `@import "tailwindcss"` (no `@tailwind base`).
- `components.json`: `rsc: false`, `tailwind.config: ""`, `css` apunta al fichero real (p.ej.
  `src/styles.css`), `cssVariables: true`. **Si con la Vía A quedó `rsc: true` / `config:
  "tailwind.config.js"` / `css: "app/globals.css"`** (RSC se quedó en `yes` y el init pudo fallar con
  `ENOENT`) → corregirlo a mano y pegar el bloque CSS de [reference.md](reference.md) §4 (sin crear
  `tailwind.config.js`).
- Tema custom previo: revisar el diff por **colisiones de nombres** de variables (`--background`,
  `--primary`…). Nota: en v4 un `body {…}` sin capa gana a `@layer base { body … }` de shadcn.

### 3. Smoke test
```bash
pnpm dlx shadcn@latest add button --yes   # omítelo si ya lo añadiste en la Vía B
```
Usa el `Button` en una ruta y ejecuta `pnpm build` (y/o `pnpm dev`) para confirmar que compila y aplica
estilos. Tip: el CSS compilado debe contener utilidades como `.bg-primary`/`.bg-card` y la variante
`:is(.dark *)`.

### 4. Dark mode (TanStack Start) — doc: https://ui.shadcn.com/docs/dark-mode/tanstack-start
```bash
pnpm dlx shadcn@latest add dropdown-menu button
```
**Primero comprueba si ya hay dark mode basado en la clase `.dark`** (un script anti-FOUC en `__root.tsx`
o un toggle que haga `documentElement.classList.add('dark')`). Si existe, shadcn **ya es compatible** (su
`@custom-variant dark` usa `.dark`): NO crees un `ThemeProvider` duplicado (chocaría) — los componentes ya
cambian con el toggle actual; como mucho, dale estilo shadcn reutilizando su lógica.

**Solo si NO hay sistema previo**, móntalo (código verbatim en [reference.md](reference.md) §6): crear
`theme-provider.tsx` (`ScriptOnce` + `localStorage` para evitar FOUC), envolver el contenido de `__root.tsx`
con `<ThemeProvider defaultTheme="system" storageKey="theme">` + `suppressHydrationWarning` en `<html>`, y
crear `mode-toggle.tsx` (DropdownMenu + iconos `Sun`/`Moon`).

## Verification Checklist

Antes de dar por terminado:
- [ ] `pnpm ls tailwindcss` sigue en `4.x` y NO existe ningún `tailwind.config.*`.
- [ ] El CSS tiene `@import "tailwindcss"` + `@import "tw-animate-css"` + `@custom-variant dark` +
      `@theme inline {…}` + `:root`/`.dark` en oklch. `components.json`: `config:""`, `cssVariables:true`.
- [ ] `src/lib/utils.ts` exporta `cn()`; un componente shadcn renderiza con estilos.
- [ ] El toggle de dark mode cambia el tema sin FOUC. `pnpm build` (y `pnpm dev`) sin errores.

## Uncontemplated Scenarios

- **El CLI degrada Tailwind, crea `tailwind.config` o se cuelga en prompts** → `git checkout .` y usar la
  **Vía B** ([reference.md](reference.md) §8).
- **Tailwind v4 no está instalado** → instalar **v4** (`tailwindcss@latest` + `@tailwindcss/vite` y
  `tailwindcss()` en `vite.config.*`), NUNCA v3, y continuar.
- **Algo no encaja** → aplicar la regla más cercana, avisar al usuario del porqué, y ofrecer actualizar el skill.

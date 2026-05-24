# Reference — setup-shadcn-tanstack-tailwind4

Detalle verbatim para no improvisar. Fuentes oficiales:

- Instalación TanStack Start: https://ui.shadcn.com/docs/installation/tanstack
- Tailwind v4: https://ui.shadcn.com/docs/tailwind-v4
- Instalación manual: https://ui.shadcn.com/docs/installation/manual
- Dark mode TanStack Start: https://ui.shadcn.com/docs/dark-mode/tanstack-start

---

## 1. Comandos por gestor de paquetes

| Acción            | pnpm                                  | npm                                  | yarn                              | bun                              |
|-------------------|---------------------------------------|--------------------------------------|-----------------------------------|----------------------------------|
| init              | `pnpm dlx shadcn@latest init`         | `npx shadcn@latest init`             | `yarn dlx shadcn@latest init`     | `bunx --bun shadcn@latest init`  |
| añadir componente | `pnpm dlx shadcn@latest add button`   | `npx shadcn@latest add button`       | `yarn dlx shadcn@latest add button` | `bunx --bun shadcn@latest add button` |

> Usar SIEMPRE `shadcn@latest` (no versiones fijas antiguas: ahí estaba el bug del downgrade a Tailwind 3).

Comprobar la versión de Tailwind antes y después:
```bash
pnpm ls tailwindcss          # debe mostrar 4.x
```

---

## 2. `src/lib/utils.ts`

Lo crea `init`; debe quedar exactamente así:
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Dependencias que instala `init`: `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`,
`tw-animate-css`.

---

## 3. `components.json` (TanStack Start + Tailwind v4)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- `tailwind.config: ""` (vacío) = señal de Tailwind **v4**. Si aparece una ruta a un config → estás en v3.
- `css` debe apuntar al fichero CSS real de entrada del proyecto (aquí `src/styles.css`).

---

## 4. Bloque CSS que inyecta `init` (Tailwind v4, oklch)

Se añade al CSS existente sin tocar el `@import "tailwindcss"`:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

> Si el proyecto ya define `--background`, `--primary`, etc. con otros valores, hay **colisión**: decidir
> qué set gana y borrar/renombrar el duplicado. Revisar siempre `git diff` del CSS tras `init`.

---

## 5. Diferencias Tailwind v4 vs v3 (qué NO debe aparecer)

| Tema           | v4 (correcto)                       | v3 (señal de downgrade — abortar)              |
|----------------|-------------------------------------|------------------------------------------------|
| Config         | sin fichero; `components.json` `config: ""` | `tailwind.config.js` / `.ts`            |
| Import en CSS  | `@import "tailwindcss";`            | `@tailwind base; @tailwind components; ...`    |
| Animaciones    | `tw-animate-css`                    | `tailwindcss-animate`                          |
| Colores        | `oklch(...)` con `@theme inline`    | `hsl(var(--x))` en `theme.extend`              |
| Plugin Vite    | `@tailwindcss/vite` + `tailwindcss()` | `postcss` + `autoprefixer`                    |

---

## 6. Dark mode — `src/components/theme-provider.tsx`

Usa `ScriptOnce` (corre antes de la hidratación → evita FOUC) + `localStorage`:

```tsx
import { ScriptOnce } from "@tanstack/react-router"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

function applyTheme(theme: Theme) {
  const root = window.document.documentElement
  root.classList.remove("light", "dark")
  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
    root.classList.add(systemTheme)
    return
  }
  root.classList.add(theme)
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const stored = (localStorage.getItem(storageKey) as Theme | null) ?? defaultTheme
    setTheme(stored)
  }, [defaultTheme, storageKey])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const value: ThemeProviderState = {
    theme,
    setTheme: (next: Theme) => {
      localStorage.setItem(storageKey, next)
      setTheme(next)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {/* Corre antes de hidratar: fija la clase para evitar el flash (FOUC) */}
      <ScriptOnce>
        {`(() => {
          try {
            const t = localStorage.getItem('${storageKey}') || '${defaultTheme}';
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            if (t === 'system') {
              const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              root.classList.add(sys);
            } else {
              root.classList.add(t);
            }
          } catch (e) {}
        })()`}
      </ScriptOnce>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
```

### `src/routes/__root.tsx` (fragmento)

```tsx
import { ThemeProvider } from "@/components/theme-provider"

// dentro del componente raíz:
return (
  <html lang="es" suppressHydrationWarning>
    <head>{/* ... */}</head>
    <body>
      <ThemeProvider defaultTheme="system" storageKey="theme">
        <Outlet />
      </ThemeProvider>
      <Scripts />
    </body>
  </html>
)
```

### `src/components/mode-toggle.tsx`

```tsx
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Claro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Oscuro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>Sistema</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## 7. Alias (`@/*`)

shadcn coloca componentes en `@/components` y utils en `@/lib/utils`. `@/*` debe resolver a `./src/*`:

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

En TanStack Start (Vite) la resolución en build se consigue con `resolve: { tsconfigPaths: true }` en
`vite.config.*` (o el plugin `vite-tsconfig-paths`). No hace falta tocar nada si ya está.

---

## 8. Fallback manual (si el CLI falla o intenta degradar)

1. `git checkout .` para revertir lo que tocó el CLI.
2. Instalar deps: `pnpm add class-variance-authority clsx tailwind-merge lucide-react tw-animate-css`
3. Crear `src/lib/utils.ts` (sección 2), `components.json` (sección 3) y el bloque CSS (sección 4) a mano.
4. Añadir componentes con `pnpm dlx shadcn@latest add <componente>` (con `components.json` ya presente,
   solo copia el componente, no reconfigura el proyecto).

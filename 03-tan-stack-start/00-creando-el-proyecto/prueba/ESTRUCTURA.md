# Estructura del proyecto TanStack Start

Este documento recorre, en orden lógico, los ficheros que genera el CLI de **TanStack Start** (`create-tanstack`) cuando se elige el preset `file-router` + `tailwind` + `nitro`. La idea es ir abriendo los ficheros en clase en este mismo orden para entender cómo encajan las piezas: primero el "esqueleto" del proyecto, después la configuración, luego el enrutado y por último los componentes de UI.

---

## 1. Ficheros raíz: ¿qué tipo de proyecto es esto?

### `package.json`
El punto de partida. Aquí vemos:

- **`"type": "module"`** → todo el proyecto usa ES Modules.
- **`"imports": { "#/*": "./src/*" }`** → alias de Node para imports tipo `#/components/Header`. (Hay otro alias `@/*` definido en `tsconfig.json`).
- **Scripts**:
  - `dev` → arranca el servidor de desarrollo con Vite en el puerto 3000.
  - `build` → construye la versión de producción.
  - `preview` → sirve el build para probarlo en local.
  - `test` → ejecuta Vitest.
- **Dependencias clave**:
  - `@tanstack/react-start` → el framework "full-stack" (SSR, server functions…).
  - `@tanstack/react-router` → el router type-safe.
  - `@tanstack/router-plugin` → genera automáticamente el árbol de rutas.
  - `nitro` → motor de servidor (el mismo que usa Nuxt) que despliega en cualquier sitio.
  - `tailwindcss` + `@tailwindcss/vite` → estilos utility-first integrados con Vite.
  - `react` + `react-dom` en versión 19.

> **Idea para clase:** TanStack Start no es solo "React + router". Es un meta-framework: trae SSR, servidor (Nitro), router con tipado, devtools… todo integrado.

### `.cta.json`
Es la "tarjeta de presentación" que deja el CLI con las opciones que elegimos al crear el proyecto (`mode: file-router`, `tailwind: true`, `chosenAddOns: [nitro]`, etc.). Útil para recordar con qué configuración nació.

### `.gitignore`
Ignora lo típico (`node_modules`, `dist`, `.env`…) y, lo interesante, las carpetas de runtime de TanStack/Nitro: `.nitro`, `.tanstack`, `.output`, `.wrangler`, `.vinxi`.

### `README.md`
El README que genera el CLI con los comandos básicos. Recomendable leerlo, pero este documento (`ESTRUCTURA.md`) es más detallado.

---

## 2. Configuración: TypeScript y Vite

### `tsconfig.json`
Configuración estricta y moderna:

- `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`.
- `jsx: react-jsx` → no necesitamos importar React en cada fichero.
- `paths` → dos alias equivalentes para `src/`: **`#/*`** y **`@/*`**.
- `strict: true` y avisos contra variables/parámetros sin usar.

### `vite.config.ts`
Es el corazón del build. El orden de los plugins **importa**:

```ts
plugins: [
  devtools(),       // panel de devtools de TanStack
  nitro({ ... }),   // motor de servidor SSR
  tailwindcss(),    // Tailwind v4 nativo en Vite
  tanstackStart(),  // SSR, server functions, file-router…
  viteReact(),      // soporte React (debe ir tras tanstackStart)
]
```

> **Idea para clase:** No hay "webpack config" oculto. Todo lo que hace TanStack Start son plugins de Vite combinados.

---

## 3. Carpeta `public/`: lo que se sirve tal cual

- `favicon.ico`, `logo192.png`, `logo512.png` → iconos.
- `manifest.json` → manifiesto PWA (nombre de la app, colores, iconos).
- `robots.txt` → instrucciones para crawlers.

Todo lo que esté aquí se sirve **sin procesar** desde la raíz del dominio (`/favicon.ico`, `/logo192.png`…).

---

## 4. Carpeta `.vscode/`: ayudita para el editor

### `.vscode/settings.json`
Marca `src/routeTree.gen.ts` como:
- excluido del file watcher,
- excluido de la búsqueda,
- **read-only** en el editor.

¿Por qué? Porque ese fichero **lo regenera el plugin de TanStack Router cada vez que añadimos/quitamos rutas**. Si lo tocamos a mano, perdemos los cambios.

---

## 5. Carpeta `src/`: el código de la app

Aquí entramos en el meollo. El orden recomendado para explicarlo en clase:

### 5.1 `src/router.tsx` — el router de la app
```ts
export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })
  return router
}
```

- Importa **`routeTree`** del fichero autogenerado.
- Configura precarga "on intent" (al hacer hover sobre un link, ya se empieza a cargar la ruta).
- El `declare module` registra el tipo del router globalmente → **autocompletado y tipado en todos los `<Link to="...">`** del proyecto.

> **Idea para clase:** Aquí no se listan rutas a mano. Solo se configura el router; las rutas vienen de los ficheros.

### 5.2 `src/routeTree.gen.ts` — fichero AUTOGENERADO
Lo genera el plugin `@tanstack/router-plugin` leyendo `src/routes/`. Contiene:

- El árbol de rutas (`/`, `/about`).
- Los tipos `FileRoutesByFullPath`, `FileRouteTypes`… que dan tipado al router.

> **Regla de oro:** Nunca lo editamos a mano. Se regenera solo.

### 5.3 `src/routes/` — el file-based routing

La estructura de ficheros = estructura de URLs:

```
src/routes/
├── __root.tsx   →  layout raíz (envuelve a TODO)
├── index.tsx    →  ruta "/"
└── about.tsx    →  ruta "/about"
```

#### `src/routes/__root.tsx` — el layout principal
Es la ruta raíz de la que cuelgan las demás. Aquí está:

- El `<html>` y el `<body>` completos (SSR).
- El script inline que aplica el tema (`light`/`dark`/`auto`) **antes** de que React hidrate (para evitar flash).
- `<HeadContent />` → mete los `meta`/`title`/`links` definidos en `head`.
- `<Scripts />` → inyecta los scripts de cliente.
- `<Header />`, `{children}`, `<Footer />` → la estructura visual común.
- `<TanStackDevtools>` → panel de devtools en la esquina inferior derecha.

> **Idea para clase:** `{children}` es donde se renderiza la ruta hija (`index.tsx` o `about.tsx` según la URL).

#### `src/routes/index.tsx` — la home (`/`)
```ts
export const Route = createFileRoute('/')({ component: App })
```
- `createFileRoute('/')` declara que este fichero responde a la URL `/`.
- `component: App` → el componente que se renderiza.
- El resto es JSX con Tailwind: un hero, una grid de features y un bloque "Quick Start".

#### `src/routes/about.tsx` — página About (`/about`)
Idéntico patrón, pero con `createFileRoute('/about')`. Una pequeña sección de presentación.

> **Demo en clase:** Crear un fichero `src/routes/contact.tsx` con `createFileRoute('/contact')`. Al guardar, **el `routeTree.gen.ts` se actualiza solo** y `<Link to="/contact">` ya tiene autocompletado.

### 5.4 `src/components/` — componentes reutilizables

#### `src/components/Header.tsx`
- Usa **`<Link>` de TanStack Router** (no `<a>`).
- `activeProps={{ className: 'nav-link is-active' }}` → la clase se aplica solo si la URL coincide con la del link.
- Incluye el `<ThemeToggle />`.

#### `src/components/Footer.tsx`
Pie de página estático con iconos de X y GitHub.

#### `src/components/ThemeToggle.tsx`
Botón que cicla entre **light → dark → auto**:
- Lee el modo de `localStorage`.
- Aplica clases (`light`/`dark`) al `<html>` y un `data-theme` para CSS.
- Si el modo es `auto`, escucha el cambio de `prefers-color-scheme` del sistema.
- Como usa `window`/`localStorage`, hace los chequeos `typeof window === 'undefined'` para que el SSR no rompa.

### 5.5 `src/styles.css` — estilos globales y tokens
- Importa Tailwind v4 con `@import "tailwindcss";`.
- Importa fuentes de Google (Manrope, Fraunces).
- Define **CSS variables** (`--sea-ink`, `--lagoon`, `--surface`…) para los colores del tema.
- Tiene un bloque `:root[data-theme="dark"]` con los mismos tokens en oscuro → así el `ThemeToggle` solo cambia el atributo y los colores se actualizan automáticamente.

---

## 6. Resumen del flujo cuando entra una petición

1. Llega una request a `/about`.
2. **Nitro** (servidor) la recibe y arranca el SSR.
3. **`getRouter()`** crea el router con el `routeTree` generado.
4. El router busca en `routeTree.gen.ts` qué ruta corresponde a `/about` → `about.tsx`.
5. Se renderiza el árbol: `__root.tsx` (con `<Header>`, `<Footer>`, `<html>…`) y dentro, como `{children}`, el componente `About`.
6. Se envía HTML al navegador + se hidrata con React.
7. A partir de ahí, los `<Link>` navegan sin recargar (SPA-like), con precarga "on intent".

---

## 7. Orden sugerido para explicarlo en clase

1. **`package.json`** → "¿qué es esto y qué dependencias trae?"
2. **`vite.config.ts`** + **`tsconfig.json`** → "cómo se monta todo".
3. **`public/`** → "los assets estáticos".
4. **`.vscode/settings.json`** → "ojo, este fichero es autogenerado".
5. **`src/router.tsx`** → "aquí se configura el router".
6. **`src/routeTree.gen.ts`** → "esto NO se toca, se genera solo".
7. **`src/routes/__root.tsx`** → "el layout que envuelve todo".
8. **`src/routes/index.tsx`** y **`about.tsx`** → "una ruta = un fichero".
9. **`src/components/`** → Header, Footer, ThemeToggle.
10. **`src/styles.css`** → Tailwind + variables del tema.

Con este recorrido los alumnos ven primero **la foto global** (qué es el proyecto), luego **el motor** (Vite + TS), y por último **el código que ellos van a tocar** (rutas y componentes).

# PRD: Login pod (acceso propietario)

**Date**: 2026-06-02
**Mode**: validation + co-creation
**Status**: completed

## Problem Statement

La ruta `/login` existe pero es un placeholder (`<div>Hello "/login"!</div>`). Se necesita una
pantalla de **login para el propietario/admin** de la villa, que muestre un formulario con
**email + contraseña + botón de submit**. En esta fase el formulario **no autentica**: el
`onSubmit` es un no-op a la espera de cablear `better-auth` (la carpeta del proyecto es
`10-better-auth`).

Hallazgos de la exploración del codebase:

- **Arquitectura de pods** consistente: `xxx.pod.tsx` + `index.ts` (reexporta el pod) +
  `components/xxx.component.tsx` + `xxx.schema.ts`. La ruta es delgada y delega en el pod
  (ej. `routes/reserva.tsx` → `Booking`).
- **Formularios**: no existen forms "tontos". `GuestForm` usa **TanStack Form + Zod** con
  wrappers propios (`TextField`, `NumberField`, `TextareaField`) en `src/components/form`.
  Hay además una skill (`tanstack-form`) que **obliga** a ese patrón en `src/pods/**`.
- **`TextField`** reenvía cualquier prop de `<input>` (`type`, `autoComplete`, `placeholder`)
  y ya trae label + aria-* + manejo de error (blur/touched). No da toggle de visibilidad.
- **Estilo**: tokens CSS (`--sea-ink`, `--sea-ink-soft`, `--lagoon-deep`, `--sand`, `--card`),
  clases `island-shell`, `island-kicker`, `display-title`, `page-wrap`. Input estándar:
  `h-12 rounded-2xl`. Botón primario: `bg-[var(--lagoon-deep)]` `rounded-2xl` `hover:bg-[#246f76]`.
- **`__root.tsx`** renderiza `<Header>` y `<Footer>` (chrome de marketing) en **todas** las rutas.

## User Stories

1. Como propietario, quiero una pantalla de login con email y contraseña, para acceder a mi
   área de administración.
2. Como propietario, quiero que la pantalla esté centrada y limpia (sin la nav de marketing),
   para tener una experiencia clara de acceso.
3. Como propietario en móvil, quiero que el formulario sea responsivo y cómodo de rellenar,
   para poder entrar desde cualquier dispositivo.
4. Como propietario, quiero poder mostrar/ocultar la contraseña, para verificar que la escribí
   bien antes de enviar.
5. Como propietario, quiero que el formulario valide el email y la presencia de contraseña con
   feedback claro, para corregir errores antes de enviar.
6. Como usuario de lector de pantalla, quiero el formulario correctamente etiquetado y con
   `aria-*`, para poder usarlo de forma accesible.
7. (Futuro) Como propietario, quiero que al enviar credenciales válidas se inicie sesión vía
   better-auth y se me redirija a mi panel.

## Product / UX Decisions

- **Destinatario**: login de **admin/propietario** (no de huésped) — el flujo de reserva sigue
  siendo público; el login da acceso a la futura gestión (disponibilidad, bloqueos, reservas).
- **Identificador**: **email** (no "usuario") — coherente con el resto del proyecto (`GuestForm`
  usa email) y con better-auth, que autentica por email+password sin plugins extra.
- **Layout**: **card centrada** (`max-w-md`, centrada vertical y horizontalmente con
  `island-shell` / `rounded`), patrón clásico de login admin. Descartado el hero `page-wrap`.
- **Chrome**: **login limpio sin Header/Footer de marketing**, vía split de layout (ver técnicas).
- **Contraseña**: **con toggle de mostrar/ocultar** (icono `Eye`/`EyeOff` de lucide).
- **Extras**: **ninguno** en esta fase — solo email + contraseña + submit. Sin "recordar sesión"
  ni "¿olvidaste tu contraseña?".
- **Copy**: en español, tono coherente con el sitio (ej. título "Acceso propietario", botón
  "Entrar").

## Technical Decisions

- **Pod nuevo `src/pods/login/`** siguiendo la convención:
  - `login.pod.tsx` — componente `Login` (card centrada + copy + render del form).
  - `index.ts` — `export { Login } from "./login.pod"`.
  - `components/login-form.component.tsx` — `LoginForm` con TanStack Form.
  - `login-form.schema.ts` — Zod schema (`email`, `password`).
- **Formulario con TanStack Form + Zod** (opción A), reutilizando wrappers de
  `src/components/form`. `onSubmit` **no-op** por ahora (placeholder, p. ej. `console.log` o
  vacío) — cuando llegue better-auth solo se rellena el `onSubmit`. Cero retrabajo.
- **Campo contraseña con toggle**: crear **`PasswordField`** nuevo en `src/components/form`
  (no extender `TextField` para no ensuciar su API). Internamente:
  - Reutiliza el mismo estilado/markup que `TextField` (label, input `h-12 rounded-2xl`,
    aria-*, error en blur/touched que limpia en vivo).
  - Estado interno `show`/`hide`; botón con icono `Eye`/`EyeOff` posicionado dentro del input
    (`pr-12` + botón absoluto), `type` alterna `password`/`text`, `aria-label` en el botón.
  - `autoComplete="current-password"`. Exportarlo desde `src/components/form/index.ts`.
- **Email**: `<TextField type="email" autoComplete="username" inputMode="email">` (o
  `autoComplete="email"`), reutilizando el wrapper existente.
- **Schema Zod**: `email: z.email("Introduce un email válido")`,
  `password: z.string().min(1, "La contraseña es obligatoria")` (validación de presencia/formato;
  sin reglas de fuerza porque aún no hay backend que las imponga).
- **Split de layout (Opción 1) para quitar el chrome en `/login`**:
  - Crear **`routes/_app.tsx`** (pathless layout) que renderiza `<Header/> <Outlet/> <Footer/>`.
  - Mover `index.tsx`, `reserva.tsx`, `about.tsx` → `routes/_app/index.tsx`, etc.
  - `__root.tsx` se queda solo con `ToastProvider` + `<Outlet/>` (+ devtools/scripts); deja de
    forzar chrome global.
  - Login en grupo **`routes/(auth)/login.tsx`** — el paréntesis es route group: **no cambia la
    URL** (sigue `/login`), solo organiza y deja el login fuera del layout de marketing.
  - Regenerar `routeTree.gen.ts` (lo hace el plugin de router al arrancar dev/build).
- **Ruta `login.tsx` delgada**: solo `createFileRoute` + render de `<Login />` del pod.

## Testing Decisions

- **LoginForm (integración, Testing Library + Vitest)**: renderiza email, contraseña y submit;
  muestra error de email inválido tras blur y lo limpia al corregir; exige contraseña;
  el toggle alterna `type` del input password.
- **PasswordField (unit/integración)**: el botón alterna visibilidad y tiene `aria-label`
  correcto; el error aparece en blur/touched y limpia en vivo (mismo contrato que `TextField`).
- **Accesibilidad**: labels asociados (`htmlFor`/`id`), `aria-invalid`/`aria-describedby` en
  error, foco visible.
- **NO testear** ahora: la autenticación (no existe), navegación post-login, ni el split de
  rutas (responsabilidad del router).

## Out of Scope

- Lógica de autenticación real (better-auth): sign-in, sesión, tokens, cookies.
- Redirección post-login y protección de rutas del panel de propietario.
- Registro, recuperación de contraseña, "recordar sesión".
- Login por username/redes sociales/OTP.
- El propio panel/dashboard de administración.

## Discarded Alternatives

- **Campo "usuario" (username)**: descartado — better-auth usa email por defecto y el resto del
  proyecto ya usa email; "usuario" obligaría a plugin + refactor posterior.
- **Form "tonto" (inputs shadcn sin TanStack Form/Zod)**: descartado — rompe la convención del
  repo y la skill `tanstack-form`; sería deuda técnica reescrita al cablear auth.
- **Layout hero `page-wrap`** (como Booking): descartado — excesivo para un login; se prefiere
  card centrada.
- **Render condicional de Header/Footer en `__root`** (Opción 2): descartado — mete lógica de
  "qué ruta soy" en el root (smell) y escala peor que el split de layout cuando haya más
  pantallas de admin.
- **Mantener el chrome de marketing en `/login`** (Opción 3): descartado — un login de admin con
  la nav pública encima es incoherente.
- **Toggle de visibilidad extendiendo `TextField`**: descartado — ensucia la API del wrapper
  genérico; mejor un `PasswordField` dedicado.

## Assumptions

- El login alimentará better-auth con **email + password** (sin username plugin).
- Habrá más pantallas de admin protegidas en el futuro, que se colgarán del grupo `(auth)` o de
  un layout de dashboard — justifica el split de layout ahora.
- El plugin de router regenera `routeTree.gen.ts` automáticamente al mover/crear rutas.
- Los tokens y clases de estilo actuales (`island-shell`, `--lagoon-deep`, etc.) son la fuente de
  verdad del diseño y se mantienen.

## Risks

- **Mover `index/reserva/about` a `_app/`** puede romper imports/paths o el árbol de rutas si la
  regeneración no se hace bien; verificar que las URLs no cambian (`/`, `/reserva`, `/about`).
- **`(auth)` route group + pathless `_app`**: comprobar que TanStack Router resuelve `/login`
  fuera del layout y el resto dentro; riesgo de doble layout o de login heredando chrome si se
  configura mal.
- **`PasswordField`** debe replicar fielmente el contrato de errores de `TextField`
  (blur/touched + limpieza en vivo) para no divergir en UX entre campos.
- **autoComplete**: elegir mal los tokens puede degradar el autocompletado del gestor de
  contraseñas del navegador.

## Open Points

- [ ] ¿Dónde redirige el login tras autenticar (ruta del panel de propietario)? — se decidirá al
      cablear better-auth.
- [ ] ¿Se añadirá "¿olvidaste tu contraseña?" / "recordar sesión" en una fase posterior?
- [ ] ¿El área de admin tendrá su propio layout (sidebar/topbar) distinto del `_app` de marketing?

## Next Steps

- [ ] Ejecutar `prd-to-plan` para crear las fases de implementación (tracer bullets:
      1) split de layout `_app` + `(auth)`; 2) `PasswordField`; 3) pod `login` + schema + form).
- [ ] Tras el plan, `prd-to-issues` para generar issues en GitHub.
- [ ] Más adelante: PRD/issue para integrar **better-auth** (sign-in real + protección de rutas).

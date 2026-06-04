# PRD: Cabecera de intranet con usuario y logout

**Date**: 2026-06-03
**Mode**: validation
**Status**: completed

## Problem Statement

El layout de la intranet (`src/routes/(auth)/intranet/route.tsx`) hoy solo pinta un `<h1>Intranet - Welcome {name}</h1>` y el `<Outlet />`. Falta una cabecera real que dé identidad al panel y permita al usuario logueado salir de su sesión.

Se necesita una cabecera con:
- **Izquierda**: nombre de la aplicación.
- **Derecha**: nombre del usuario logueado + botón de logout.
- Al hacer logout: llamar a la API de Better Auth y redirigir a `/login`.
- Mismo estilo visual que el resto de la app y responsivo.

Hallazgos de la exploración del codebase:
- Existe `src/components/Header.tsx` (header **público**): pinta `villaName` + nav links + `ThemeToggle`, alimentado desde Content Island (CMS) vía el pod `layout`. Es para el sitio público, no para la intranet.
- La intranet protege con `loader: () => getUserSession()` (`src/core/user-session.ts`), un `createServerFn` que hace `throw redirect({ to: "/login" })` si no hay sesión. La sesión se resuelve **server-side**; no se usa `authClient.useSession` en cliente.
- El pod de login (`src/pods/login/login.pod.tsx`) ya marca el patrón: `authClient` (de `src/lib/auth-client.ts`) + `useToast` para errores + `useNavigate` de TanStack Router.
- Better Auth (docs online, v1.6.x): logout = `authClient.signOut({ fetchOptions: { onSuccess } })`, **solo cliente**.
- `ToastProvider` envuelve toda la app desde `__root.tsx`, por lo que `useToast` está disponible en la intranet.
- Botón shadcn disponible en `src/components/ui/button.tsx` con variantes (`outline`, `ghost`, `destructive`, ...). Iconos vía `lucide-react`.
- Tokens de estilo usados por el header público: `var(--header-bg)`, `var(--line)`, `var(--sea-ink)`, clase `page-wrap`, `sticky top-0 z-50`, `backdrop-blur-lg`.

## User Stories

1. Como usuario logueado, quiero ver el nombre de la aplicación en la cabecera de la intranet, para tener contexto de dónde estoy.
2. Como usuario logueado, quiero ver mi nombre en la cabecera, para confirmar con qué cuenta estoy operando.
3. Como usuario logueado, quiero un botón de logout claro, para cerrar mi sesión cuando termine.
4. Como usuario, al pulsar logout quiero que se cierre la sesión en Better Auth y se me redirija a `/login`, para no quedarme en una vista protegida sin sesión válida.
5. Como usuario, quiero feedback visual mientras se cierra la sesión (estado "Saliendo...") y un aviso si algo falla, para no pulsar dos veces ni quedarme sin saber qué pasó.
6. Como usuario en móvil, quiero una cabecera limpia que no se rompa con nombres largos, para una experiencia usable en pantalla pequeña.

## Product / UX Decisions

- **Layout**: nombre de app a la izquierda; usuario + logout a la derecha — según petición.
- **Nombre de usuario en móvil**: mostrar **icono de usuario** (lucide) siempre; el **nombre** se oculta en móvil y aparece desde el breakpoint `sm` hacia arriba (icono solo en móvil, icono+nombre en desktop) — evita overflow con nombres largos y queda más pulido.
- **Botón de logout**: `variant="outline"` + icono `LogOut` (lucide) + texto "Cerrar sesión" — discreto, encaja en un header, no compite con CTAs primarios.
- **Feedback de logout**: estado de carga (botón deshabilitado + texto "Saliendo...") durante el `signOut`, y **toast de error** si falla — coherente con el patrón del pod de login.
- **ThemeToggle**: NO se incluye en la cabecera de intranet (fuera de scope) — se mantiene minimalista, centrada en app name + usuario + logout.
- **Estilo**: replicar el lenguaje visual del header público (tokens `--header-bg`, `--line`, `--sea-ink`, `page-wrap`, sticky + backdrop-blur) para coherencia con el resto de la app.

## Technical Decisions

- **Arquitectura**: **componente nuevo separado** (p.ej. `src/components/IntranetHeader.tsx`), sin tocar `Header.tsx` público — mínimo acoplamiento, sin arrastrar dependencia del CMS ni nav links que no aplican a la intranet.
- **Nombre de la app**: **constante hardcoded** (literal en código) — la intranet no carga contenido de CMS hoy; evita añadir loaders/llamadas extra.
- **Flujo de logout**: `authClient.signOut({ fetchOptions: { onSuccess } })` y luego `navigate({ to: "/login" })`. Como se navega a una ruta pública, el `loader` de intranet no se re-ejecuta; **no** se llama a `router.invalidate()` ni se migra el guard.
- **Datos de usuario**: el nombre sale de `session.user.name` (ya disponible vía `Route.useLoaderData()` en `route.tsx`); se pasa como prop al `IntranetHeader`.
- **Interactividad**: el `IntranetHeader` (o un subcomponente de logout) gestiona estado de carga con `useState`; usa `authClient` de `@/lib/auth-client`, `useNavigate` y `useToast`.
- **Iconos**: `lucide-react` (`User`/`UserCircle` y `LogOut`).

## Testing Decisions

- **Logout (happy path)**: al pulsar el botón se invoca `authClient.signOut` y, en `onSuccess`, se navega a `/login`. Mockear `authClient.signOut` y `useNavigate`; verificar la llamada y el destino.
- **Logout (error)**: si `signOut` falla, se muestra toast de error y NO se navega; el botón vuelve a estar habilitado. Mockear `signOut` para que rechace.
- **Estado de carga**: durante el `signOut` el botón está deshabilitado y muestra "Saliendo...".
- **Render de cabecera**: muestra el nombre de la app (constante) y el nombre de usuario recibido por prop.
- **Responsive**: el nombre de usuario está oculto en móvil (clase de breakpoint) y visible en `sm+` — verificar presencia de la clase / del icono siempre visible.
- **NO testear**: estilos exactos / tokens CSS, internals de Better Auth, el `ToastProvider` (ya cubierto a nivel app).

## Out of Scope

- ThemeToggle en la cabecera de intranet.
- Cargar el nombre/branding desde el CMS (Content Island) para la intranet.
- Migrar el guard de auth de `loader` a `beforeLoad`.
- `router.invalidate()` / gestión avanzada de caché de sesión cliente.
- Avatar con imagen real del usuario (solo icono lucide).
- Menú desplegable de usuario (perfil, ajustes, etc.).
- Nav links dentro de la intranet.

## Discarded Alternatives

- **Reutilizar/extender `Header.tsx` público**: descartado — acoplaría la intranet al CMS y a nav links que no aplican, complicando un componente hoy simple.
- **Pod de layout de intranet**: descartado por ahora — más boilerplate del necesario para una sola cabecera; un componente basta.
- **Nombre de app desde CMS (villaName) / logo+marca**: descartado — requeriría un loader/llamada al CMS inexistente en la intranet; constante hardcoded es suficiente.
- **`router.invalidate()` tras signOut**: descartado — innecesario al navegar a ruta pública, y hay un issue conocido de TanStack donde redirects en `loader` (no `beforeLoad`) pueden no dispararse tras invalidar.
- **Migrar guard a `beforeLoad`**: descartado — amplía scope más allá del header (aunque es la recomendación de las docs de TanStack para guards de auth; ver Open Points).
- **Logout con `variant="destructive"`**: descartado — demasiado agresivo para una acción rutinaria.
- **Logout solo icono (`ghost`)**: descartado — menos descubrible que outline + texto.

## Assumptions

- `session.user.name` siempre está poblado para usuarios logueados (si pudiera faltar, habría que fallback a `email`).
- `authClient.signOut` con `fetchOptions.onSuccess` se comporta como documenta Better Auth v1.6.x.
- El usuario accede mayoritariamente desde dominio propio; `baseURL` del `auth-client` apunta a `http://localhost:3000` (hoy hardcoded; pendiente de env var según comentario en `auth-client.ts`, pero fuera de este scope).

## Risks

- **Doble click en logout**: mitigado con el estado deshabilitado durante el `signOut`.
- **Quedarse en vista protegida si falla la navegación tras signOut**: si `onSuccess` no dispara o `navigate` falla, el usuario podría quedar en la intranet sin sesión válida; el guard del `loader` lo recuperaría en la siguiente navegación, pero conviene verificar el flujo.
- **Nombres de usuario muy largos**: mitigado ocultando el nombre en móvil; en desktop convendría asegurar truncado si fuese necesario.

## Open Points

- [ ] (Futuro) Evaluar migrar el guard de auth de `loader` a `beforeLoad` para robustez general de la protección de rutas.
- [ ] (Futuro) Mover `baseURL` del `auth-client` a variable de entorno de cliente.
- [ ] (Futuro) Considerar menú de usuario (perfil/ajustes) si crece la intranet.

## Next Steps

- [ ] Implementar el `IntranetHeader` y conectarlo en `src/routes/(auth)/intranet/route.tsx`.
- [ ] (Opcional) Ejecutar `prd-to-plan` para fases de implementación — aunque el alcance es pequeño y podría implementarse directamente.
- [ ] (Opcional) `prd-to-issues` si se quiere trackear en GitHub.

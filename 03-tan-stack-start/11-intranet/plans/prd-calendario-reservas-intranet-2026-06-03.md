# PRD: Calendario de reservas en la intranet (Paso 1 — visualización protegida)

**Date**: 2026-06-03
**Mode**: co-creation
**Status**: completed

## Problem Statement

El propietario autenticado necesita ver, dentro de la intranet, un **calendario mensual con la ocupación de su villa** (reservas y bloqueos de "no disponible"). Hoy la intranet (`/intranet`) solo tiene un placeholder ("Hello"). La visión completa incluye hover con tooltip, panel de detalle (derecha en escritorio / abajo en móvil), edición, cambio de estado y borrado de reservas — pero se construirá **por pasos**.

**Este PRD cubre el Paso 1**: pintar el calendario con las reservas/bloqueos del mes, sirviéndose de una **server function protegida por auth** que **no se pueda invocar desde Postman** sin sesión válida.

### Descubierto en la exploración del codebase

- **Stack**: TanStack Start + React 19 + MongoDB driver 7.2 + Better Auth 1.6 + TanStack Form + Zod 4 + ShadCN + Tailwind v4 + Lucide.
- **Datos**: colección `calendarBlocks` (BD `calendar-availability`). Documentos con `type: "booking"` (status `pending`/`confirmed`/`cancelled`) o `type: "block"` (con `subtype`, p.ej. `owner_use`, y `notes.internal`). `villa_001` está hardcodeado como `PROPERTY_ID`.
- **Ya existe** una server function **pública** `getAvailabilityByMonth` (`src/pods/home/availability.api.ts`) que consulta `calendarBlocks` pero **recorta** los datos (solo `confirmed/pending`, sin guest/precio/pago). No sirve para la intranet: el dueño necesita el detalle completo. → Nueva server function **protegida**.
- **Auth**: Better Auth + `getUserSession()` (`src/core/user-session.ts`). La ruta `/(auth)/intranet` se protege con un `loader`. **Riesgo clave detectado**: el loader protege la *página*, NO la *server function* (esta se expone como endpoint RPC `/_serverFn/...` accesible desde Postman). El guard de sesión debe vivir dentro del handler / en un middleware.
- **Patrón de carga**: el repo NO usa TanStack Query; usa **loaders de ruta con search params** (ver `_app/reserva.tsx`).
- **Convenciones de pod**: `*.api.ts` (server fn), `*.vm.ts` (view model), `*.mapper.ts`, `*.model.ts`, `*.pod.tsx`, `*.component.tsx`, `*.schema.ts`, `index.ts`. Recordatorio del proyecto: server functions en `*.api.ts` (nunca `*.server.*`) y usan `.inputValidator()` (no `.validator()`).
- **ShadCN instalado**: `button`, `card`, `calendar` (react-day-picker), `carousel`, `dialog`, `dropdown-menu`, `toast`. **No** instalados: `tooltip`, `sheet`, `drawer` (harán falta en pasos posteriores).

## User Stories

1. Como **propietario autenticado**, quiero ver un calendario mensual con las reservas y bloqueos de mi villa, para tener de un vistazo la ocupación del mes.
2. Como **propietario**, quiero distinguir visualmente por color el tipo y estado de cada ocupación (reserva confirmada, pendiente, bloqueo), para entender el estado de un vistazo sin abrir nada.
3. Como **propietario**, quiero navegar al mes anterior/siguiente, para revisar ocupación pasada y futura.
4. Como **propietario**, quiero que al entrar en `/intranet` se muestre el mes actual, para empezar en un contexto predecible.
5. Como **propietario**, quiero ver un estado vacío claro cuando un mes no tiene ocupación, para no confundirlo con un error de carga.
6. Como **dueño del negocio**, quiero que los datos sensibles de mis huéspedes (email, teléfono, precios, pagos) **solo** sean accesibles con sesión válida, para que nadie pueda extraerlos llamando al endpoint directamente (p.ej. desde Postman).

### Visión completa (pasos futuros, fuera del Paso 1)

7. Como propietario, quiero un **tooltip** al hacer hover sobre una ocupación con su info resumida.
8. Como propietario, quiero hacer **click** en una ocupación y ver su **detalle** (a la derecha en escritorio, abajo en móvil).
9. Como propietario, quiero **editar** una reserva, **cambiar su estado** y **eliminarla**.
10. Como propietario, quiero que al **editar un bloqueo** (`type: block`) los campos obligatorios sean distintos a los de una reserva (un bloqueo no tiene huésped ni precio).

## Product / UX Decisions

- **Render del calendario**: **grid mensual custom con barras** (estilo Google Calendar), donde cada ocupación es una barra que abarca sus días — porque da la mejor UX para eventos multi-día + (futuro) tooltip/click por ocupación, encaja 100% con ShadCN/Tailwind v4 y no añade dependencias.
- **Qué se muestra**: reservas `confirmed`/`pending` **y** bloqueos (`type: block`). **Las canceladas NO se muestran** en el Paso 1 — porque dan ruido y, al excluirlas con una sola propiedad, las ocupaciones nunca se solapan (no se puede doble-reservar) → grid de una sola "fila" de barras, sin carriles.
- **Contenido de cada barra**: **solo color** por tipo/estado (sin texto). Limpio, compacto y mejor para móvil; el detalle irá en tooltip/panel en pasos siguientes. Mapa de color propuesto: `confirmed` = verde/primary, `pending` = ámbar, `block` = gris neutro con patrón rayado ("no disponible").
- **Mes inicial y navegación**: abre en el **mes actual** con navegación **‹ ›** (y botón "Hoy"). Predecible y estándar.
- **Ubicación**: el calendario **es la home de `/intranet`** (el `index`), pero **encapsulado en un pod propio** que la ruta invoca (la ruta solo orquesta; el pod contiene la lógica/UI).
- **Estados**: vacío ("Sin reservas ni bloqueos este mes"); carga; error con opción de reintento.

## Technical Decisions

- **Server function protegida con middleware reutilizable de auth**: crear un `createMiddleware` que valide la sesión (Better Auth) y la inyecte; aplicarlo a la nueva server function de la intranet. DRY y reutilizable por las server functions futuras (editar/borrar/estado). Ante petición **sin sesión válida → responde 401** (no redirect), que es lo correcto para un endpoint de datos. Esto cierra el agujero de Postman: el guard vive en el handler, no en el loader.
- **Nueva server function `getBookingsByMonth` (protegida)** en un pod nuevo (p.ej. `src/pods/intranet-calendar/`), siguiendo convenciones: `*.api.ts`, validada con Zod vía `.inputValidator()`, input `{ year, month }`. Query a `calendarBlocks` filtrando `propertyId: villa_001`, `type/status` según las reglas (excluir `cancelled`), y solapando el rango del mes (`startDate < monthEnd && endDate > monthStart`).
- **VM con detalle completo (futuro-proof)**: el mapper devuelve un VM rico con todo el documento (`guest`, `occupancy`, `price`, `payment`, `notes`, `subtype`, fechas, `nights`, `type`, `status`, `id`). Como la fn está protegida, no hay fuga; y los pasos de tooltip/panel/edición no tendrán que tocar el backend. (El `CalendarBlockVm` mínimo actual del pod `home` se queda para la home pública; el de la intranet es uno nuevo y más rico.)
- **Carga vía search params + loader (SSR)**: `?year=&month=` en la URL; el loader de la ruta `/intranet` index re-ejecuta `getBookingsByMonth` al cambiar de mes. Consistente con el patrón del repo, SSR del primer render, navegación back/forward y estado compartible por URL. Validación de search params con Zod (como en `reserva.tsx`), con default al mes actual.
- **Manejo de fechas como fechas-solo en UTC**: los documentos guardan medianoche UTC. El render debe tratar las fechas en UTC (sin desfase por zona horaria local) para no "comerse"/desplazar días en el grid.
- **Render de barras por segmentos de semana**: una ocupación que cruza el límite de una semana en el grid se parte en segmentos por fila (mecánica de render estándar).

## Testing Decisions

- **Seguridad de la server function (lo más importante)**: test que verifica que `getBookingsByMonth` **rechaza (401)** cuando no hay sesión válida, y responde cuando sí la hay. Es el requisito central del Paso 1 (anti-Postman).
- **Mapper**: unit tests del `*.mapper.ts` — booking completo, booking con campos opcionales, y `block` (sin guest/price, con subtype/notes) mapean correctamente al VM.
- **Lógica de query/rango**: test de que el filtro de mes incluye ocupaciones que solapan el borde del mes y excluye `cancelled`.
- **Utilidad de fechas/semana**: tests de la función que parte ocupaciones en segmentos de semana y de la normalización UTC (caso borde: reserva que empieza/termina en cambio de mes y en cambio de semana).
- **NO testear en Paso 1**: render pixel-perfect del grid, tooltip/panel (no existen aún).

## Out of Scope (Paso 1)

- Tooltip en hover (Paso 2).
- Click → panel de detalle (derecha en escritorio / abajo en móvil) (Paso 3).
- Editar reserva, cambiar estado, eliminar (Pasos posteriores).
- Campos obligatorios diferenciados booking vs block (relevante al editar, no al visualizar).
- Mostrar reservas `cancelled`.
- Multi-propiedad / selector de propiedad (se mantiene `villa_001` hardcodeado).
- Texto/nombre del huésped dentro de la barra.

## Discarded Alternatives

- **react-day-picker (ShadCN `calendar`) para los eventos**: descartado — está pensado para *seleccionar fechas*, no para pintar eventos multi-día; tooltip y click por-ocupación serían forzados y los rangos solapados se ven mal.
- **Librería de calendario (react-big-calendar / FullCalendar)**: descartada — dependencia pesada y su estilado choca con el design system ShadCN/Tailwind v4.
- **Multi-propiedad desde ya**: descartada para el Paso 1 — el dueño gestiona una sola villa; añadiría modelo de datos user→properties que no existe.
- **Mostrar canceladas**: descartada en Paso 1 — añade ruido y obliga a layout en carriles por posibles solapes.
- **Guard de auth inline en cada handler**: descartado a favor del middleware reutilizable (evita repetición en las server functions futuras).
- **Estado en cliente + fetch**: descartado — rompe el patrón del repo (loaders/search params), sin SSR del primer render ni estado en URL.
- **VM mínimo (YAGNI)**: descartado — obligaría a reabrir la server function/mapper en el siguiente paso; con la fn protegida no hay coste de seguridad en devolver el detalle.

## Assumptions

- Con una sola propiedad y sin mostrar canceladas, **dos ocupaciones nunca solapan fechas** → no se necesita layout en carriles. (Si en el futuro se muestran canceladas o se va multi-propiedad, hay que revisarlo.)
- `villa_001` es la única propiedad relevante y seguirá hardcodeada de momento.
- El usuario autenticado (cualquier sesión válida) es "el propietario" y puede ver todas las ocupaciones de la villa (no hay roles/permisos por usuario en el Paso 1).
- La colección `calendarBlocks` es la fuente de verdad tanto de reservas como de bloqueos.

## Risks

- **Solapes futuros**: si se reintroducen canceladas o multi-propiedad, el grid de una sola fila se rompe y habrá que implementar carriles (lanes). Anotado.
- **Zona horaria**: el render con fechas locales en vez de UTC desplazaría días en el calendario — bug sutil y muy visible si no se trata desde el inicio.
- **Seguridad de server functions**: olvidar el middleware en alguna server function futura reabre el agujero de Postman. El middleware reutilizable mitiga, pero requiere disciplina de aplicarlo siempre.
- **Acoplamiento del VM rico**: devolver `payment`/`price` completos exige asegurarse de que la fn esté SIEMPRE protegida (nunca reutilizar el mismo mapper en una fn pública).

## Open Points

- [ ] Mapa de color exacto y tokens del design system para `confirmed`/`pending`/`block` (propuesta: verde/ámbar/gris rayado — confirmar contra `styles.css`).
- [ ] Forma exacta del 401 del middleware (lanzar `Response`/error tipado) y cómo lo consume el loader vs el cliente.
- [ ] (Futuro) Definir esquema de campos obligatorios diferenciado booking vs block para la edición.
- [ ] (Futuro) Componentes ShadCN a instalar para pasos siguientes: `tooltip`, `sheet`/`drawer`.

## Next Steps

- [ ] Ejecutar `prd-to-plan` para crear las fases de implementación (tracer-bullet) del Paso 1.
- [ ] Luego `prd-to-issues` para generar los issues de GitHub.
- [ ] (Opcional) `ui-design` si se quiere mockear el grid/colores en Pencil antes de implementar.

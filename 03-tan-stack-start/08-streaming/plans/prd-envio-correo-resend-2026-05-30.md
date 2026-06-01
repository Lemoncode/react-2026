# PRD: Envío de correo de solicitud de reserva con Resend

**Date**: 2026-05-30
**Mode**: validation (con huecos co-creados)
**Status**: completed

## Problem Statement

Hoy, al enviar el formulario válido de `/reserva`, solo se hace `console.log` del
payload (`{ dates, guest }`). Como último paso, queremos que **si el formulario es
correcto** se envíe un **correo al dueño de la propiedad** con los datos de la
reserva, usando **Resend**.

El flujo: una **server function** (backend) que envía el correo, llamada desde el
frontend al pulsar "Solicitar reserva", pasando los datos del formulario. Hay que
crear las **variables de entorno** de Resend, definir el **correo por defecto para
pruebas**, y documentar **dónde va el token**.

**Descubierto en la exploración del codebase:**

- Patrón de server functions: `createServerFn({ method }).inputValidator(zod).handler(...)`
  en ficheros `*.api.ts` (memoria del proyecto: `*.server.*` rompe el build; y es
  `.inputValidator`, no `.validator`).
- Entorno: se lee con `process.env.X` en servidor (`mongodb.ts`, `content-island.ts`).
  `.env` está **gitignoreado**; `.env.example` se commitea con las claves vacías.
- `resend` **no está instalado**.
- El formulario ya valida con `guestFormSchema` (Zod) y muestra toasts (Radix/shadcn)
  vía `useToast`; el toast actual tiene variantes `default` y `error`.

> 🚩 **Restricción de Resend (modo test).** Sin un dominio verificado, Resend solo
> entrega correos a la **dirección de la propia cuenta** y obliga a usar
> `onboarding@resend.dev` como remitente. Por eso el "correo por defecto para
> pruebas" (`OWNER_EMAIL`) **debe ser el email de tu cuenta de Resend**, o no
> llegará nada.

## Dónde va el token de Resend

- El token se genera en el **dashboard de Resend → API Keys**.
- Se guarda en **`.env`** (gitignoreado) como **`RESEND_API_KEY`**. Nunca se
  commitea.
- En **`.env.example`** se añade la clave vacía como documentación.

## User Stories

1. Como dueño, quiero recibir un correo cuando alguien solicita una reserva, para
   poder contactar al huésped y confirmar.
2. Como dueño, quiero ver en el correo los datos del huésped **y las fechas**, para
   decidir sin pedir más información.
3. Como dueño, quiero poder **responder directamente** al huésped desde el correo
   (replyTo), para agilizar.
4. Como huésped, quiero ver que mi solicitud se está enviando y si tuvo éxito o
   falló, para saber si llegó.
5. Como desarrollador, quiero re-validar en el servidor, para no confiar en el
   cliente.

## Product / UX Decisions

- **Modo test de Resend (sin dominio):** remitente `RESEND_FROM_EMAIL`
  (default `onboarding@resend.dev`); destinatario `OWNER_EMAIL` (= tu email de
  cuenta Resend).
- **Payload del correo:** datos del huésped **+ fechas** de la reserva
  (`from`, `to`, `nights`).
- **UX del submit:** botón usa `form.state.isSubmitting` → "Enviando…" deshabilitado
  mientras envía (evita doble envío); **éxito → toast verde** + `form.reset()`;
  **error → toast roja**. El usuario permanece en la página.
- **Formato del correo:** **HTML simple** (datos legibles en lista/tabla),
  `replyTo` = email del huésped. Asunto: "Nueva solicitud de reserva — {nombre}
  ({fechas})".
- **Toast:** se añade una variante **`success`** (verde) al componente existente.

## Technical Decisions

- **Dependencia:** instalar `resend`.
- **Variables de entorno (3):**
  - `RESEND_API_KEY` — token (en `.env`, gitignoreado).
  - `OWNER_EMAIL` — destinatario; en pruebas = tu email de cuenta Resend.
  - `RESEND_FROM_EMAIL` — remitente; default `onboarding@resend.dev` (configurable
    para cuando se verifique un dominio).
  - Añadir las tres a `.env` y `.env.example`.
- **Cliente Resend:** `src/lib/resend.ts` (init leyendo `RESEND_API_KEY`, estilo
  `mongodb.ts`/`content-island.ts`).
- **Server function:** `src/pods/booking/booking.api.ts` → `sendBookingRequest`,
  `createServerFn({ method: "POST" })` con `.inputValidator(schema.parse)`.
  - **Schema de entrada:** reutiliza `guestFormSchema` extendido con las fechas
    (`from`, `to` como ISO `YYYY-MM-DD`, `nights` entero ≥ mínimo) → **re-validación
    completa en backend**.
  - El handler construye el HTML y llama a Resend (`from`, `to`, `replyTo`,
    `subject`, `html`); si Resend devuelve error, lanza para que el frontend lo
    muestre.
- **Orquestación frontend:** `booking.pod` (que tiene las fechas) pasa a `GuestForm`
  un `onSubmit` **async** que invoca `sendBookingRequest({ ...guest, from, to,
  nights })`. `GuestForm` hace `await` dentro del `onSubmit` de TanStack
  (`isSubmitting` cubre la espera); en éxito: toast verde + `form.reset()`; en
  error (throw): toast roja.
- **Método POST** por ser una mutación con efecto colateral.

## Testing Decisions

- **Schema de entrada de la server fn:** unit — rechaza guest inválido y fechas
  ausentes/mal formadas; acepta payload completo válido.
- **Construcción del correo:** test del builder de HTML/asunto/replyTo a partir del
  payload (sin llamar a Resend real; mock del cliente).
- **Flujo de submit (integración):** éxito → toast verde + form reseteado + botón
  rehabilitado; error (Resend rechaza) → toast roja + form intacto.
- **No testear:** entrega real de Resend ni plantilla visual exacta.

## Out of Scope

- Persistir la solicitud en MongoDB (solo correo).
- Verificar un dominio propio en Resend (se hará al pasar a producción).
- Correo de confirmación al huésped (solo al dueño por ahora).
- Reintentos/cola si Resend falla (se muestra error y ya).

## Discarded Alternatives

- **Verificar dominio ahora:** descartado — se usa modo test sin DNS para iterar ya.
- **Payload solo huésped (sin fechas):** descartado — el correo quedaría poco útil.
- **Éxito → redirigir a confirmación / solo toasts sin reset:** descartado — se
  resetea el form y se permanece en la página.
- **Texto plano:** descartado — HTML simple con replyTo.
- **FROM hardcoded (2 env vars):** descartado — `RESEND_FROM_EMAIL` configurable.

## Assumptions

- `OWNER_EMAIL` en pruebas será el email de la cuenta Resend (si no, Resend
  rechaza y se verá la toast de error).
- En dev, las server functions tienen acceso a `process.env` (igual que la conexión
  Mongo actual).
- `guestFormSchema` es reutilizable/extensible para el input del backend.

## Risks

- **Entrega en modo test:** si `OWNER_EMAIL` no coincide con la cuenta Resend, no
  llega el correo (esperado; surface vía toast de error).
- **Secreto en cliente:** asegurar que `RESEND_API_KEY` solo se usa en el handler
  de la server function (servidor), nunca en bundle de cliente.
- **Doble envío:** mitigado por `isSubmitting` + botón deshabilitado.
- **Errores de red/Resend:** se propagan como throw → toast roja; sin reintentos.

## Open Points

- [ ] Verificar dominio en Resend para producción (remitente propio, destinatario libre).
- [ ] ¿Correo de confirmación también al huésped?
- [ ] ¿Persistir la solicitud (bloqueo `pending` en el calendario)?

## Next Steps

- [ ] Implementar: instalar `resend` → env vars + `.env.example` → `lib/resend.ts`
      → `booking.api.ts` (`sendBookingRequest`) → variante `success` del toast →
      cablear el submit async en `booking.pod`/`GuestForm`.
- [ ] Run `prd-to-plan` si se quiere desglosar en fases formales.

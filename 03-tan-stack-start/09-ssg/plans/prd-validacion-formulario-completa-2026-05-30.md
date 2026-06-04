# PRD: Validación completa del formulario de reserva (todos los campos)

**Date**: 2026-05-30
**Mode**: validation (con huecos co-creados)
**Status**: completed

## Problem Statement

Tras validar el campo **nombre** (TanStack Form + Zod, ver
`prd-validacion-formulario-nombre-2026-05-29.md`), queremos **completar la
validación de todos los campos** del formulario de huésped en `/reserva`
(`src/pods/booking/components/guest-form.component.tsx`):
apellido, email, teléfono, número de huéspedes y comentarios.

Para cada campo: mensaje de error **debajo** que **desaparece al corregir**, y al
pulsar **"Solicitar reserva"** con el formulario inválido, un **aviso (toast)**
para que el usuario revise los campos (usando los componentes shadcn del repo).

**Estado actual (descubierto):**

- Solo existe el wrapper `TextField` (`src/components/form/`) y el schema
  (`guest-form.schema.ts`) solo valida `firstName`.
- El formulario es **híbrido temporal**: `firstName` con TanStack Form; el resto
  son inputs nativos leídos por `FormData` en el submit.
- El **toast de submit inválido ya existe**: `onSubmitInvalid` dispara una toast
  roja (Radix, estilo shadcn) y TanStack bloquea el envío. → ese requisito ya
  está esencialmente cubierto; se mantiene.
- La **capacidad de la villa** solo existe como *texto libre* de feature en el
  CMS ("8 huéspedes"), no como número estructurado → no se usa para acotar.

## User Stories

1. Como huésped, quiero que cada campo me avise si está mal, para corregir antes
   de enviar.
2. Como huésped, quiero que el error de cada campo **desaparezca al corregir**,
   para feedback inmediato.
3. Como huésped, quiero que comentarios sea opcional, para no estar obligado a
   escribir algo.
4. Como huésped, quiero que al enviar con errores se me avise con una **toast** y
   no se envíe, para no perder lo escrito.
5. Como desarrollador, quiero **wrappers por tipo de control** reutilizables, para
   no duplicar la lógica de error/accesibilidad.
6. Como desarrollador, quiero **eliminar el híbrido `FormData`**, para tener un
   único paradigma (TanStack Form) en el formulario.

## Product / UX Decisions

- **Obligatorios:** nombre, apellido, email, teléfono, nº de huéspedes.
  **Opcional:** comentarios.
- **Reglas por campo:**
  - **Nombre** (existente): requerido + mínimo 2 (trim).
  - **Apellido:** requerido + mínimo 2 (trim).
  - **Email:** requerido + email válido (`z.email`).
  - **Teléfono:** *laxo* — requerido (no vacío, trim) + longitud mínima (~7). Sin
    regex estricta; acepta formatos variados.
  - **Huéspedes:** entero ≥ 1, **sin tope** (coherente con no depender del CMS).
  - **Comentarios:** opcional + **máximo 500 caracteres**.
- **Timing del error (igual que nombre):** validar `onChange` + `onBlur`; el error
  solo se muestra si el campo fue tocado o se intentó enviar, y **se borra en vivo**
  al corregir. Todos los wrappers comparten esta lógica.
- **Submit inválido:** se mantiene el comportamiento actual — TanStack bloquea el
  envío, errores bajo cada campo, y **toast roja** (`useToast`, Radix/shadcn) con
  "Hay errores en el formulario. Revisa los campos.".
- **Accesibilidad (no negociable, igual que nombre):** `<label htmlFor>`, `id`
  único (`useId`), error en `<p role="alert">` enlazado por `aria-describedby`,
  `aria-invalid`, borde `border-destructive`.

## Technical Decisions

- **Wrappers por tipo de control** (no uno por campo):
  - **Reutilizar `TextField`** para apellido, email y teléfono (mismo `<input>`,
    cambia `type` y la regla Zod).
  - **Crear `TextareaField`** (`src/components/form/textarea-field.component.tsx`)
    para comentarios, siguiendo el patrón del `TextField` (props `form/name/label/
    id/classNames`, `useId`, `showError`, `role="alert"`, `aria-*`), control
    `<textarea>` con `rows` y `maxLength`.
  - **Crear `NumberField`** (`src/components/form/number-field.component.tsx`)
    para huéspedes: `<input type="number">`, `value` numérico
    (`field.handleChange(event.target.valueAsNumber)`), `min` configurable.
  - Añadir ambos al barrel `src/components/form/index.ts` con sus tipos
    (`TextareaFieldProps/ClassNames`, `NumberFieldProps/ClassNames`).
- **Ampliar el schema** `guest-form.schema.ts` con todos los campos y mensajes en
  español; `type GuestFormValues = z.infer<...>` pasa a cubrir el formulario
  completo. `guests` como `z.number().int().min(1)` con mensaje claro para
  vacío/NaN; `comments` como `z.string().trim().max(500).optional()` (o default
  `""`).
- **Completar la migración (eliminar híbrido):** `useForm` con `defaultValues` de
  todos los campos (`guests: 1`, resto `""`); `onSubmit` usa `value` directamente
  para el `console.log`; se elimina `formRef`/`FormData`, el helper local `Field`
  y `fieldClassName` (su estilo ya vive en los wrappers).
- **Toast:** sin cambios estructurales; se reutiliza el `ToastProvider`/`useToast`
  ya montado en `__root`.
- **Sigue la skill `tanstack-form`** (ya alineada con este repo) para los nuevos
  wrappers y el cableado.

## Testing Decisions

- **Schema (`guest-form.schema.ts`):** unit por campo — apellido vacío/1 char →
  error; email inválido → error; teléfono corto/vacío → error; guests 0/decimal/
  vacío → error; comentarios >500 → error, vacío → válido; payload completo válido.
- **`TextareaField` y `NumberField`:** integración — error no aparece antes de
  blur/submit; aparece tras blur inválido; **desaparece al corregir**; `aria-invalid`/
  `aria-describedby`/`role="alert"` correctos; `NumberField` entrega `number`.
- **Submit inválido:** con cualquier campo mal → no se llama al `console.log`,
  aparece la toast y los errores bajo los campos.
- **Submit válido:** todos los campos válidos → `console.log` con el payload
  completo tipado por `GuestFormValues`.
- **No testear:** estilos exactos ni el envío de correo.

## Out of Scope

- Envío real del correo al dueño / validación en servidor.
- Acotar `guests` por la capacidad real de la villa (texto libre en el CMS).
- Toast/feedback de **éxito** al enviar (solo `console.log` por ahora).
- Mover los mensajes de error al CMS.

## Discarded Alternatives

- **Un wrapper por campo (NameField, EmailField…):** descartado — más código y
  acoplamiento; `TextField` ya cubre todos los inputs de texto vía `type`.
- **Reutilizar `TextField` también para huéspedes (type=number + coerción):**
  descartado a favor de un `NumberField` dedicado que entrega un `number` real.
- **Teléfono con regex / E.164 estricto:** descartado — se eligió laxo (no vacío +
  longitud mínima) para no añadir fricción.
- **Acotar huéspedes con máximo fijo:** descartado — entero ≥ 1 sin tope.
- **Comentarios sin límite:** descartado — opcional pero con máx 500.
- **Comentarios/teléfono/email opcionales:** solo comentarios es opcional.

## Assumptions

- `z.number()` con `valueAsNumber` cubre bien el caso vacío (NaN → error de
  requerido) con un mensaje adecuado; `defaultValue` de huéspedes = 1 evita error
  inicial.
- El patrón del `TextField` se traslada limpio a `textarea`/`number`.
- Los mensajes de error pueden ser estáticos (no vienen del CMS).
- `GuestFormValues` puede convertirse en la fuente de verdad del shape del huésped
  (alineando o sustituyendo `GuestDetails`).

## Risks

- **NumberField vacío/NaN:** cuidar el manejo de `valueAsNumber` cuando el input
  se borra (NaN) para dar un mensaje correcto y que el error desaparezca al corregir.
- **Teléfono laxo:** acepta entradas poco realistas (p.ej. solo símbolos); aceptado
  conscientemente.
- **Duplicidad de tipos:** `GuestDetails` (booking.model) vs `GuestFormValues`;
  conviene alinear para no mantener dos shapes.

## Open Points

- [ ] Alinear/sustituir `GuestDetails` por `GuestFormValues`.
- [ ] Feedback de éxito al enviar (toast verde) en una iteración futura.
- [ ] ¿Mensajes de error al CMS más adelante?

## Next Steps

- [ ] Implementar: `TextareaField` + `NumberField` → ampliar schema → migrar el
      resto del formulario y eliminar el híbrido `FormData`.
- [ ] Run `prd-to-plan` si se quiere desglosar en fases formales.
- [ ] Run `prd-to-issues` para crear issues en GitHub.

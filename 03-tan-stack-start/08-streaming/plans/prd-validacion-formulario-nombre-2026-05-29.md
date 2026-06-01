# PRD: Validación del formulario de reserva — campo nombre (TanStack Form + Zod)

**Date**: 2026-05-29
**Mode**: validation (con huecos co-creados)
**Status**: completed

## Problem Statement

El formulario de huésped en `/reserva` (`src/pods/booking/components/guest-form.component.tsx`)
hoy usa **inputs nativos no controlados + `FormData`** en el submit y **no valida
nada**. Queremos empezar a validarlo, paso a paso, comenzando por el campo
**nombre**, usando **TanStack Form + Zod**, mostrando un mensaje de error debajo
del campo que **desaparece cuando el usuario corrige**.

Además, TanStack Form obliga a envolver los controles; para no repetir esa lógica
crearemos **wrappers reutilizables** en una carpeta nueva `src/components/form`
(empezando por un `TextField`, que usará el campo nombre).

**Descubierto en la exploración del codebase:**

- `@tanstack/react-form` **no está instalado** (solo `zod` v4.4.3). Hay que añadirlo.
- No existe `src/components/form`.
- Existe una skill `tanstack-form`, pero está escrita para **otro repo**
  (`apps/web/src/common/components/forms`, alias `#common`, **DaisyUI**, toasts
  DaisyUI). Este proyecto usa `src/components`, alias `@/`, Tailwind v4 + shadcn
  con CSS vars, y construye sus componentes shadcn **a mano sobre el paquete
  `radix-ui`** (así están `dialog` y `dropdown-menu`).

> 🚩 **Escenario no cubierto literalmente por la skill `tanstack-form`.** Se aplica
> su *espíritu* (TanStack Form + Zod, schema por form, errores tras blur/submit,
> error debajo con `role="alert"` + `aria-describedby`, `aria-invalid`, wrapper
> reutilizable con `form: any` + `useId`) pero **adaptado a este repo**. Decisión
> tomada: **actualizar la skill** para que quede alineada con ShadCN/este proyecto.

## User Stories

1. Como huésped, quiero que se me avise si dejo el nombre vacío o demasiado corto,
   para no enviar una solicitud incompleta.
2. Como huésped, quiero ver el error **debajo** del campo nombre, para entender
   qué corregir.
3. Como huésped, quiero que el error **desaparezca en cuanto corrijo** (mientras
   tecleo), para tener feedback inmediato.
4. Como huésped, quiero que si intento enviar con errores se me avise con una
   **toast** y el formulario no se envíe, para no perder lo escrito.
5. Como desarrollador, quiero un **wrapper `TextField` reutilizable**, para no
   repetir la lógica de error/accesibilidad en cada campo.
6. Como desarrollador, quiero la **skill `tanstack-form` alineada con este repo**,
   para que las próximas validaciones sigan el patrón correcto.

## Product / UX Decisions

- **Regla del nombre:** requerido + **mínimo 2 caracteres** (con `trim`). Mensajes
  claros ("El nombre es obligatorio" / "El nombre debe tener al menos 2 caracteres").
- **Timing del error:** validar `onChange` **y** `onBlur`; el error **solo se
  muestra** si el campo fue tocado (`isBlurred || isTouched`) o se intentó enviar,
  y **se borra en vivo** en cuanto el valor pasa a ser válido. Cumple el requisito
  explícito "desaparece al corregir" (resuelta la contradicción con la opción
  "solo onBlur+onSubmit", que no lo cumplía).
- **Submit inválido:** TanStack bloquea el envío, se muestra el error bajo el
  campo **y** aparece una **toast** de aviso ("Hay errores en el formulario.
  Revisa los campos.").
- **Accesibilidad (no negociable):** `<label htmlFor>` real, `id` único (`useId`),
  error en `<p role="alert">` con id propio enlazado vía `aria-describedby`,
  `aria-invalid` en el input cuando hay error visible, borde de error con los
  colores del repo (`--destructive`).

## Technical Decisions

- **Alcance: solo el campo nombre ahora.** El resto de campos (apellido, email,
  teléfono, nº huéspedes, comentarios) se migran en un **segundo paso**. De momento
  conviven: nombre gestionado por TanStack Form; resto nativo + `FormData`.
- **Dependencia:** instalar `@tanstack/react-form` (`latest`, coherente con el
  resto de paquetes TanStack del repo).
- **Wrapper `TextField` genérico** en `src/components/form/text-field.component.tsx`
  (+ barrel `index.ts`), reutilizable para nombre/apellido/email/teléfono. Sigue el
  patrón de la skill adaptado a este repo:
  - `form: any` (evita el infierno de generics; el `name` referencia el schema).
  - `useId()` para `inputId`, `errorId = \`${inputId}-error\``.
  - `classNames` opcional (`root/label/input/inputError/error`) sobre defaults.
  - `showError = (isBlurred || isTouched) && errors.length > 0`.
  - Cableado: `value`, `onChange={e => field.handleChange(e.target.value)}`,
    `onBlur={field.handleBlur}`, `aria-invalid`, `aria-describedby`.
  - Estilado con las clases/CSS vars ya usadas en `guest-form` (no DaisyUI).
- **Schema Zod:** `src/pods/booking/guest-form.schema.ts`, exportando el schema y
  `type GuestFormValues = z.infer<typeof schema>`. De momento solo valida
  `firstName` (requerido + min 2, trim); el resto se añade en el segundo paso.
- **Migración del form (híbrido temporal):**
  - `useForm({ defaultValues: { firstName: '' }, validators: { onChange: schema,
    onBlur: schema }, onSubmit, onSubmitInvalid })`.
  - `<form noValidate onSubmit={e => { e.preventDefault(); e.stopPropagation();
    void form.handleSubmit(); }}>`.
  - Nombre renderizado con `<TextField form={form} name="firstName" .../>`.
  - En `onSubmit` se leen los demás campos vía `FormData` (ref al `<form>`) y se
    combinan con `value.firstName` para el `console.log` (comportamiento actual).
  - `onSubmitInvalid` → dispara la toast.
- **Toast: Radix Toast hecho a mano**, sin dependencia nueva, sobre el paquete
  `radix-ui` ya instalado (coherente con `dialog`/`dropdown-menu`). Componente en
  `src/components/ui/toast.tsx` (Provider + Viewport + Toast + Title/Description)
  estilado con CSS vars; provider montado en `src/routes/__root.tsx`; helper/hook
  ligero para disparar la toast de error.
- **Actualizar la skill `tanstack-form`** para alinearla con este repo: rutas
  `src/components/form`, alias `@/`, estilos Tailwind+shadcn (CSS vars), toast con
  Radix en vez de DaisyUI, manteniendo las reglas de UX/a11y.

## Testing Decisions

- **Schema (`guest-form.schema.ts`):** unit test — vacío → error; 1 char → error;
  "  a " (trim) → error; "Ana" → válido.
- **TextField wrapper:** test de integración — el error NO aparece antes de
  blur/submit; aparece tras blur con valor inválido; **desaparece al corregir**
  tecleando; `aria-invalid`/`aria-describedby` presentes solo en error.
- **Submit inválido:** intento de envío con nombre inválido → no se llama al
  `console.log`/onSubmit válido, aparece la toast y el error bajo el campo.
- **Submit válido:** nombre válido + resto → se ejecuta el `console.log` con todos
  los datos (incluye los campos nativos vía FormData).
- **No testear:** estilos exactos, ni la validación de los campos aún no migrados.

## Out of Scope

- Validación del resto de campos (apellido, email, teléfono, nº huéspedes,
  comentarios) — segundo paso.
- Migrar el resto del formulario a campos controlados de TanStack Form.
- Envío real del correo / validación en servidor.
- Persistencia de la solicitud.

## Discarded Alternatives

- **Migrar todo el formulario ahora:** descartado por el usuario — solo el nombre
  de momento; el resto en un segundo paso (aunque mezcla paradigmas temporalmente).
- **Timing "solo onBlur+onSubmit":** descartado — no cumple el requisito de que el
  error desaparezca al corregir mientras se teclea.
- **Timing eager (onChange siempre, mostrar siempre):** descartado — molesta al
  empezar a teclear, muestra error antes del primer blur.
- **Regla "solo requerido" / "sin números":** descartadas — nos quedamos en
  requerido + min 2 (equilibrio simple/útil).
- **Wrapper específico de nombre:** descartado — se hace `TextField` genérico.
- **Toast con `sonner`:** descartado — introduce dependencia fuera del patrón
  radix actual.
- **Toast mínimo casero:** descartado — reinventaría la accesibilidad (role,
  aria-live, timers) que Radix ya resuelve.

## Assumptions

- `@tanstack/react-form` (`latest`) es compatible con React 19 + TanStack Start de
  este repo.
- El patrón híbrido (TanStack para nombre + `FormData` para el resto) es aceptable
  como estado **temporal** hasta migrar el resto.
- El paquete `radix-ui` ya instalado exporta el primitive `Toast`.
- Los textos de error pueden ser estáticos (no provienen del CMS por ahora).

## Risks

- **Fragilidad del híbrido:** mezclar `FormData` y TanStack Form en el mismo `<form>`
  es delicado (leer el resto de campos por ref); es deuda temporal hasta el segundo paso.
- **Infra de toast:** añade boilerplate (Provider + Viewport en el root) para un
  único aviso; hay que cablearlo bien para reutilizarlo después.
- **Validación onChange en cada tecla:** trivial para un campo, pero vigilar al
  escalar a todos los campos.
- **Actualizar la skill** puede afectar a futuros usos en otros repos si la skill
  fuese compartida; aquí se asume local al proyecto.

## Open Points

- [ ] Migrar el resto de campos a TanStack Form + ampliar el schema Zod (2º paso).
- [ ] Alinear `booking.model.ts` (`GuestDetails`) con `GuestFormValues` del schema.
- [ ] Reutilizar la toast para otros avisos (éxito de solicitud, errores de red).
- [ ] ¿Mover los mensajes de error al CMS más adelante?

## Next Steps

- [ ] Implementar: actualizar skill `tanstack-form` → instalar `@tanstack/react-form`
      → crear `TextField` + `guest-form.schema.ts` → montar toast (Radix) →
      migrar el campo nombre en `guest-form.component.tsx`.
- [ ] Run `prd-to-plan` si se quiere desglosar en fases formales.
- [ ] Run `prd-to-issues` para crear issues en GitHub.

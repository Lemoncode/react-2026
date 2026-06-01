---
name: tanstack-form
description: >-
  Use this skill whenever you build or modify a form in this repo. Enforces TanStack Form + Zod,
  reuse of wrappers in src/components/form, and the agreed UX rules (errors after blur/submit that
  clear live on correction, red toast on invalid submit, full accessibility).
  Trigger on tasks mentioning "formulario", "form", "validación de campos", "TanStack Form",
  "Zod schema", or when adding/editing files under src/pods/**/*-form.component.tsx.
---

# tanstack-form

## Core Principle

Todos los formularios del frontend usan **TanStack Form + Zod** y consumen (o amplían) los wrappers de `src/components/form`. Nunca crear inputs controlados ad-hoc dentro de un pod si ya existe — o puede existir — un wrapper reutilizable.

## Stack y rutas críticas

- **Form lib**: `@tanstack/react-form` (`useForm`, `form.Field`, `AnyFieldApi`).
- **Validación**: `zod` (v4). Un esquema por formulario en `<pod>/<form>.schema.ts`, exportando también `type FormValues = z.infer<typeof schema>`.
- **Wrappers reutilizables**: `src/components/form/` (barrel `index.ts`).
- **Import alias**: `@/components/form`.
- **Estilos**: Tailwind v4 + shadcn con **CSS vars** del repo (`--sea-ink`, `--sea-ink-soft`, `--sand`, `--lagoon-deep`, `--card`, `--destructive`). **No DaisyUI.**
- **Toast**: componente **Radix Toast** hecho a mano en `src/components/ui/toast.tsx` (`ToastProvider` + hook `useToast`), montado en `src/routes/__root.tsx`. **No DaisyUI.**
- **Componente de referencia**: `src/components/form/text-field.component.tsx`.
- **Pod de referencia**: `src/pods/booking/`
  - `guest-form.schema.ts`
  - `components/guest-form.component.tsx`

## Workflow obligatorio al construir un formulario

1. Define el esquema Zod en `<form>.schema.ts` y exporta `type FormValues = z.infer<typeof schema>`.
2. Crea/edita el componente del formulario en su pod usando:
   ```ts
   const form = useForm({
     defaultValues: { ... } as FormValues,
     validators: { onChange: schema, onBlur: schema },
     onSubmit: ({ value }) => { ... },
     onSubmitInvalid: () =>
       toast({
         variant: "error",
         title: "Revisa el formulario",
         description: "Hay errores en el formulario. Revisa los campos.",
       }),
   });
   ```
   `onChange` **además** de `onBlur` es lo que permite que el error **desaparezca en vivo** cuando el usuario corrige (el render del error sigue gateado por `isBlurred || isTouched`, así que no es agresivo al empezar a teclear).
3. Para cada campo, **busca primero** un wrapper en `src/components/form`. Si existe, úsalo:
   ```tsx
   <TextField form={form} name="email" label="Email" type="email" autoComplete="email" />
   ```
   Si NO existe, crea uno nuevo siguiendo *"Cómo crear un nuevo wrapper"*.
4. Maneja `onSubmit` del `<form>`:
   ```tsx
   onSubmit={(event) => {
     event.preventDefault();
     event.stopPropagation();
     void form.handleSubmit();
   }}
   ```
5. En `onSubmitInvalid` muestra una **toast roja** vía `useToast()` (`variant: "error"`).
6. El `<form>` lleva `noValidate` (delegamos al schema).

### Migración incremental (híbrido temporal)

Es aceptable migrar un formulario campo a campo: los campos ya migrados usan
`form.Field`/wrappers y validación Zod; los pendientes pueden seguir siendo
nativos y leerse vía `FormData` (con un `ref` al `<form>`) dentro de `onSubmit`.
Es **deuda temporal** — completa la migración en cuanto puedas y evita dejar el
híbrido indefinidamente.

## Reglas de UX y accesibilidad (no negociables)

- Los errores **no se muestran** hasta que el campo haya sido `isBlurred || isTouched` o se haya intentado enviar el formulario.
- Una vez visible, el error **desaparece en vivo** al corregir (gracias al validador `onChange`).
- El error aparece **debajo** del campo, dentro de un `<p role="alert">` con id propio, enlazado vía `aria-describedby` desde el input.
- El input tiene `aria-invalid` cuando está en error.
- El borde del input pasa a `border-destructive` cuando hay error visible.
- Todos los inputs tienen `<label htmlFor>` real, `autoComplete` apropiado y `id` único (`useId`).
- Si la validación de submit falla → toast roja + el formulario NO se envía (TanStack Form lo bloquea automáticamente al estar el schema en `validators`).

## Cómo crear un nuevo wrapper en `src/components/form`

Sigue exactamente el patrón de `text-field.component.tsx`. Crece de forma orgánica: **sólo** crea un wrapper cuando lo vayas a necesitar en un formulario real, no por adelantado.

### Convenciones

- **Nombre de archivo**: `<tipo>-field.component.tsx`
  (`select-field.component.tsx`, `checkbox-field.component.tsx`, `textarea-field.component.tsx`, ...).
- Exporta el componente y dos tipos: `<Tipo>FieldProps` y `<Tipo>FieldClassNames`.
- Añade el export al barrel `src/components/form/index.ts`.

### Props mínimas

```ts
export interface XxxFieldClassNames {
  root?: string;
  label?: string;
  input?: string;       // o el nombre del control (select, textarea, ...)
  inputError?: string;
  error?: string;
}

export interface XxxFieldProps
  extends Omit<
    React.XxxHTMLAttributes<HTMLXxxElement>,
    | 'value'
    | 'onChange'
    | 'onBlur'
    | 'name'
    | 'id'
    | 'form'
    | 'aria-invalid'
    | 'aria-describedby'
  > {
  /** TanStack Form instance (uses `form.Field` under the hood). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  name: string;
  label: string;
  id?: string;
  classNames?: XxxFieldClassNames;
}
```

`form: any` es intencional — evita el infierno de generics de TanStack Form. La API del padre sigue tipada porque el `name` referencia el schema Zod a nivel de uso.

### Estructura del cuerpo

- `useId()` para el id (con fallback si el consumidor no pasa `id`).
- `errorId = `${inputId}-error``.
- `DEFAULT_CLASS_NAMES` en el módulo + `styles = { ...DEFAULT_CLASS_NAMES, ...classNames }`, estilado con las CSS vars del repo (no DaisyUI).
- Renderizar:
  ```tsx
  <form.Field name={name}>
    {(field: AnyFieldApi) => {
      const showError =
        (field.state.meta.isBlurred || field.state.meta.isTouched) &&
        field.state.meta.errors.length > 0;
      const errorMessage = showError
        ? String(field.state.meta.errors[0]?.message ?? field.state.meta.errors[0])
        : null;
      // ... label + control + <p role="alert"> ...
    }}
  </form.Field>
  ```
- Cablear al control nativo:
  - `value={field.state.value ?? ''}`
  - `onChange={(event) => field.handleChange(event.target.value)}`
  - `onBlur={field.handleBlur}`
  - `aria-invalid={showError || undefined}`
  - `aria-describedby={showError ? errorId : undefined}`
- Para controles no-texto (checkbox, radio, select múltiple) adapta `value`/`onChange` al shape correspondiente, pero mantén la misma lógica de `showError` / a11y / `classNames`.

## Antipatrones a evitar

- Usar `react-hook-form`, `formik` u otra librería distinta de TanStack Form.
- Usar DaisyUI o introducir una librería de toast/forms nueva (el repo usa shadcn sobre `radix-ui`).
- Validar a mano en `onChange` en vez de declarar el schema Zod.
- Mostrar errores antes del primer blur o intento de submit.
- Configurar solo `onBlur`/`onSubmit` cuando el requisito es que el error desaparezca al corregir (faltaría `onChange`).
- Crear inputs controlados directamente dentro del pod cuando ya existe (o puede existir) un wrapper.
- Duplicar la lógica de error / `aria-*` en cada `form.Field`.
- Olvidar `noValidate` en el `<form>` o el `event.preventDefault()` en `onSubmit`.
- Crear wrappers especulativos en `src/components/form` que ningún formulario use todavía.

## Checklist final antes de dar por terminado un formulario

- [ ] Schema Zod en `<form>.schema.ts` con `type FormValues = z.infer<...>`.
- [ ] `validators.onChange` y `validators.onBlur` configurados con el schema.
- [ ] Todos los campos (ya migrados) usan wrappers de `src/components/form` (existentes o creados siguiendo el patrón).
- [ ] Errores aparecen sólo tras `blur` / submit, con `role="alert"` y `aria-describedby`, y **desaparecen al corregir**.
- [ ] `onSubmitInvalid` muestra toast roja vía `useToast()`.
- [ ] `<form noValidate>` con `event.preventDefault()` en el submit.
- [ ] `npx tsc --noEmit` pasa sin errores.

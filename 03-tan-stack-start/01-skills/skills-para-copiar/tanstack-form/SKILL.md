---
name: tanstack-form
description: >-
  Use this skill whenever you build or modify a form in apps/web. Enforces TanStack Form + Zod,
  reuse of wrappers in apps/web/src/common/components/forms, and the agreed UX rules
  (errors after blur/submit, red toast on invalid submit, full accessibility).
  Trigger on tasks mentioning "formulario", "form", "validación de campos", "TanStack Form",
  "Zod schema", or when adding/editing files under apps/web/src/pods/**/*-form.component.tsx.
---

# tanstack-form

## Core Principle

Todos los formularios del frontend usan **TanStack Form + Zod** y consumen (o amplían) los wrappers de `apps/web/src/common/components/forms`. Nunca crear inputs controlados ad-hoc dentro de un pod si ya existe — o puede existir — un wrapper reutilizable.

## Stack y rutas críticas

- **Form lib**: `@tanstack/react-form` (`useForm`, `form.Field`, `AnyFieldApi`).
- **Validación**: `zod`. Un esquema por formulario en `<pod>/<form>.schema.ts`, exportando también `type FormValues = z.infer<typeof schema>`.
- **Wrappers reutilizables**: `apps/web/src/common/components/forms/` (barrel `index.ts`).
- **Import alias**: `#common/components/forms`.
- **Componente de referencia**: `apps/web/src/common/components/forms/text-field.component.tsx`.
- **Pod de referencia**: `apps/web/src/pods/login/`
  - `login-form.schema.ts`
  - `login-form.component.tsx`
  - `index.ts`

## Workflow obligatorio al construir un formulario

1. Define el esquema Zod en `<form>.schema.ts` y exporta `type FormValues = z.infer<typeof schema>`.
2. Crea el componente del formulario en su pod usando:
   ```ts
   const form = useForm({
     defaultValues: { ... } as FormValues,
     validators: { onBlur: schema, onSubmit: schema },
     onSubmit: async ({ value }) => { ... },
     onSubmitInvalid: () => setToast('Hay errores en el formulario. Revisa los campos.'),
   });
   ```
3. Para cada campo, **busca primero** un wrapper en `apps/web/src/common/components/forms`. Si existe, úsalo:
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
5. En `onSubmitInvalid` muestra una **toast roja** con DaisyUI (`alert alert-error` + `toast toast-top toast-center`, `role="alert"`, `aria-live="assertive"`).
6. El `<form>` lleva `noValidate` (delegamos al schema) y `aria-labelledby` apuntando al `id` del título (`<h1>`).

## Reglas de UX y accesibilidad (no negociables)

- Los errores **no se muestran** hasta que el campo haya sido `isBlurred || isTouched` o se haya intentado enviar el formulario.
- El error aparece **debajo** del campo, dentro de un `<p role="alert">` con id propio, enlazado vía `aria-describedby` desde el input.
- El input tiene `aria-invalid` cuando está en error.
- El borde del input pasa a `border-error` cuando hay error visible.
- Todos los inputs tienen `<label htmlFor>` real, `autoComplete` apropiado y `id` único (`useId`).
- Si la validación de submit falla → toast roja + el formulario NO se envía (TanStack Form lo bloquea automáticamente al estar configurado el `onSubmit` validator).

## Cómo crear un nuevo wrapper en `common/components/forms`

Sigue exactamente el patrón de `text-field.component.tsx`. Crece de forma orgánica: **sólo** crea un wrapper cuando lo vayas a necesitar en un formulario real, no por adelantado.

### Convenciones

- **Nombre de archivo**: `<tipo>-field.component.tsx`
  (`select-field.component.tsx`, `checkbox-field.component.tsx`, `textarea-field.component.tsx`, ...).
- Exporta el componente y dos tipos: `<Tipo>FieldProps` y `<Tipo>FieldClassNames`.
- Añade el export al barrel `apps/web/src/common/components/forms/index.ts`.

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
    XxxHTMLAttributes<HTMLXxxElement>,
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
- `DEFAULT_CLASS_NAMES` en el módulo + `styles = { ...DEFAULT_CLASS_NAMES, ...classNames }`.
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
- Validar a mano en `onChange` en vez de declarar el schema Zod.
- Mostrar errores antes del primer blur o intento de submit.
- Crear inputs controlados directamente dentro del pod cuando ya existe (o puede existir) un wrapper.
- Duplicar la lógica de error / `aria-*` en cada `form.Field`.
- Olvidar `noValidate` en el `<form>` o el `event.preventDefault()` en `onSubmit`.
- Crear wrappers especulativos en `common/components/forms` que ningún formulario use todavía.

## Checklist final antes de dar por terminado un formulario

- [ ] Schema Zod en `<form>.schema.ts` con `type FormValues = z.infer<...>`.
- [ ] `validators.onBlur` y `validators.onSubmit` configurados con el schema.
- [ ] Todos los campos usan wrappers de `common/components/forms` (existentes o creados siguiendo el patrón).
- [ ] Errores aparecen sólo tras `blur` / submit, con `role="alert"` y `aria-describedby`.
- [ ] `onSubmitInvalid` muestra toast roja.
- [ ] `<form noValidate>` con `aria-labelledby` apuntando al título.
- [ ] `cd apps/web && node --run check-types` pasa sin errores.

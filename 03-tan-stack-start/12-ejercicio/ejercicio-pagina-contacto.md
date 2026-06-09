# Ejercicio: Página de Contacto

## Contexto

Nuestra web pública (la villa) ya tiene **Inicio**, **Reserva** y **About**. Falta una
página de **Contacto** donde cualquier visitante pueda enviarnos un mensaje
(dudas, colaboraciones, etc.) sin pasar por el flujo de reserva.

## Enunciado

Crea una **página de contacto pública** en `/contacto` con un **formulario** que
permita al visitante enviarnos un mensaje. Como mínimo:

1. Una nueva ruta pública `/contacto` integrada en el layout público (cabecera y
   pie de página, como el resto de páginas).
2. Un formulario con, al menos: **nombre**, **email**, **asunto** y **mensaje**.
3. **Validación** de los campos (campos obligatorios, email con formato válido,
   mensaje con una longitud mínima razonable).
4. Al enviar, que se **procese en el servidor** (no basta con un `console.log` en
   el cliente) y se **envíe un email** al propietario con el mensaje, usando
   **Resend** (que **ya está montado** en el proyecto, igual que en el flujo de
   reserva).
5. **Feedback** al usuario: confirmación si el email se envía, o mensaje de error
   si algo falla.
6. Diseño **consistente** con el resto de la intranet/web y **responsive**
   (se ve bien en móvil y escritorio).
7. Un **enlace** para llegar a la página desde la navegación.

> No hace falta una base de datos: con enviar el email al propietario es
> suficiente. **No instales nada nuevo**: Resend ya está configurado en el repo,
> solo tienes que reutilizarlo.

## Criterios de aceptación

- [ ] Puedo navegar a `/contacto` y ver el formulario dentro del layout público.
- [ ] Si dejo campos vacíos o el email es inválido, **no se envía** y veo los
      errores junto a cada campo.
- [ ] Los errores **aparecen tras interactuar** con el campo (o al intentar
      enviar) y **desaparecen** cuando corrijo.
- [ ] Al enviar correctamente, se manda un **email al propietario vía Resend**,
      veo un mensaje de confirmación y el formulario se limpia.
- [ ] Si el envío del email falla, veo un mensaje de error claro.
- [ ] La página es accesible (labels, foco, `aria-*`) y responsive.

---

## Pistas

> Intenta primero por tu cuenta. Abre las pistas solo cuando te atasques.

<details>
<summary>Pista 1 — ¿Dónde va la ruta?</summary>

El routing es **file-based**. Las páginas públicas viven bajo el layout `_app`
(mira `src/routes/_app/`: `index.tsx`, `reserva.tsx`, `about.tsx`). Crea
`src/routes/_app/contacto.tsx` y exporta una `Route` con `createFileRoute`. El
árbol de rutas se regenera solo al arrancar `npm run dev`.
</details>

<details>
<summary>Pista 2 — Estructura del código (pod)</summary>

Sigue el patrón de "pods". Una feature se organiza en `src/pods/<feature>/`. El
ejemplo más cercano es **`src/pods/booking/`**:

```
src/pods/contact/
├── index.ts                          # export público del pod
├── contact.pod.tsx                   # componente que orquesta la página
├── contact-form.schema.ts            # esquema Zod + type FormValues
├── contact.api.ts                    # server function (envío)
└── components/
    └── contact-form.component.tsx    # el formulario
```

La ruta `contacto.tsx` debería quedar muy fina: solo monta el pod.
</details>

<details>
<summary>Pista 3 — El formulario (muy importante)</summary>

En este repo **todos los formularios usan TanStack Form + Zod** y reutilizan los
wrappers de `src/components/form` (`TextField`, `TextareaField`, …). Tienes una
skill que lo explica: **`tanstack-form`**.

- Define el esquema en `contact-form.schema.ts` y exporta
  `type ContactFormValues = z.infer<typeof schema>`.
- Usa `useForm({ defaultValues, validators: { onChange: schema, onBlur: schema }, onSubmit, onSubmitInvalid })`.
- Reutiliza `TextField` (nombre, email, asunto) y `TextareaField` (mensaje). **No**
  crees inputs controlados a mano si ya existe un wrapper.
- Mira `src/pods/booking/components/guest-form.component.tsx` como referencia
  directa (incluido el manejo de `onSubmit`/`onSubmitInvalid`).
</details>

<details>
<summary>Pista 4 — Procesar en el servidor (server function)</summary>

Para "enviar" usa una **server function** de TanStack Start, igual que la
reserva. Mira `src/pods/booking/booking.api.ts` (`sendBookingRequest`):

- El fichero se llama `*.api.ts` (¡ojo!, los `*.server.*` rompen el build).
- Se valida la entrada con Zod usando `.inputValidator(...)` (no `.validator()`).
- Para mandar el email se usa **Resend** (`src/lib/resend.ts`) y variables de
  entorno como `OWNER_EMAIL`.
- La página de contacto es **pública**: NO necesita el `authMiddleware` de la
  intranet.
</details>

<details>
<summary>Pista 5 — Feedback al usuario (toast)</summary>

El proyecto tiene un sistema de **toast** propio: `useToast()` de
`src/components/ui/toast.tsx` (ya montado en `__root.tsx`).

- Éxito → `toast({ variant: "success", title: "...", description: "..." })`.
- Error de envío → `toast({ variant: "error", ... })` dentro de un `try/catch`.
- Envío inválido (`onSubmitInvalid`) → toast roja "Revisa el formulario".

Tras un envío correcto, limpia el formulario con `formApi.reset()`.
</details>

<details>
<summary>Pista 6 — Diseño, navegación y responsive</summary>

- Reutiliza los estilos del repo: clases como `page-wrap`, `island-shell`,
  `display-title` y los tokens CSS (`--sea-ink`, `--sea-ink-soft`,
  `--lagoon-deep`, `--card`…). Mira `about.tsx` para el contenedor de página.
- Usa el `Button` de `src/components/ui/button.tsx` para el envío.
- Para el ancho/columnas, fíjate en cómo `guest-form` usa `grid sm:grid-cols-2`.
- Añade el enlace a "Contacto" en la navegación de la cabecera
  (`src/components/Header.tsx`).
</details>

---

## Retos extra (opcional)

- Añade un campo opcional de **teléfono** y un **checkbox** de "acepto la política
  de privacidad" (tendrás que crear un nuevo wrapper `CheckboxField` siguiendo el
  patrón de los existentes).
- Muestra un **contador de caracteres** en el mensaje (máximo 500).
- Deshabilita el botón mientras se envía y muestra "Enviando…"
  (pista: `form.Subscribe` con `state.isSubmitting`).
- Persiste el mensaje en MongoDB además de enviar el email.

## Checklist final

- [ ] `npx tsc --noEmit` pasa sin errores.
- [ ] La validación funciona (errores tras blur/submit y desaparecen al corregir).
- [ ] El envío da feedback (éxito y error).
- [ ] La página es responsive y consistente con el diseño.
- [ ] Hay un enlace visible para llegar a `/contacto`.

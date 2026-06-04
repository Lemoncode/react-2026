# PRD: Editar / eliminar reserva-bloqueo en la intranet (Paso 4)

**Date**: 2026-06-04
**Mode**: co-creation
**Status**: completed

## Problem Statement

El mismo panel de detalle (read-only, paso 3) debe poder **entrar en modo edición**, permitir modificar la reserva/bloqueo con **TanStack Form** (siguiendo el patrón del repo), y **Guardar** o **Cancelar**. Si hay cambios sin guardar, cerrar/cancelar debe pedir confirmación para descartar. Además, añadir la **papelera** (eliminar) con su modal de confirmación. El **mismo formulario** se reutilizará para **crear** (no en este paso).

### Contexto del codebase (pasos 1-3 + recon)

- **Form**: wrappers en `src/components/form/` → `TextField`, `NumberField`, `TextareaField`, `PasswordField`. **No hay `SelectField`** ni `select` de ShadCN. Patrón establecido (login, guest-form): `useForm` con `validators: { onChange, onBlur }`, errores tras blur/touch que se limpian en vivo, `onSubmitInvalid` → toast error. Skill **tanstack-form** aplica.
- **Modales**: hay `dialog` (ShadCN), **no** `alert-dialog` → los modales de descartar/eliminar usan `Dialog`.
- **Datos**: VM rico ya disponible (`CalendarItemVm`), pod `intranet-calendar`, server fn protegida `getBookingsByMonth` + `authMiddleware`. Selección en URL (`?selected=id`), detalle abajo (`CalendarItemDetail`).
- **Fechas**: documentos en UTC midnight; `nights` = noches `[start, end)`. `date-range-picker.tsx` existe pero acoplado al flujo público (`MIN_NIGHTS = 2`).
- **Calendario muestra**: bookings `confirmed`/`pending` + blocks; **cancelled NO se muestra**.

## User Stories

1. Como propietario, quiero pulsar el lápiz en el detalle y editar la reserva/bloqueo en el mismo panel, sin cambiar de pantalla.
2. Como propietario, quiero Guardar los cambios y verlos reflejados en el calendario al instante.
3. Como propietario, quiero Cancelar; si no toqué nada, se cierra directo; si hay cambios, que me pregunte antes de descartarlos.
4. Como propietario, quiero que si intento salir (cerrar, clic en otra barra, cambiar de mes, atrás del navegador) con cambios sin guardar, se me avise para no perderlos.
5. Como propietario, quiero eliminar una reserva/bloqueo con un icono de papelera y una confirmación previa.
6. Como propietario, quiero que los campos que tienen sentido para una reserva (huésped, fechas, ocupación, tarifa, estado) sean distintos de los de un bloqueo (fechas, motivo, nota).
7. Como propietario, quiero que el sistema calcule noches y totales por mí para no descuadrar los números.
8. Como propietario, quiero que no se me deje guardar fechas que pisen otra reserva/bloqueo.

## Product / UX Decisions

- **Edición in-place**: el panel de detalle alterna entre modo **vista** y modo **edición** (mismo sitio, abajo, `island-shell`, responsive). El modo edición vive en **estado local** (`useState`), no en la URL.
- **Campos editables**:
  - **Reserva**: fechas (rango), estado (`Confirmada`/`Pendiente`/`Cancelada`), huésped (nombre/email/teléfono), ocupación (adultos/niños/bebés/mascotas), precio (`nightlyRate`, `cleaningFee`, `touristTax`, `discount`). **Derivados solo-lectura**: `nights`, `subtotal` (= tarifa × noches), `total` (= subtotal + limpieza + tasa − descuento). `payment` queda **fuera** del form y se preserva.
  - **Bloqueo**: fechas (rango), `subtype` (enum requerido: Uso del propietario / Mantenimiento / Otro), nota interna (opcional). `nights` derivado.
- **Tipo inmutable** en edición (un booking no se convierte en block ni viceversa).
- **Estado "Cancelada" incluido** en el selector. Aviso: al guardar como cancelada, el item **desaparece del calendario** (no se muestran canceladas) y el panel se cierra → toast informativo.
- **Guard de cambios sin guardar (completo)**: con el form *dirty*, **cualquier** salida (Cancelar, X, clic en otra barra, cambio de mes/Hoy, atrás del navegador) dispara un **modal "¿Descartar cambios?"** (Descartar / Seguir editando). Sin cambios → salida directa.
- **Eliminar**: icono papelera → modal de confirmación → **borrado real**. Tras borrar: cerrar panel + toast + refrescar calendario.
- **Selector de enums**: nuevo `Select` de ShadCN + wrapper `SelectField` reutilizable.
- **Fechas**: range picker propio ligero con el `calendar` de ShadCN (modo range, sin mínimo de noches).
- **Diseño**: tokens de la intranet (`--sea-ink`, `--palm`, `island-shell`...), responsive (1 col móvil / 2 col escritorio), botones Guardar (primary) / Cancelar.

## Technical Decisions

- **TanStack Form + Zod (discriminated union por `type`)**: un schema unión `booking | block` que codifica los campos obligatorios divergentes. Validación `onChange` + `onBlur`; `onSubmitInvalid` → toast. Dirty vía `form.state.isDirty`.
- **Formulario reutilizable**: `calendar-item-form.component.tsx` recibe `defaultValues`, `mode` (edit ahora; create luego) y `onSubmit`/`onCancel`. El panel lo monta en edición.
- **Derivados**: `nights`, `subtotal`, `total` se calculan en render (suscripción a fechas/precio) y se envían calculados al servidor (no editables en UI).
- **Solape de fechas**: validado en cliente (contra `items` del loader, **excluyendo el propio id**) para feedback temprano, y de forma **autoritativa en el server function** (query a Mongo por overlap excluyendo `_id`, contemplando cruces de mes). Si el servidor lo rechaza → toast error.
- **Server functions protegidas** (con `authMiddleware`):
  - `updateCalendarItem` — valida (union zod), comprueba solape, escribe campos + `nights`/`subtotal`/`total`, `updatedAt`; si pasa a `cancelled`, set `cancelledAt`. Devuelve el item actualizado.
  - `deleteCalendarItem` — `deleteOne` por `_id` (+ `propertyId`).
- **Post-mutación**: `router.invalidate()` re-ejecuta el loader (sin react-query). Tras guardar → volver a modo vista (o cerrar si quedó cancelada/borrada).
- **Guard de navegación**: `useBlocker` de TanStack Router activo mientras `isDirty && mode==='edit'`; intercepta cambios de `search`/rutas. Cierre/cancel/clic-otra-barra se enrutan por el mismo flujo de confirmación.
- **Nuevos componentes UI**: `src/components/ui/select.tsx` (Radix Select vía paquete `radix-ui`, estilo del repo) y `src/components/form/select-field.component.tsx`; range field para fechas.

## Testing Decisions

- **Schema (union)**: casos booking válido/ inválido (email, fin>inicio, adultos≥1, precios≥0) y block (subtype requerido, sin guest/price).
- **Derivados**: `nights`/`subtotal`/`total` correctos al variar fechas y precios (incluye descuentos y cruces de mes).
- **Solape (server)**: rechaza fechas que pisan otro item; **permite** cuando solo se solapa consigo mismo (mismo `_id`).
- **Auth de las nuevas server fn**: `update`/`delete` devuelven 401 sin sesión (anti-Postman, como el paso 1).
- **Delete**: elimina el documento correcto; no toca otros.

## Out of Scope (Paso 4)

- **Crear** (el form se diseña reutilizable, pero el flujo de creación no se conecta aún).
- Edición de `payment` (método, transactionId, pagos) — se preserva tal cual.
- Multi-propiedad.
- Histórico/auditoría más allá de `updatedAt`/`cancelledAt`.
- Reprogramación de pagos/precios automática por reglas de negocio (solo cálculo aritmético del total).

## Discarded Alternatives

- **Precio totalmente manual**: descartado — `subtotal`/`total`/`nights` se desincronizan; mejor derivar.
- **Modo edición en la URL (`?mode=edit`)**: descartado — complica el guard (refresh entra en edición con form sucio).
- **Guard solo en Cancelar/X**: descartado — dejaba fugas por clic en otra barra / cambio de mes.
- **Reutilizar `date-range-picker.tsx` público**: descartado — acoplado a disponibilidad y `MIN_NIGHTS=2`.
- **Borrado lógico (cancelar) como "eliminar"**: descartado — la papelera implica borrado real; cancelar se cubre vía el estado.
- **`<select>` nativo / radios**: descartado a favor de `Select`+`SelectField` reutilizable.
- **Diferir validación de solape**: descartado — el usuario la quiere ya (cliente + servidor).

## Assumptions

- Cualquier sesión válida = el propietario; puede editar/borrar cualquier item de `villa_001`.
- `subtype` de bloqueo se modela como enum cerrado con opción "Otro".
- Editar fechas recalcula `nights` y, en reserva, `subtotal`/`total`.
- El payment existente sigue siendo válido tras editar (no se recalcula contra el nuevo total).

## Risks

- **`useBlocker` + estado de form**: coordinar el bloqueo de navegación con el modal y el reseteo del form es la parte más delicada; riesgo de loops o de no resetear `isDirty` tras guardar.
- **Solape con cruces de mes**: el loader trae ±7 días; la validación cliente puede no ver un item lejano → por eso el servidor es la fuente de verdad.
- **Cancelar = desaparece**: si el usuario no entiende que cancelada se oculta, parecerá que "se borró". Mitigado con toast.
- **Acoplamiento del VM**: `updateCalendarItem` debe seguir protegido (datos sensibles) y nunca compartir mapper con una fn pública.

## Open Points

- [ ] ¿`cleaningFee`/`touristTax`/`discount` editables (asumido sí) o fijos con solo `nightlyRate` editable?
- [ ] Copys exactos de toasts (guardado, borrado, cancelada-oculta) y textos de los modales.
- [ ] ¿Validación de solape también para bloqueos contra reservas y viceversa (asumido sí, cualquier tipo contra cualquiera)?

## Next Steps

- [ ] Implementar el paso 4 (este PRD), siguiendo el skill **tanstack-form**.
- [ ] Más adelante: conectar **crear** reutilizando el formulario.
- [ ] (Opcional) `prd-to-plan` si se quiere trocear en fases con issues.

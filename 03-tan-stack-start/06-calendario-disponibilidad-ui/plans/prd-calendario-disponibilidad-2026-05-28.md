# PRD — Calendario de disponibilidad (display + selección)

**Fecha:** 2026-05-28
**Autor:** Braulio (sesión grill-me con Claude)
**Estado:** Definido — listo para `prd-to-plan`
**Sección afectada:** `src/pods/home` (componente `Availability`, server fn `getAvailabilityByMonth`, route `/`)

---

## 1. Contexto

La sección `Availability` de la home actualmente es un placeholder ("Calendario próximamente"). La server function `getAvailabilityByMonth` ya existe y devuelve los `CalendarBlockVm` que solapan con un mes concreto, filtrando por `status: confirmed|pending` de la propiedad `villa_001`.

El objetivo es reemplazar el placeholder por un calendario funcional que muestre los días ocupados del mes (o meses) visible(s), preparado para añadir selección de rango en una segunda fase.

## 2. Objetivos

- **Paso 1 (este PRD, prioridad)**: mostrar disponibilidad en un calendario interactivo con navegación mes a mes.
- **Paso 2 (este PRD, definido para evitar refactor pero no implementado todavía)**: permitir seleccionar un rango de fechas para reservar.

## 3. Componente base

**Decisión:** usar el componente `Calendar` de shadcn/ui, que envuelve `react-day-picker`.

- Instalación: `npx shadcn add calendar` (no está instalado todavía — sólo hay `button`, `card`, `carousel`, `dropdown-menu`).
- Capacidades aprovechadas: `mode`, `numberOfMonths`, `disabled` (matchers), `modifiers` + `modifiersClassNames`, `fromMonth`, `defaultMonth`, `month` + `onMonthChange`.

## 4. Decisiones cerradas

### 4.1 Layout

- **Desktop** (≥ breakpoint `md`): 2 meses lado a lado.
- **Móvil**: 1 mes.
- **Resolución SSR**: el servidor renderiza siempre **1 mes**. Tras hidratar en cliente, un `useEffect` + media query expande a 2 si la viewport es ≥ desktop. Trade-off aceptado: en desktop hay un instante muy breve con 1 mes hasta que hidrata — preferible al flash inverso (ver 2 colapsar a 1) y al riesgo de inconsistencia de un DOM oculto.

### 4.2 Server function

- **Mantener** `getAvailabilityByMonth` (no renombrar).
- **Ampliar el input** con un campo opcional `monthsAhead`:
  ```ts
  inputSchema = z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2020).max(2100),
    monthsAhead: z.number().int().min(0).max(6).optional(),
  });
  ```
- **Default `monthsAhead = 0`**: comportamiento actual (devuelve los bloques que solapan con un único mes). Compatibilidad hacia atrás garantizada.
- **Máximo `monthsAhead = 6`**: alineado con el horizonte de datos del seed.
- **Lógica de ventana**:
  ```ts
  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month + monthsAhead, 1));
  // query existente con monthStart..monthEnd
  ```
- **Caché**: ninguna client-side específica. Cada navegación de meses refetchea el bloque entero (`monthsAhead=1`). Aceptable porque la home es SSR, el dataset es pequeño y la API es rápida. Si crece el uso, se revisará introducir TanStack Query con clave por mes.

### 4.3 Caso "30-mar a 2-abr" (rango que cruza meses)

Resuelto por la combinación:
- **Vista**: 2 meses simultáneos en desktop, así el usuario ve directamente los días de ambos meses.
- **Server fn**: ya filtra por solapamiento (`startDate < monthEnd && endDate > monthStart`), así un bloque que cruza mes aparece cuando se pide cualquiera de los dos.
- **En móvil** (1 mes): el bloque aparece en cada mes individualmente, por lo que al navegar el usuario ve los días ocupados en ambos.

### 4.4 Semántica de `endDate` (checkout day)

- **`endDate` es EXCLUSIVO** (convención del seed: `endDate = startDate + nights`).
- **El día de checkout se pinta como LIBRE** y es seleccionable como check-in en el paso 2.
- **Implementación**: para cada `CalendarBlockVm` se pasa a react-day-picker un matcher de rango:
  ```ts
  { from: block.startDate, to: addDays(block.endDate, -1) }
  ```
- Coste computacional: lineal en número de bloques (manejable para el horizonte de 6 meses).

### 4.5 Distinción visual de bloques

- **Todos los bloques se pintan IGUAL** ("ocupado"), sin distinguir:
  - `type: booking` vs `type: block`
  - `status: pending` vs `status: confirmed`
  - `subtype: maintenance` vs `subtype: owner_use`
- **Justificación**: esta vista es pública. Un usuario sólo necesita saber "disponible" / "no disponible". No hay valor en exponer el motivo.
- **Sin tooltip / hover info** en paso 1.

### 4.6 Navegación al pasado

- **`fromMonth={today}`** — no se permite navegar a meses anteriores al actual.
- El mes actual se renderiza completo (incluyendo días pasados, que quedan `disabled` por `{ before: today }`).
- Botón "←" se deshabilita cuando se está en el mes actual.

### 4.7 Leyenda visible

- **Paso 1**: mostrar sólo `freeLabel` y `BusyLabel` (de `AvailabilitySection` del CMS).
- **`selectionLabel`**: oculto en paso 1 (no hay selección posible). Se activa en paso 2.
- **`rangeSelectedTopTitle`, `rangeSelectedMainTitle`, `CheckAvailabilityLabel`**: el panel "rango seleccionado" sigue visible como teaser, pero con texto neutral / botón deshabilitado en paso 1. Se conecta a la selección real en paso 2.

### 4.8 Reglas de selección (paso 2 — definido para no refactorizar)

- `mode="range"` en react-day-picker.
- **Bloqueo duro nativo**: los días ocupados se pasan a `disabled`. Si el usuario intenta arrastrar un rango que cruza un día deshabilitado, react-day-picker reinicia automáticamente el `from`. UX: cero código de validación adicional para este caso.
- **Min noches: 2**. Max: sin techo explícito (limitado por el horizonte de datos).
- **Validación de min noches**: al soltar la selección, si `nights < 2`, marcar selección inválida y deshabilitar el CTA. Mensaje inline "Mínimo 2 noches".
- **Validación final**: al pulsar "Comprobar disponibilidad", el servidor revalida (no implementado en este PRD, sólo placeholder de hook).
- **Selección puede empezar en el día de checkout de otra reserva** (consecuencia de 4.4).

## 5. Cambios concretos esperados

### 5.1 `src/pods/home/availability.api.ts`

Añadir `monthsAhead` opcional al schema y a la lógica de ventana. Mantener exportación.

### 5.2 `src/routes/index.tsx`

- Pasar `monthsAhead: 1` desde el loader cuando renderice 2 meses (desktop). Como SSR siempre arranca con 1 mes, el loader inicial pide `monthsAhead: 0` (o 1 si se prefiere prefetch).
- **Decisión menor a tomar en implementación**: pedir siempre 2 meses en server-side para que el client-side al expandir ya tenga la data, vs pedir 1 y refetchear al expandir. Recomendación: pedir 2 desde server (`monthsAhead: 1`) — penaliza el caso móvil con un mes de data no usada, pero evita refetch en desktop.

### 5.3 `src/pods/home/components/availability.component.tsx`

Reemplazar el placeholder por:

- Estado: `currentMonth` (controlado), `numberOfMonths` (1 o 2 según viewport).
- Hook `useMediaQuery('(min-width: 768px)')` (o similar) con valor inicial `false` para SSR.
- Componente `<Calendar>` de shadcn con:
  - `mode="single"` en paso 1 (no se usa pero requerido por la API), luego `mode="range"` en paso 2.
  - `numberOfMonths={isDesktop ? 2 : 1}`.
  - `month={currentMonth}`, `onMonthChange={setCurrentMonth}`.
  - `fromMonth={startOfToday}`.
  - `disabled={[{ before: startOfToday }, ...bookedRanges]}`.
  - `modifiers={{ booked: bookedRanges }}` + `modifiersClassNames={{ booked: 'bg-[var(--booked-bg)]' }}` para el color.
- Loader de meses al cambiar mes (`onMonthChange` dispara refetch via `useNavigate` con search params, o `useQuery` si se introduce TanStack Query).

### 5.4 Componente `Calendar` (shadcn)

Instalar con `npx shadcn add calendar`. Personalizar estilos para alinearlos con `island-shell` / variables `--sand`, `--lagoon-deep`, `#e8b3a4` ya en uso en la leyenda.

### 5.5 Tests

- Server fn: test unitario añadiendo `monthsAhead` (que el rango devuelto sea correcto, que un bloque que solapa con cualquiera de los N meses aparezca).
- Componente: test de render con bloques mock — que los días ocupados estén `disabled` y con la clase de modifier.
- Edge case: bloque con `endDate` igual al último día del mes — verificar que el día anterior se pinta y el `endDate` queda libre.

## 6. Riesgos / aspectos abiertos

- **API de `react-day-picker` v9** (la última): verificar el shape exacto de `disabled` (array de matchers) y `modifiers`. El componente shadcn que se instale puede traer la versión 8 o 9 — confirmar antes de codear.
- **SSR + hydration en TanStack Start**: validar que `useEffect` para expandir a 2 meses no genera warnings de hydration. Alternativa: usar `useSyncExternalStore` o un hook tipo `useIsClient`.
- **Estilos custom**: el color de "ocupado" debe ser distinto del de "seleccionado" (paso 2). Convención propuesta: `bg-[#e8b3a4]` (ya usado en leyenda) para ocupado, `bg-[var(--lagoon-deep)]` para seleccionado.
- **Server fn revalidation tras navegación**: si se usa el approach de search params + loader, la URL cambia al navegar mes a mes (refleja `?month=06&year=2026`). Si no, mantenerlo en estado local del componente. **A decidir en implementación** — afecta a deep-linking pero no al alcance del PRD.

## 7. Fuera de alcance (no para este PRD)

- Selección en backend (server fn que cree una reserva). Sólo definimos las reglas para no bloquear.
- Multi-propiedad: el `PROPERTY_ID = "villa_001"` sigue hardcodeado.
- Internacionalización del calendario (locale de react-day-picker — actualmente todo en `es-ES` por la home).
- Vista admin (distinguir tipos de bloqueo, edición).
- Caché client-side avanzada (TanStack Query).

## 8. Plan de fases sugerido (input para `prd-to-plan`)

1. **Fase 1 — API**: ampliar `getAvailabilityByMonth` con `monthsAhead`. Test unitario. Cero impacto visual.
2. **Fase 2 — Display estático**: instalar shadcn Calendar, render con `numberOfMonths={2}` hardcodeado en desktop, pintar `disabled` + `modifiers` con los bloques actuales del mes. Sin navegación todavía.
3. **Fase 3 — Mobile responsivo**: añadir el hook de viewport y el flujo SSR→cliente para 1↔2 meses.
4. **Fase 4 — Navegación**: controlar `month` con `onMonthChange`, dispar refetch (decidir search params vs estado local). `fromMonth={today}`.
5. **Fase 5 — Leyenda y panel**: ajustar las labels del CMS (freeLabel + BusyLabel visibles, selectionLabel oculto). Panel teaser con CTA deshabilitado.
6. **Fase 6 (futura) — Selección**: cambiar a `mode="range"`, validar min 2 noches, conectar CTA a "Comprobar disponibilidad" (server fn placeholder).

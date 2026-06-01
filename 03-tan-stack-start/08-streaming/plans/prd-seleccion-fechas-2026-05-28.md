# PRD — Selección de rango de fechas (paso 2 del calendario)

**Fecha:** 2026-05-28
**Autor:** Braulio (sesión grill-me con Claude)
**Estado:** Definido — listo para implementación directa
**Sección afectada:** `src/pods/home/components/availability.component.tsx`
**PRD predecesor:** [`prd-calendario-disponibilidad-2026-05-28.md`](./prd-calendario-disponibilidad-2026-05-28.md) (sección 4.8)
**Componente shadcn afectado:** `src/components/ui/calendar.tsx` (customización de modifiers de rango)

---

## 1. Contexto

El calendario actual (paso 1) muestra disponibilidad en `mode="single"` sin permitir selección real. El CTA "Consultar disponibilidad" está siempre `disabled` y el texto del panel inferior es estático.

Toca activar la selección de un **rango de fechas** que el usuario pueda usar para consultar disponibilidad. Por ahora el CTA al pulsarse hace un `console.log` (placeholder hasta backend real).

## 2. Objetivos

- Permitir al usuario seleccionar un rango de fechas (check-in / check-out) en el calendario.
- Validar la selección (min 2 noches) y dar feedback claro de qué se ha seleccionado o por qué no es válido.
- Habilitar el CTA "Consultar disponibilidad" sólo si la selección es válida y, al pulsarlo, hacer `console.log` con la selección.

## 3. Decisiones cerradas (del PRD predecesor, sección 4.8)

Estas decisiones siguen vigentes y NO se reabren:

- `mode="range"` en react-day-picker.
- **Bloqueo duro nativo**: días ocupados (`disabled`) reinician la selección si el usuario intenta arrastrar a través.
- **Mínimo 2 noches**, sin máximo explícito.
- **Validación al soltar**: si `nights < 2`, marcar inválida y deshabilitar CTA. Permitir que la selección de 1 noche se pinte (no usar `min={2}` del prop nativo) — patrón pedagógico.
- **Selección puede empezar y/o terminar en el día de checkout de otra reserva** (consecuencia de la convención `endDate` exclusiva).

## 4. Decisiones cerradas (nuevas en esta sesión)

### 4.1 Color visual del rango

- `range_start`, `range_end` → `bg-[var(--lagoon-deep)]` con `text-white`.
- `range_middle` → `bg-[var(--lagoon-deep)]/15` (versión muy suave) o `bg-[var(--sand)]` si encaja mejor visualmente.
- Sobrescribir las clases del componente `src/components/ui/calendar.tsx` o pasar `modifiersClassNames` desde el componente `availability.component.tsx`. Recomendado: pasarlo desde `availability.component.tsx` para no contaminar el componente shadcn base.

### 4.2 Texto del panel inferior según estado de selección

| Estado | `rangeSelectedTopTitle` | Texto principal |
|---|---|---|
| Vacío (sin selección) | "Rango seleccionado" (del CMS) | "Selecciona tus fechas" (del CMS) |
| Parcial (sólo `from`) | "Rango seleccionado" (del CMS) | "Selecciona tus fechas" (del CMS) — **se mantiene igual que vacío** |
| Completo válido (≥ 2 noches) | "Rango seleccionado" (del CMS) | `"Del 5 al 8 de julio · 3 noches"` |
| Completo válido cross-month | idem | `"Del 30 de junio al 3 de julio · 3 noches"` |
| Completo inválido (< 2 noches) | idem | `"Del 5 al 6 de julio · Mínimo 2 noches"` con `text-destructive` |

**Formato exacto del texto válido**:
- Mismo mes: `"Del <D1> al <D2> de <mes> · <N> noches"`
- Distinto mes: `"Del <D1> de <mes1> al <D2> de <mes2> · <N> noches"`
- Usar `toLocaleDateString("es-ES", { day: "numeric", month: "long" })` y comparar `from.getMonth() === to.getMonth()` para decidir formato.

### 4.3 Estado del CTA "Consultar disponibilidad"

| Estado | CTA |
|---|---|
| Vacío | `disabled` |
| Parcial | `disabled` |
| Completo válido | habilitado, click → `console.log("Consulta disponibilidad:", { from, to, nights })` |
| Completo inválido | `disabled` |

### 4.4 Botón "Limpiar"

- Link discreto (texto `<button>` estilo link, no `Button` shadcn) con texto `"Limpiar"`.
- Posición: esquina superior-derecha del panel inferior `bg-[var(--sand)]`.
- **Visible si y sólo si hay alguna selección parcial o completa** (`from` definido).
- Al pulsarlo: resetea la selección (`setSelected(undefined)`).

### 4.5 Comportamiento post-CTA

- **Aplazado al paso 3** (cuando exista backend real).
- Por ahora: `onClick={() => console.log("Consulta disponibilidad:", { from, to, nights })}`. Sin lógica de limpiar, sin deshabilitar tras pulsar, sin toast. El usuario puede pulsar varias veces sin penalización.

### 4.6 Mobile (1 mes visible)

- react-day-picker mantiene la selección internamente al navegar entre meses, aunque `from` quede fuera del viewport.
- **No añadir hint visual extra** ("tienes `from` en mayo") — patrón conocido y aceptable.
- El usuario debe navegar al mes donde está `to` para verlo pintado tras seleccionar.

### 4.7 Formato del `console.log`

```ts
console.log("Consulta disponibilidad:", {
  from: range.from,  // Date
  to: range.to,      // Date
  nights: <calculado>, // number
});
```

`nights` se calcula como `Math.round((to.getTime() - from.getTime()) / 86_400_000)`.

## 5. Cambios concretos esperados

### 5.1 `src/pods/home/components/availability.component.tsx`

- Cambiar `mode="single"` → `mode="range"`.
- Estado: añadir `useState<DateRange | undefined>` para la selección (`react-day-picker` exporta `DateRange`).
- Calcular `nights` derivado de la selección.
- Pasar `selected={range}` y `onSelect={setRange}` al `<Calendar>`.
- Añadir `modifiersClassNames` para `range_start`, `range_end`, `range_middle` con los colores de 4.1 (si shadcn no los soporta directamente como modifiers, sobrescribir en `classNames` del `<Calendar>`).
- Renderizar el panel inferior según los estados de 4.2.
- Renderizar el botón "Limpiar" según 4.4.
- Habilitar/deshabilitar el CTA según 4.3.
- Conectar `onClick` del CTA al `console.log` de 4.7.
- **El texto `selectionLabel` del CMS** (que en el paso 1 se ocultó) ahora **se muestra en la leyenda** como tercer chip junto a "Libre" y "Ocupado" (en el `<header>` del card).

### 5.2 `src/components/ui/calendar.tsx` (opcional)

- **Si** los selectores de `range_start`, `range_end`, `range_middle` ya no encajan visualmente con `--lagoon-deep`, sobrescribirlos en la prop `classNames` desde `availability.component.tsx` en lugar de tocar el componente shadcn base. Mantener el componente base sin acoplar a la paleta del proyecto.

### 5.3 Tests (sugeridos, no bloqueantes para esta fase)

- Selección de 1 noche → `text-destructive` visible, CTA disabled.
- Selección de 2 noches → CTA habilitado, click loguea.
- Selección que cruza un día bloqueado → react-day-picker reinicia el `from`.
- Botón "Limpiar" → selección resetea.
- Cross-month: texto "Del X de jun al Y de jul · N noches".

## 6. Aspectos abiertos / futuros

- **Persistencia de la selección en URL** (deep linking de la selección, no del mes visible) → **futuro**, no en este PRD.
- **Validación server-side al pulsar CTA**: hoy es solo console.log. En paso 3, una server fn `checkAvailability({from, to})` revalidará contra la BBDD (puede haber cambios desde la carga del calendario).
- **Estado "consulta en curso"** (spinner en CTA, etc.) → cuando haya backend real.
- **Persistir min 2 noches en el CMS** como `minNights` configurable → futuro si llega multi-propiedad.

## 7. Fuera de alcance

- Crear la reserva real (server fn de booking).
- Mostrar precio total estimado en el panel.
- Persistir la selección entre recargas.
- Deep linking de la selección.

## 8. Plan de implementación sugerido (single-fase)

Como esta historia es relativamente pequeña, se implementa de tirón:

1. Cambiar `mode` a `range` y conectar `selected` + `onSelect`.
2. Customizar colores de rango con `modifiersClassNames` (o `classNames` si toca tocar las clases base).
3. Calcular `nights` y construir el helper `formatRangeLabel(range)`.
4. Renderizar el panel inferior con switch sobre los 4 estados (vacío / parcial / válido / inválido).
5. Añadir botón "Limpiar".
6. Habilitar CTA condicional + onClick con `console.log`.
7. Mostrar `selectionLabel` del CMS como tercer chip en la leyenda.
8. Verificar TypeScript + arrancar dev server y probar en navegador (selección, cross-month, error min 2 noches, limpiar).

# PRD: Página de reserva (solicitud de reserva del huésped)

**Date**: 2026-05-29
**Mode**: co-creation (con elementos de validación)
**Status**: completed

## Problem Statement

Hoy, en la home, el usuario selecciona un rango de fechas en el calendario de
disponibilidad y al pulsar "Consultar disponibilidad" solo se hace un
`console.log` (`availability.component.tsx`, `handleConsult`). No hay continuación
del flujo de reserva.

Queremos que, tras seleccionar fechas válidas (mínimo 2 noches) y pulsar el CTA,
el usuario navegue a una nueva página `/reserva` que:

- Mantiene el mismo estilo visual y es responsiva (CSS vars `--sea-ink`,
  `--lagoon-deep`, `--sand`; clases `island-shell`, `page-wrap`, etc.).
- Muestra la selección de fechas realizada, con opción de cambiarla.
- Pide los datos del huésped: nombre, apellido, email, teléfono, número de
  huéspedes y comentarios adicionales.
- Tiene un botón que (en el futuro) enviará un correo al dueño de la propiedad
  para confirmar la reserva.

**Alcance de esta iteración:** solo maquetación. El botón final hará
`console.log` con lo elegido (fechas + datos del huésped). El envío real de
correo queda fuera.

**Descubierto en la exploración del codebase:**

- TanStack Start con routing por ficheros (`src/routes/`) y patrón **pods**
  (`pod` + `vm` + `mapper` + `api` + `model` + `components`).
- El calendario vive acoplado dentro de `src/pods/home/components/availability.component.tsx`,
  junto con su lógica de selección de rango, carga de bloques ocupados
  (`getAvailabilityByMonth`) y validación `MIN_NIGHTS = 2`.
- El contenido textual viene de Content Island (CMS), no hardcodeado.
- Stack disponible para forms: TanStack Form + Zod (skill `tanstack-form` y
  memorias del proyecto), aunque el trigger de la skill apunta a `apps/web`
  (estructura distinta a este repo, que usa `src/`).
- Memoria del proyecto: en TanStack Start los ficheros `*.server.*` rompen el
  build (usar `*.api.ts`), y el builder de server-fn usa `.inputValidator()`.

## User Stories

1. Como visitante, quiero que al consultar disponibilidad con fechas válidas se
   me lleve a una página de reserva, para continuar el proceso sin fricción.
2. Como visitante, quiero ver claramente las fechas que seleccioné en la página
   de reserva, para confirmar que son correctas.
3. Como visitante, quiero poder cambiar las fechas desde la propia página de
   reserva (calendario inline), para corregir sin perder los datos ya tecleados.
4. Como visitante, quiero introducir mis datos (nombre, apellido, email,
   teléfono, nº de huéspedes y comentarios), para que el dueño pueda contactarme.
5. Como visitante, quiero pulsar "Solicitar reserva" y que se registre lo
   elegido, para enviar mi solicitud (de momento `console.log`).
6. Como visitante que llega con fechas ocupadas en la URL, quiero un aviso claro
   y poder reelegir en el mismo sitio, para no quedarme bloqueado.
7. Como visitante en móvil, quiero una página apilada y legible, para reservar
   cómodamente desde el teléfono.

## Product / UX Decisions

- **Página separada (no modal):** se navega a `/reserva` — decidido por el
  usuario; flujo de reserva merece su propio espacio y URL compartible.
- **Cambiar fecha = calendario inline:** el calendario reutilizable se muestra
  en la propia página de reserva (colapsado/expandible) — no se pierde el
  contexto del formulario al reelegir.
- **Fechas ocupadas → modal + abrir calendario inline:** si el formato es válido
  pero las fechas están ocupadas, el usuario se queda en `/reserva`, ve un modal
  de aviso y al cerrarlo se abre el calendario inline para reelegir. No se
  redirige a home en este caso (evita pérdida de contexto y duplicar el lugar
  donde se eligen fechas).
- **Número de huéspedes = input numérico libre:** coherente con "solo
  maquetación"; acotar por capacidad de la villa queda como mejora futura.
- **Botón final = "Solicitar reserva":** el dueño aún debe confirmar, por lo que
  "solicitar" es más honesto que "reservar". Hace `console.log({ fechas, datosHuésped })`.
- **Layout = 2 columnas (resumen | formulario):** en desktop, izquierda card con
  fechas + "cambiar" + calendario inline, derecha el formulario; en móvil
  apilado (fechas arriba, form abajo). Coherente con el grid de la home.
- **Mismo lenguaje visual:** reutiliza CSS vars y clases utilitarias existentes
  para mantener consistencia.

## Technical Decisions

- **Ruta `/reserva`, pod `booking`:** URL en español (coherente con el dominio),
  código del pod en inglés (coherente con `home`/`availability`).
- **Query string solo con fechas:** `?from=YYYY-MM-DD&to=YYYY-MM-DD` (ISO).
  Las fechas son la única fuente de verdad en la URL; los datos del huésped y el
  nº de huéspedes viven en el formulario de la página.
- **`validateSearch` con Zod en `/reserva`:** valida formato/orden/no-pasado y
  mínimo de 2 noches. Si el formato es inválido (URL manipulada) → redirige a
  home. Si es válido pero ocupado → modal + calendario inline (no redirige).
- **Extraer selector de rango reutilizable:** sacar de `availability.component.tsx`
  la lógica de selección de rango + carga de bloques + validación de mínimo de
  noches a un componente compartido (p. ej. `date-range-picker`), consumido por
  home y `/reserva`. El componente extraído incluye **calendario + panel de
  rango, SIN botón de acción**; cada página aporta su propio CTA
  (home: "Consultar disponibilidad" que navega; reserva: calendario para
  reelegir).
- **Botón de home pasa de `console.log` a navegar:** `handleConsult` navega a
  `/reserva` con las fechas en el query string (solo se habilita con fechas
  válidas / ≥ 2 noches, como ya ocurre).
- **El loader de `/reserva` carga los bloques de disponibilidad**
  (`getAvailabilityByMonth`): necesarios para pintar el calendario inline y para
  detectar el caso de fechas ocupadas.
- **Formulario solo markup:** inputs nativos estilizados, sin validación todavía;
  el submit recoge los valores y hace `console.log`. TanStack Form + Zod queda
  para una iteración posterior.

## Testing Decisions

- **`validateSearch` (Zod schema):** unit test del schema — fechas válidas,
  formato inválido, orden invertido, fecha pasada, menos de 2 noches.
- **Selector de rango reutilizable:** test de que selección válida habilita el
  CTA y que < 2 noches lo deja deshabilitado (comportamiento ya existente, no
  romperlo al extraer).
- **Navegación home → /reserva:** test de integración: seleccionar rango válido +
  CTA navega con el query string correcto.
- **Maquetación de `/reserva`:** smoke test de render con fechas válidas en la
  URL (todos los campos presentes); el `console.log` del submit no se testea en
  esta fase.
- **No testear:** estilos exactos, ni el envío de correo (fuera de alcance).

## Out of Scope

- Envío real del correo al dueño (de momento solo `console.log`).
- Validación del formulario (email, requeridos, etc.) — solo markup.
- Acotar el nº de huéspedes por la capacidad real de la villa.
- Persistencia de la reserva en base de datos.
- Pasar el nº de huéspedes por query string.
- Confirmación/estado de la reserva (pending/confirmed) en backend.

## Discarded Alternatives

- **Modal/drawer para todo el flujo de reserva:** descartado — el usuario quiere
  una página dedicada y URL compartible.
- **Modal + redirigir a home cuando las fechas están ocupadas:** descartado —
  pierde el contexto del formulario y duplica el lugar donde se eligen fechas;
  con el calendario inline ya disponible, reelegir in-situ es más coherente.
- **Duplicar el calendario en `/reserva`:** descartado — genera deuda técnica y
  dos sitios que mantener; mejor extraer un componente compartido.
- **Query string con fechas + huéspedes:** descartado — hoy la home no pide
  huéspedes, así que meterlo sería especulativo.
- **Select / stepper para nº de huéspedes:** descartado por ahora — input libre
  es suficiente para la maquetación.
- **TanStack Form + Zod desde el inicio:** pospuesto — incompatible con el
  alcance "solo maquetación"; se montará al implementar la lógica real.

## Assumptions

- El componente `Calendar` (shadcn / react-day-picker) puede extraerse de
  `availability.component.tsx` sin romper el comportamiento actual de la home.
- Los textos de la página de reserva pueden ser estáticos por ahora (o añadirse a
  Content Island más adelante); no bloquea la maquetación.
- `getAvailabilityByMonth` sirve para cubrir el rango de fechas recibido y poder
  detectar solapes con bloques ocupados.
- El formato ISO `YYYY-MM-DD` en el query string es suficiente (sin zona horaria).

## Risks

- **Sincronización de zona horaria:** las fechas en query string como `YYYY-MM-DD`
  vs los `Date` del calendario pueden desfasar por TZ; cuidar el parseo a medianoche local.
- **Refactor del calendario:** al extraer el selector compartido se puede romper
  la home si la lógica de bloques/min-noches no se traslada con cuidado.
- **Detección de "ocupado" parcial:** un rango puede solapar parcialmente un
  bloque; definir bien qué cuenta como ocupado al validar en `/reserva`.
- **URL manipulable:** confiar solo en `validateSearch` para formato; la
  disponibilidad real sigue dependiendo de los bloques cargados en el loader.

## Open Points

- [ ] Definir si los textos de `/reserva` se mueven a Content Island.
- [ ] Validación real del formulario (TanStack Form + Zod) en iteración futura.
- [ ] Implementar el envío de correo al dueño (server function `*.api.ts` +
      `.inputValidator()`).
- [ ] Acotar nº de huéspedes por capacidad de la villa.
- [ ] Persistir la solicitud de reserva.

## Next Steps

- [ ] Run `prd-to-plan` to create implementation phases (tracer bullets)
- [ ] Run `prd-to-issues` to convert phases into GitHub issues
- [ ] Implementar la maquetación de `/reserva` y el refactor del calendario

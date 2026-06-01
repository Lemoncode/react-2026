# PRD — Console runner `seed.ts` para poblar MongoDB

- **Fecha:** 2026-05-28
- **Estado:** Definido, listo para implementar
- **Depende de:** `plans/prd-mongo-docker-setup-2026-05-28.md` (Mongo dockerizado ya operativo)
- **Alcance:** Script TypeScript que, ejecutado con `pnpm db:seed`, conecta con la Mongo local, **dropea y repuebla** las colecciones `properties` y `calendarBlocks` con datos de prueba — mezcla de escenarios fijos y reservas aleatorias en los próximos 6 meses — y crea los índices necesarios.

---

## 1. Contexto

Tenemos Mongo corriendo en local (`mongodb://localhost:27018/calendar-availability`) sin datos. La UI del calendario de disponibilidad necesita datos realistas para desarrollarse y validarse. Antes de tocar la lógica de la app, queremos un mecanismo reproducible y rápido que rellene la BBDD con un set consistente.

El modelo de dominio es **alquiler vacacional** (no slots horarios): una `property` (villa) tiene múltiples `calendarBlocks`, cada uno representando una reserva o un bloqueo en un rango de fechas. La consulta principal es de solape:

```js
startDate < requestedEnd && endDate > requestedStart
```

## 2. Objetivos

- `pnpm db:seed` deja la BBDD en un estado conocido y útil para desarrollar la UI.
- Mezcla de **escenarios fijos** (predecibles, sirven para iterar UI sin que cambie cada ejecución) y **aleatorios** (densidad realista).
- Idempotente por *drop + recreate*: cada ejecución parte de cero en las dos colecciones afectadas.
- Sin solapes entre reservas activas (`pending` / `confirmed`) de una misma propiedad: refleja la realidad de no poder doble-reservar.
- Índice operativo creado tras el insert.

## 3. Decisiones tomadas

| Tema | Decisión | Notas |
|---|---|---|
| Lenguaje | TypeScript | Coherente con el resto del repo. |
| Ejecutor | `tsx` (devDep) | Soporta ESM nativo, cero config. |
| Driver BBDD | `mongodb` (oficial, dep) | Suficiente para seed. Si la app introduce Mongoose más adelante, no afecta a este script. |
| Datos guest | `@faker-js/faker` locale `es` (devDep) | Nombres/emails/teléfonos españoles. |
| Ubicación | `scripts/seed.ts` | Fuera de `src/`, no se bundlea con la app. |
| Lectura `.env` | `node --env-file=.env` (nativo Node 22+) | Sin dotenv, sin dependencia extra. |
| Conexión | Lee `MONGO_URI` de `.env` | Falla con mensaje claro si falta. |
| Idempotencia | Drop + recreate de las 2 colecciones | NO se dropa la BBDD entera. Otras colecciones quedan intactas. |
| Nombres colección | `properties`, `calendarBlocks` | Coincide con el documento técnico, no con "availabilities" del prompt inicial (rechazado por inconsistente). |
| Cantidad properties | 1 villa (`villa_001` "Villa Mediterránea") | El `_id` se mantiene como string, según el ejemplo. |
| Cantidad calendarBlocks | 4 escenarios fijos + ~25 reservas aleatorias + ~5 bloqueos aleatorios = ~34 docs | Densidad realista en 6 meses. |
| Distribución estados | ~70% `confirmed`, ~20% `pending`, ~10% `cancelled` | Sólo entre las reservas (no aplica a bloqueos). |
| Distribución tipos | Mayoría `booking`, algunos `block` (de tipo `maintenance` u `owner_use`) | |
| Solapes | Prohibidos entre `confirmed`/`pending`. Permitidos para `cancelled`. | Refleja realidad. |
| Fechas | Tipo `Date` nativo en BSON | Recomendación del documento técnico. |
| Currency | `EUR` fijo | |
| Índice | `{ propertyId: 1, status: 1, startDate: 1, endDate: 1 }` creado tras inserts | Indicado en el documento técnico. |
| Validación Zod | NO | El driver inserta objetos planos; añadir Zod aquí es ruido. |
| Script npm | `db:seed` | |
| Logging | `console.log` con counts: properties insertadas, calendarBlocks por estado, índices creados | Suficiente. |

## 4. Entregables

### 4.1. Nuevas dependencias

```json
"dependencies": {
  "mongodb": "^6.x"
},
"devDependencies": {
  "@faker-js/faker": "^9.x",
  "tsx": "^4.x"
}
```

### 4.2. `scripts/seed.ts`

Script ejecutable que:

1. Lee `MONGO_URI` de `process.env`. Si falta, sale con código 1 y mensaje claro.
2. Conecta al cliente Mongo.
3. Sobre la BBDD `calendar-availability`:
   - `db.collection('properties').drop().catch(() => {})` (ignora "ns not found")
   - `db.collection('calendarBlocks').drop().catch(() => {})`
4. Inserta 1 documento en `properties`:
   ```ts
   {
     _id: "villa_001",
     name: "Villa Mediterránea",
     address: { country: "Spain", city: "Málaga", street: "Calle del Mar 10", postalCode: "29001" }
   }
   ```
5. Construye los **4 escenarios fijos** (ver §5).
6. Construye **~25 reservas aleatorias** + **~5 bloqueos aleatorios** evitando solapes con los activos ya generados (ver §6).
7. `insertMany` en `calendarBlocks`.
8. Crea el índice compuesto.
9. Loguea contadores y cierra la conexión.

### 4.3. Script en `package.json`

```json
"db:seed": "node --env-file=.env --import tsx scripts/seed.ts"
```

### 4.4. README

Añadir bajo la sección "Base de datos local":

```bash
pnpm db:seed   # Borra y repuebla properties + calendarBlocks
```

Con nota: "Drop + recreate de esas dos colecciones. No afecta a otras colecciones de la BBDD."

## 5. Escenarios fijos (orden y contenido)

Todas con `propertyId: "villa_001"`, `currency: "EUR"`. Fechas relativas a "hoy" calculadas en runtime.

1. **Reserva confirmada y pagada.** Mes próximo, del día 15 al 20.
   - `type: "booking"`, `status: "confirmed"`, `nights: 5`
   - `guest`: Ana Pérez (`ana.perez@example.com`, `+34600111222`)
   - `price`: nightlyRate 150, cleaningFee 40, touristTax 20, discount 30, subtotal 750, total 780
   - `payment`: status `paid`, method `stripe`, transactionId `txn_seed_001`, paidAmount 780

2. **Reserva pendiente sin pago.** Sábado-domingo de aproximadamente 2 meses vista.
   - `type: "booking"`, `status: "pending"`, `nights: 2`
   - `guest`: Juan García (`juan.garcia@example.com`, `+34611222333`)
   - `price`: nightlyRate 180, cleaningFee 40, touristTax 8, discount 0, subtotal 360, total 408
   - `payment`: status `pending`, sin transactionId ni paidAt

3. **Bloqueo de mantenimiento.** Esta semana, 3 días seguidos.
   - `type: "block"`, `subtype: "maintenance"`, `status: "confirmed"`, `nights: 3`
   - Sin `guest`, sin `price`, sin `payment`
   - `notes.internal: "Sustitución calentador"`

4. **Reserva cancelada.** Dentro de ~3 meses, 4 noches.
   - `type: "booking"`, `status: "cancelled"`, `nights: 4`, `cancelledAt: <fecha actual − N>`
   - `guest`: María López
   - `payment`: status `refunded`, method `stripe`, paidAmount 0
   - Se conserva en BBDD (no se borra), siguiendo recomendación del doc técnico.

## 6. Algoritmo de generación aleatoria

```
horizonte = [hoy, hoy + 6 meses]
slots_ocupados = ranges([escenarios_fijos donde status ∈ {confirmed, pending}])

para i en 1..25:
  intentos = 0
  bucle:
    start = random_date(horizonte)
    nights = randint(2, 10)
    end = start + nights días
    si no solapa con slots_ocupados:
      status = weighted_pick({confirmed: 0.7, pending: 0.2, cancelled: 0.1})
      generar reserva aleatoria con faker
      si status ∈ {confirmed, pending}: añadir [start, end] a slots_ocupados
      añadir a array
      break
    intentos++
    si intentos > 20: skip (no cabe)

para j en 1..5:
  mismo proceso, pero type: "block", subtype: pick({maintenance, owner_use}),
  duración randint(1, 5), sin guest/price/payment
```

Notas:
- Los `cancelled` se pueden solapar con cualquier cosa (son inactivos).
- `nightlyRate` aleatorio entre 120-220. `cleaningFee` 30-60. `touristTax` ≈ 2/noche/adulto.
- `occupancy.adults`: 1-4. `children`: 0-2. `babies`/`pets`: poco probable.
- `createdAt = now - randint(1..60) días`, `updatedAt = createdAt`.

## 7. Fuera de alcance

- **Múltiples propiedades** (multi-tenant): solo 1 villa.
- **Migraciones formales** (no hay sistema de versionado).
- **Datos de producción / staging**: el seed es solo para dev local.
- **Tests del propio seed**: si surge dolor, se añaden.
- **CLI con flags** (`--reset`, `--only-properties`, etc.): drop + recreate es la única estrategia.
- **Seeding incremental o append**: explícitamente descartado.

## 8. Criterios de aceptación

- [ ] Con Mongo corriendo y la BBDD vacía, `pnpm db:seed` termina con exit code 0 e imprime un resumen tipo:
      ```
      Properties inserted: 1
      CalendarBlocks inserted: 34 (confirmed: 24, pending: 6, cancelled: 4)
      Index created: propertyId_1_status_1_startDate_1_endDate_1
      ```
- [ ] Con datos previos en `properties` y `calendarBlocks`, una segunda ejecución de `pnpm db:seed` los borra y repuebla — el conteo final es el mismo (±aleatoriedad acotada).
- [ ] `mongosh "mongodb://localhost:27018/calendar-availability" --eval 'db.calendarBlocks.find({status:"confirmed"}).count()'` devuelve al menos 1 (el escenario fijo confirmado).
- [ ] La consulta de solape del doc técnico, ejecutada para "mes próximo del 15 al 20", devuelve **exactamente** el escenario fijo #1 (Ana Pérez).
- [ ] No hay solapes entre `confirmed`/`pending` para `villa_001` (consulta de verificación con `$lookup` o agregación que valide pares de blocks activos sin solape).
- [ ] `db.calendarBlocks.getIndexes()` lista el índice compuesto.
- [ ] Si `MONGO_URI` no está definido, el script sale con código 1 y mensaje "Missing MONGO_URI in environment".

## 9. Riesgos y notas

- **Datos sensibles**: ninguno. Todos los emails/teléfonos son sintéticos vía Faker.
- **Rendimiento**: ~34 documentos, irrelevante.
- **Compatibilidad Node 22+**: `--env-file` y `--import tsx` requieren Node 22+. Si el equipo trabaja con Node 20, hay que ajustar. **Asumir Node 22+** (es la LTS actual a fecha del PRD).
- **Drop "ns not found"**: la primera ejecución sobre BBDD virgen lanza "ns not found" al dropear; se ignora con `.catch(() => {})`.
- **El índice se crea tras los inserts** intencionalmente: es más rápido construirlo de golpe que actualizarlo por cada insert.
- **Fechas relativas a "hoy"**: los escenarios fijos se calculan en runtime para no quedar obsoletos. Implica que las fechas exactas cambian con el calendario, pero la **semántica** (mes próximo, esta semana, ~3 meses) se mantiene.

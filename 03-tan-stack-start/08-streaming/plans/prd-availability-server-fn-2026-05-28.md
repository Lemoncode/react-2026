# PRD: Server function de disponibilidad mensual (driver MongoDB nativo)

**Date**: 2026-05-28
**Mode**: validation
**Status**: completed

## Problem Statement

La aplicación ya tiene una base de datos MongoDB corriendo en Docker (`mongo:8` en puerto host `27018`) con datos de propiedades y `calendarBlocks` cargados por el script `scripts/seed.ts`. La home (`src/routes/index.tsx`) renderiza contenido estático desde Content Island, pero no tiene aún ningún acceso a los datos de disponibilidad propios.

El siguiente paso es exponer una **server function** que, dado un mes y un año, lea de Mongo todos los bloques (reservas confirmadas/pendientes y bloqueos) que se solapan con ese mes, los mapee a un VM mínimo y los devuelva al loader de la home. De momento solo se imprime por consola — esto es un **tracer bullet** que valida el camino completo cliente → server fn → Mongo → cliente antes de meter UI de calendario.

Restricciones del usuario:
- Driver nativo de MongoDB (sin Mongoose, sin Prisma).
- La URL de conexión va por variable de entorno `MONGO_URI`.
- Convención del proyecto: server functions en archivos `*.api.ts`, **nunca** `*.server.*` (rompe el build por la regla `import-protection`).

## User Stories

1. Como desarrollador, quiero exponer la URL de Mongo como variable de entorno (`MONGO_URI`) para no acoplar la app a una infraestructura concreta y poder cambiar puerto o credenciales sin tocar código.
2. Como desarrollador, quiero una server function `getAvailabilityByMonth({ month, year })` que reciba mes (1=enero) y año explícitos, para evitar la ambigüedad de "qué año asume" cuando se llama desde la home.
3. Como desarrollador, quiero que esa server function devuelva **todos los bloques activos** (`confirmed` + `pending`) que se solapan con el mes pedido, para poder pintar correctamente bloqueos que cruzan frontera de mes (ej. una reserva del 28-feb al 5-mar debe aparecer en febrero y en marzo).
4. Como desarrollador, quiero validar el input con Zod en el `validator` de `createServerFn`, para que un cliente que mande `month=99` reciba un error claro y la query a Mongo nunca se ejecute con basura.
5. Como desarrollador, quiero que la conexión a Mongo se cachee como singleton en el servidor, para no pagar el handshake de conexión en cada render de la home.
6. Como desarrollador, quiero que el VM devuelto contenga solo `id, type, status, startDate, endDate, nights`, para no filtrar al cliente datos sensibles (guest, payment, price) que aún no necesito.
7. Como desarrollador, quiero que el loader de la home llame a `getAvailabilityByMonth` con mes y año actuales en paralelo a `getHomePageContent`, y haga `console.log` del resultado, para validar el camino completo antes de empezar la UI de calendario.

## Product / UX Decisions

- **Año implícito en la API**: añadir parámetro `year` explícito — porque asumir `new Date().getFullYear()` rompe el caso "pides enero estando en diciembre". El loader de la home calculará año actual *por ahora*, pero la API queda lista para cualquier consumidor.
- **Criterio "del mes"**: solape — `startDate < finDelMes` AND `endDate > inicioDelMes` — porque el resultado se va a usar para pintar un calendario de ocupación, donde un bloque que cruza frontera debe aparecer en ambos meses.
- **Status incluidos**: solo `confirmed` y `pending` — porque las reservas `cancelled` no bloquean el calendario; un usuario podría reservar esas fechas. El propio seed las separa por la misma razón (`takenActive` ignora canceladas).
- **propertyId**: hardcodeado a `"villa_001"` — porque el seed solo crea una villa y este paso es un tracer bullet. Se parametriza cuando aparezca multi-propiedad.
- **Mes inicial en la home**: mes y año actuales hardcodeados en el loader — porque el objetivo es solo `console.log`; pasar por URL search params es trabajo prematuro para un paso que aún no tiene UI.

## Technical Decisions

- **Driver**: `mongodb` nativo (ya instalado en `package.json`, v7.2.0). Sin Mongoose ni Prisma.
- **Variable de entorno**: `MONGO_URI` (ya presente en `.env` y `.env.example` con `mongodb://localhost:27018/calendar-availability`). No se añade nada nuevo aquí — se reutiliza la misma que usa el seed.
- **Conexión**: singleton cacheado en módulo (`src/lib/mongodb.ts`). Reutiliza el `MongoClient` entre invocaciones de la server function. Sin `client.close()` explícito (el pool del driver lo gestiona). Cuidado pendiente con HMR de Vite (ver Risks).
- **Validación de input**: Zod en `.validator(...)` de `createServerFn`. Requiere **añadir `zod` a `package.json`** (no está instalado). Schema: `{ month: int 1..12, year: int 2020..2100 }`.
- **Ubicación del código**: `src/pods/home/availability.api.ts`. Coherente con el `home.api.ts` ya existente. Si en el futuro aparece una página de calendario dedicada, se moverá a un pod propio.
- **Forma del retorno**: VM mapeado en `src/pods/home/availability.vm.ts`:
  ```ts
  export interface CalendarBlockVm {
    id: string;                            // _id.toString()
    type: 'booking' | 'block';
    status: 'pending' | 'confirmed';       // 'cancelled' nunca llega
    startDate: Date;
    endDate: Date;
    nights: number;
  }
  ```
- **Mapper**: `src/pods/home/availability.mapper.ts` con función `mapToCalendarBlockVm(doc)`. Mismo patrón que `home.mapper.ts`.
- **Query Mongo**:
  ```ts
  db.collection('calendarBlocks').find({
    propertyId: 'villa_001',
    status: { $in: ['confirmed', 'pending'] },
    startDate: { $lt: monthEnd },
    endDate:   { $gt: monthStart },
  }).sort({ startDate: 1 }).toArray()
  ```
  Aprovecha el índice `{propertyId:1, status:1, startDate:1, endDate:1}` ya creado por el seed.
- **Cálculo de `monthStart` / `monthEnd`**: en UTC, igual que hace el seed (`Date.UTC(year, month-1, 1)` y `Date.UTC(year, month, 1)`). Coherencia con cómo se almacenan las fechas en BD.
- **Loader de la home**: `Promise.all([getHomePageContent(), getAvailabilityByMonth({ month, year })])` para que la carga de Content Island y Mongo vayan en paralelo. `console.log` del resultado dentro del loader. El componente no recibe (todavía) la disponibilidad.

## Testing Decisions

- **Por ahora, sin tests automatizados**. Es un tracer bullet manual: arrancar `pnpm db:up`, `pnpm db:seed`, `pnpm dev`, abrir la home y verificar en la terminal del server el array logueado.
- **Cuándo añadir tests** (futuro, fuera de scope de esta fase):
  - **Server fn**: integration test que arranca Mongo en testcontainers o usa la misma DB de dev con datos del seed, llama a `getAvailabilityByMonth` y verifica que devuelve los bloques esperados — incluyendo casos de solape en frontera de mes (28-feb→5-mar debe salir en `month=2` y en `month=3`).
  - **Validator**: unit test del schema Zod (`month=0`, `month=13`, `year=1900` → falla).
  - **Mapper**: unit test puro con un documento de fixture (`_id` ObjectId → string, no se filtran campos sensibles).

## Out of Scope

- UI de calendario / visualización de los bloques. Solo `console.log` en esta fase.
- Search params en la URL para mes/año.
- Soporte multi-propiedad (`propertyId` parametrizable).
- Incluir `cancelled` en el resultado.
- Devolver `guest`, `price`, `payment`, `occupancy`, `notes` u otros campos sensibles.
- Tests automatizados (ver "Testing Decisions").
- Manejo de errores con UI de fallback (si Mongo está caído, el loader falla y la página rompe; es aceptable en dev para esta fase).
- Reconexión automática / health check.
- Paginación / cursor (un mes son decenas de documentos como mucho).

## Discarded Alternatives

- **Asumir año actual**: descartado porque produce comportamiento confuso en frontera de año.
- **Filtrar por `startDate` dentro del mes**: descartado porque rompe el calendario en bloques que cruzan frontera de mes.
- **Devolver todos los status y filtrar en cliente**: descartado por traer basura al loader sin valor inmediato.
- **Devolver `{ confirmed, pending, cancelled }` agrupado**: descartado por complejidad innecesaria.
- **`propertyId` parametrizado desde el inicio**: descartado por YAGNI; solo hay una villa.
- **Conectar y cerrar en cada llamada**: descartado por coste de handshake (~50-150ms) en cada render.
- **Validación manual con `throw`**: descartado en favor de Zod por idiomatismo en TanStack Start y mensajes de error mejores.
- **Solo tipado TS sin runtime check**: descartado por seguridad — el cliente puede mandar cualquier cosa.
- **Documentos crudos de Mongo con `ObjectId`**: descartado porque `ObjectId` serializa feo en JSON y se filtran campos no necesarios.
- **VM "completo" con `guest`, `price`, etc.**: descartado por YAGNI y por no exponer info sensible al cliente innecesariamente.
- **Crear un pod `availability` separado**: descartado por ahora; el único consumidor es la home.
- **`console.log` en server fn / componente cliente**: descartado en favor de loguear en el loader (ve lo que recibe el consumidor real).

## Assumptions

- El proyecto seguirá usando TanStack Start con Vite y Nitro, y el servidor es de larga duración (justifica el singleton de `MongoClient`).
- `MONGO_URI` siempre apunta a una base con el schema del seed (`calendarBlocks` collection con `propertyId`, `status`, `startDate`, `endDate`).
- Las fechas en Mongo están en UTC, al medianoche (`startOfDay` UTC), como las inserta el seed.
- Solo existe `propertyId = "villa_001"` mientras dure esta fase.
- Añadir `zod` como dependencia es aceptable (no se mencionó restricción).
- El loader de la home se ejecuta principalmente en SSR (primer render) y eventualmente en cliente al navegar; el `console.log` saldrá en la terminal del server la mayoría del tiempo, que es lo que se quiere ver ahora.

## Risks

- **HMR de Vite + singleton de `MongoClient`**: cada hot reload puede crear un `MongoClient` nuevo en dev, dejando conexiones zombies hasta que Mongo las expire. Mitigación: cachear el cliente en `globalThis` con un símbolo (patrón típico Next/Nitro). Si no se hace, en dev no es bloqueante pero a la larga puede saturar.
- **`ObjectId` en el `id`**: si se nos olvida `.toString()` en el mapper, el `id` viaja como objeto serializado raro. Bug silencioso fácil de cometer.
- **Validación de `year`**: el rango `2020..2100` es arbitrario; si alguien pone una restricción más estricta de negocio (ej. "no aceptar reservas a más de 2 años vista") habría que revisarlo.
- **Errores de conexión**: si Mongo no está arriba, el loader lanza y la home se rompe. Aceptado en dev; en prod habría que envolver con fallback.
- **Zona horaria**: la app asume UTC consistente entre seed y query. Si en el futuro se cambia el seed a fechas locales, la query del mes deja de coincidir.
- **Coste del `Promise.all` en el loader**: si Content Island tarda mucho, la query a Mongo (que es local y rápida) se "desaprovecha" esperando. Aceptable; si se vuelve problema, separar en distintos loaders / suspense.

## Open Points

- [ ] Decidir qué hacer cuando Mongo está caído en producción (loader que devuelve `{ blocks: [] }` con warning, error boundary, etc.).
- [ ] Cómo se reconcilia esta API cuando aparezca multi-propiedad.
- [ ] Si la UI futura necesita `guest.name` para tooltip, ampliar el VM en su momento (decidido como opción en el grill, no se incluye ahora).
- [ ] Plantear si conviene exponer también un `getAvailabilityRange({ from, to })` más genérico, o mantener la API atada al mes.

## Next Steps

- [ ] Implementar la server function siguiendo este PRD (no requiere `prd-to-plan`: es un slice pequeño y vertical).
- [ ] Verificar manualmente que el `console.log` muestra los bloques esperados del mes actual.
- [ ] Cuando se aborde la UI del calendario, ejecutar `prd-to-plan` o `grill-me` sobre esa parte.

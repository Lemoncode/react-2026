# PRD — Setup Mongo dockerizado para Calendario de Disponibilidad

- **Fecha:** 2026-05-28
- **Estado:** Definido, listo para implementar
- **Alcance:** Levantar una instancia MongoDB local mediante Docker, con persistencia en disco y scripts npm para el ciclo de vida (up/down/logs). Pensado para que cualquier desarrollador del equipo pueda trabajar sin instalar Mongo en su máquina.

---

## 1. Contexto

El proyecto (`04-calendario-diponibilidad`, TanStack Start + React + Vite) va a incorporar lógica de negocio con datos persistentes (modelo `BlockCalendar` ya diseñado en `model/mongodb-diagram.mml` — reservas con guest, occupancy, price, payment, check-in/out, etc.).

Antes de tocar código de aplicación necesitamos una base de datos local fácil de levantar, reproducible entre desarrolladores y con datos persistentes entre reinicios.

Este PRD cubre **solo** la infraestructura de Mongo. El console runner para crear la BBDD/colección y alimentar datos de prueba es el **siguiente paso** y queda fuera de este documento.

## 2. Objetivos

- Cualquier desarrollador puede levantar Mongo con un comando, sin instalar Mongo en local.
- Los datos persisten entre reinicios del contenedor.
- Los datos viven en una carpeta visible del repo (`./data/mongo`), fácil de inspeccionar o borrar.
- No interfiere con otras instancias de Mongo que el desarrollador pueda tener corriendo (puerto distinto al estándar).
- Versión fija para evitar sorpresas con releases mayores.

## 3. Decisiones tomadas

| Tema | Decisión | Notas |
|---|---|---|
| Infra | `docker-compose.yml` en la raíz del proyecto | No se usa Dockerfile propio: imagen oficial directa. |
| Imagen | `mongo:8` | Major fijo. Sube manualmente cuando toque. |
| Topología | Standalone (sin replica set) | No habrá transacciones multi-documento por ahora. Si en el futuro se necesitan (ej. reserva + pago atómico), se migra a replica set de 1 nodo. |
| Persistencia | Bind mount a `./data/mongo` | Carpeta visible en el repo, gitignored. |
| Auth | Sin autenticación | Solo para dev local. La connection string es limpia. |
| Puerto host | `27018` | Evita choque con instancias en 27017. Connection string: `mongodb://localhost:27018/calendar-availability`. |
| Puerto contenedor | `27017` (default Mongo) | Solo mapeo `27018:27017`. |
| `container_name` | `rental-mongo` | |
| Nombre BBDD | `calendar-availability` | |
| GUI | Ninguna (descartado Mongo Express) | Usar `mongosh` o MongoDB Compass desde el host si se necesita inspeccionar. |
| Healthcheck | No | Se añadirá cuando el console runner se integre en compose y necesite esperar. |
| Package manager | pnpm | Se borrará `package-lock.json` (el `pnpm-lock.yaml` es el oficial). |
| Scripts npm | Set mínimo: `db:up`, `db:down`, `db:logs` | Más scripts se añaden si surge la necesidad. |

## 4. Entregables

1. **`docker-compose.yml`** en la raíz del proyecto con un único servicio `mongo`:
   - `image: mongo:8`
   - `container_name: rental-mongo`
   - `ports: ["27018:27017"]`
   - `volumes: ["./data/mongo:/data/db"]`
   - `restart: unless-stopped`

2. **`./data/`** añadido al `.gitignore`.

3. **`.env`** (ya existente): añadir
   ```
   MONGO_URI=mongodb://localhost:27018/calendar-availability
   ```
   sin tocar las variables ya presentes (`CONTENT_ISLAND_ACCESS_TOKEN`).

4. **`.env.example`** nuevo en la raíz, con la misma key sin valor sensible:
   ```
   CONTENT_ISLAND_ACCESS_TOKEN=
   MONGO_URI=mongodb://localhost:27018/calendar-availability
   ```

5. **`package.json`** — añadir scripts:
   ```json
   "db:up":   "docker compose up -d mongo",
   "db:down": "docker compose down",
   "db:logs": "docker compose logs -f mongo"
   ```

6. **Limpieza:** borrar `package-lock.json` (el lockfile oficial es `pnpm-lock.yaml`).

7. **README:** mini-sección "Base de datos local" con:
   - Requisito: Docker Desktop instalado.
   - Comandos `pnpm db:up` / `db:down` / `db:logs`.
   - Connection string esperada.
   - Cómo borrar los datos (`pnpm db:down && rm -rf ./data/mongo`).

## 5. Fuera de alcance (próximos pasos)

- **Console runner** para crear la BBDD/colección `BlockCalendar` y alimentar datos de prueba. Se hará en una iteración separada.
- **Índices** sobre `BlockCalendar` (ej. `propertyId`, `startDate`, `status`). Se definirán cuando el console runner exista, ya que es buen sitio para idempotentemente crearlos.
- **Replica set / transacciones.** Solo si la lógica de reservas lo requiere.
- **Auth con usuario/contraseña.** Solo si en algún momento la BBDD se expone fuera de localhost.
- **Mongo Express u otra GUI dockerizada.** Por ahora, fuera.
- **Healthcheck en el servicio Mongo.** Se añadirá junto con el runner cuando declare `depends_on: condition: service_healthy`.

## 6. Criterios de aceptación

- [ ] `pnpm db:up` arranca Mongo, expuesto en `localhost:27018`, sin errores.
- [ ] Conectarse con `mongosh "mongodb://localhost:27018"` desde el host funciona.
- [ ] Insertar un documento de prueba, parar el contenedor con `pnpm db:down`, volver a levantarlo, y el documento sigue ahí.
- [ ] La carpeta `./data/mongo` existe tras el primer arranque y contiene archivos de Mongo, pero **no** está trackeada por git (`git status` la ignora).
- [ ] `pnpm db:logs` muestra logs en tiempo real.
- [ ] `package-lock.json` ya no existe; `pnpm-lock.yaml` es el único lockfile.
- [ ] Otro desarrollador puede clonar el repo, ejecutar `pnpm install && pnpm db:up`, y tener Mongo corriendo sin pasos manuales adicionales (más allá de tener Docker Desktop).

## 7. Riesgos y notas

- **Conflicto de puerto.** Si alguien tiene ya un Mongo en `27018`, hay que ajustar. Por eso `MONGO_URI` está en `.env` (variable, no hardcoded).
- **Permisos del bind mount en macOS/Linux.** Mongo corre como uid 999 dentro del contenedor; el bind mount puede provocar warnings sobre ownership en la primera escritura, pero no impide el funcionamiento. Si surge, se documenta.
- **Borrar `./data/mongo` requiere `sudo` en algunos casos** porque los ficheros pertenecen al uid del contenedor. El README lo mencionará si aparece.
- **Mongo 8 standalone** no soporta transacciones multi-documento — decisión consciente. Migrar a replica set más adelante implica añadir `--replSet rs0` al command, un script `rs.initiate()` y cambiar la connection string a `?replicaSet=rs0&directConnection=true`.

# Calendario 

Vamos ahora a por el calendario de disponibilidad, aquí tenemos lógica de negocio y datos propios que guardar.

Desafíos:
  - Tenemos que modelar esto (no es Front End, pero nos toca como emprendedores que somos).
  - Tenemos que crear un entorno dockerizado para la BBDD y que sea fácil usarlo para todos.
  - Tenemos que crear un console runner para alimentar con los datos iniciales.

Empezamos por definir un mongoDB en un dockerfile para poder levantarlo y que cualquier desarrollador pueda trabajar con el sin tener que instalar mongo en su máquina local.

Vamos con un prompt en planning (Esto lo podría sacar también con chat GPT):

```
/grill-me Vamos por pasos, primero quiero tener un docker compose para levantar un mongodb que persista los datos en el disco duro local, y los comandos en el package.json para levantarlo etc, y más adelante (no en este paso) crearemos un console runner para crear BBDD y alimentar datos de prueba, pero de primeras el docker file
```

Ya tenemos el docker compose (ver apendice del readme para ver cómo levantarlo) y el package.json con los comandos para levantarlo, bajarlo y ver los logs.)

Ahora nos hacen falta datos, así que le voy a pedir a Claude que me genere un console runner para crear la base de datos y meter datos de prueba, para eso le doy el siguiente prompt:

```
/grill-me Ahora quiero un console runner para crear la base de datos y meter datos de prueba, el runner se llamará `seed.ts` y lo que hará es conectarse a la base de datos, crear una colección de `availabilities`, tomando como fecha el mes actual y rellenado aleatoriamente a 6 meses vista, y metiendo algunos documentos de ejemplo con el siguiente formato:

Te paso toda la info sobre este documento (coincide con el MML del proyecto):

# Diseño de base de datos MongoDB para gestión de reservas de una vivienda vacacional

## 1. Objetivo

La base de datos debe permitir gestionar la disponibilidad de una vivienda vacacional.

Los dos casos principales son:

1. Consultar si la vivienda está disponible entre dos fechas.
2. Crear una reserva para unas fechas concretas.

Además, debe permitir bloquear fechas en las que la vivienda no está disponible aunque no exista una reserva.

---

# 2. Idea principal del modelo

La decisión principal del diseño es usar una colección llamada:

```txt
calendarBlocks
```

Esta colección guarda cualquier periodo de tiempo en el que la vivienda está ocupada o no disponible.

---

# 3. Colecciones principales

## 3.1. properties

```json
{
  "_id": "villa_001",
  "name": "Villa Mediterránea",
  "address": {
    "country": "Spain",
    "city": "Málaga",
    "street": "Calle del Mar 10",
    "postalCode": "29001"
  }
}
```

---

## 3.2. calendarBlocks

```json
{
  "_id": "6655f2f2c1a7ab0012aa1001",
  "propertyId": "villa_001",
  "type": "booking",
  "status": "confirmed",
  "startDate": "2026-07-10T00:00:00.000Z",
  "endDate": "2026-07-15T00:00:00.000Z",
  "nights": 5,
  "guest": {
    "id": "guest_123",
    "name": "Ana Pérez",
    "email": "ana@email.com",
    "phone": "+34600111222"
  },
  "occupancy": {
    "adults": 2,
    "children": 1,
    "babies": 0,
    "pets": 1
  },
  "price": {
    "nightlyRate": 150,
    "cleaningFee": 40,
    "touristTax": 20,
    "discount": 30,
    "subtotal": 750,
    "total": 780,
    "currency": "EUR"
  },
  "payment": {
    "status": "paid",
    "method": "stripe",
    "transactionId": "txn_001",
    "paidAmount": 780,
    "paidAt": "2026-05-28T11:00:00.000Z"
  },
  "createdAt": "2026-05-28T10:30:00.000Z",
  "updatedAt": "2026-05-28T12:00:00.000Z"
}
```

---

# 4. Consulta de disponibilidad

```js
db.calendarBlocks.find({
  propertyId: "villa_001",
  status: { $in: ["pending", "confirmed"] },
  startDate: { $lt: new Date("2026-07-15T00:00:00.000Z") },
  endDate: { $gt: new Date("2026-07-10T00:00:00.000Z") }
})
```

Si devuelve documentos → no disponible.

Si no devuelve documentos → disponible.

---

# 5. Lógica de solape

La condición de solape es:

```txt
startDate < requestedEnd && endDate > requestedStart
```

Esto permite:

- Check-out y check-in el mismo día
- Consultas simples
- Un único modelo para reservas y bloqueos

---

# 6. Índices recomendados

```js
db.calendarBlocks.createIndex({
  propertyId: 1,
  status: 1,
  startDate: 1,
  endDate: 1
});
```

---

# 7. Recomendaciones

- Guardar fechas como tipo `Date`
- No borrar reservas canceladas
- Usar `pending` para pagos en proceso
- Mantener reservas y bloqueos en la misma colección

---

# 8. Resumen

La colección principal es:

```txt
calendarBlocks
```

Cada documento representa un rango de fechas que afecta a la disponibilidad.

Campos clave:

```txt
propertyId
type
status
startDate
endDate
```

Consulta principal:

```js
{
  propertyId: "villa_001",
  status: { $in: ["pending", "confirmed"] },
  startDate: { $lt: requestedEnd },
  endDate: { $gt: requestedStart }
}
```
```

---
## Apéndice: Base de datos local (MongoDB)

Requisitos: Docker Desktop instalado.

Comandos disponibles:

```bash
pnpm db:up     # Arranca Mongo en background (puerto 27018)
pnpm db:down   # Para el contenedor
pnpm db:logs   # Sigue los logs en tiempo real
pnpm db:seed   # Borra y repuebla properties + calendarBlocks con datos de prueba
```

> El seed (`scripts/seed.ts`) dropea las colecciones `properties` y `calendarBlocks` y las repuebla con 1 villa fija + ~30 reservas/bloqueos (4 escenarios deterministas + el resto aleatorio con Faker, sin solapes entre activos). No afecta a otras colecciones de la BBDD.

Connection string (ya cargada en `.env` como `MONGO_URI`):

```
mongodb://localhost:27018/calendar-availability
```

Los datos persisten en `./data/mongo` (carpeta gitignored). Para empezar desde cero:

```bash
pnpm db:down && rm -rf ./data/mongo
```

> Nota: si tienes otra instancia de Mongo en `27017`, este setup no choca porque usa `27018` en el host. Si necesitas borrar `./data/mongo` y te da problemas de permisos, ejecútalo con `sudo` (los ficheros pertenecen al uid del contenedor).

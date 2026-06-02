# PRD: Script para crear usuario de prueba (better-auth)

**Date**: 2026-06-02
**Mode**: validation
**Status**: completed

## Problem Statement

Hace falta una forma rápida y repetible de crear un **usuario administrador de prueba** en la
base de datos para poder probar el login (que se acaba de construir) contra better-auth, sin
tener que pasar por un formulario de registro en la UI (que de momento no existe).

Hallazgos de la exploración del codebase:

- **better-auth YA está montado**: `src/lib/auth.ts` exporta `auth = betterAuth({...})` con
  `mongodbAdapter(db)`, `emailAndPassword: { enabled: true }` y el plugin `tanstackStartCookies()`.
  Dependencias `better-auth@^1.6.13` y `@better-auth/mongo-adapter@^1.6.13` instaladas.
- `src/lib/auth.ts` hace un **top-level `await getDb()`** y lee `process.env.BETTER_AUTH_SECRET`,
  `BETTER_AUTH_URL`, `MONGO_URI` → el script DEBE cargar el `.env` raíz.
- `src/lib/mongodb.ts` cachea un `MongoClient` en `globalThis` y **nunca lo cierra** → un script
  que importe `auth` dejará el socket abierto y **no terminará** solo.
- **Patrón de scripts existente**: `scripts/seed.ts` + npm script
  `"db:seed": "node --env-file=.env --import tsx scripts/seed.ts"`. `seed.ts` cierra la conexión
  con `await client.close()` en `finally` y hace `process.exit(1)` en error.
- **Default de better-auth verificado en el fuente**:
  `minPasswordLength: options.emailAndPassword?.minPasswordLength || 8` → la contraseña mínima
  son **8 caracteres**; `src/lib/auth.ts` no lo cambia.
- `auth.api.signUpEmail` (el de la propuesta del usuario) es la API server-side correcta: crea
  `user` + `account` con la contraseña hasheada. Por defecto `autoSignIn` está activo → también
  crea un documento de `session` (inocuo para un usuario de prueba).

## User Stories

1. Como desarrollador, quiero ejecutar `npm run db:create-user`, para crear un admin de prueba
   en Mongo y poder probar el login sin UI de registro.
2. Como desarrollador, quiero poder re-ejecutar el script sin que reviente si el usuario ya
   existe, para no tener que limpiar la BD entre intentos.
3. Como desarrollador, quiero que el script termine solo (no se quede colgado), para usarlo en
   flujos rápidos.
4. (Futuro) Como desarrollador, quiero poder pasar email/contraseña por argumentos o prompt,
   para crear usuarios distintos sin tocar el código.

## Product / UX Decisions

- **Credenciales del usuario de prueba** (hardcodeadas en esta fase):
  - email: **`admin@email.com`**
  - password: **`test1234`** (8 chars → cumple el `minPasswordLength: 8` por defecto)
  - name: **`Admin`**
- **Idempotencia (opción A)**: si el usuario ya existe, **no es un fallo** → mensaje informativo
  y salida con código 0. No se borra ni se recrea.
- **Salida (CLI feedback)**:
  - Éxito: `✅ Usuario creado: admin@email.com`
  - Ya existía: `ℹ️ El usuario admin@email.com ya existía, nada que hacer`
  - Otro error: log del error + salida con código 1.

## Technical Decisions

- **Fichero**: `scripts/create-user.ts`.
- **npm script**: `"db:create-user": "node --env-file=.env --import tsx scripts/create-user.ts"`
  (mismo runner que `db:seed`; namespace `db:` porque el usuario acaba en Mongo).
- **Import**: `import { auth } from "../src/lib/auth"` (ruta relativa; `auth.ts` no usa el alias
  `@/`, así que tsx la resuelve sin configurar paths).
- **Carga de entorno**: vía `--env-file=.env` del comando (no `dotenv`), igual que el resto.
- **Creación**: `await auth.api.signUpEmail({ body: { name: NAME, email: EMAIL, password: PASSWORD } })`.
- **Contraseña**: se usa `test1234` (≥8). **No se toca** `minPasswordLength` en `src/lib/auth.ts`
  para no debilitar la política del login real de la app.
- **Idempotencia**: `try/catch` alrededor del `signUpEmail`; detectar el caso "usuario ya existe"
  inspeccionando el error de better-auth (APIError con código/status tipo `USER_ALREADY_EXISTS`
  / mensaje equivalente). Si coincide → mensaje + `exit(0)`; cualquier otro error → `exit(1)`.
- **Terminación**: `process.exit(0)` explícito al acabar con éxito (imprescindible, porque el
  `MongoClient` cacheado mantiene vivo el proceso). En error, `exit(1)`.
- **Constantes arriba del fichero** (`EMAIL`, `PASSWORD`, `NAME`) con
  `// TODO: leer de argv/prompt más adelante`.

## Testing Decisions

- **Verificación manual** (suficiente para un script de tooling):
  1. `npm run db:create-user` con Mongo arriba (`npm run db:up`) → ver `✅ Usuario creado`.
  2. Re-ejecutar → ver `ℹ️ ... ya existía` y exit 0 (no excepción).
  3. Comprobar en Mongo que existe el doc en la colección `user` (y `account`) de la BD
     `calendar-availability`.
  4. (Opcional) Probar el login en `/login` con `admin@email.com` / `test1234` una vez que el
     `onSubmit` esté cableado a better-auth.
- **NO** se añaden tests automatizados para este script.

## Out of Scope

- Pedir email/contraseña por argumentos o prompt interactivo (queda como TODO/fase futura).
- Cablear el `onSubmit` del `LoginForm` a `auth.api.signInEmail` (otro trabajo).
- Roles/permintos del usuario (admin plugin de better-auth), verificación de email, etc.
- Borrar/resetear usuarios (`auth:reset` u similar).

## Discarded Alternatives

- **Insertar el usuario a mano en Mongo**: descartado — habría que hashear la contraseña con el
  algoritmo de better-auth y replicar el esquema `user`/`account`. `signUpEmail` lo hace bien.
- **Contraseña `test` (4 chars)**: descartada — viola `minPasswordLength: 8`; `signUpEmail`
  lanzaría error. Se usa `test1234`.
- **Bajar `minPasswordLength` en `src/lib/auth.ts`**: descartado — debilitaría la política del
  login real de toda la app solo por comodidad del script.
- **No cerrar conexión / no hacer exit** (como el snippet original): descartado — el proceso se
  quedaría colgado por el `MongoClient` abierto.
- **Borrar-y-recrear en cada run (idempotencia B)**: descartado — más destructivo y complejo de
  lo necesario; basta con tratar "ya existe" como éxito.
- **Namespaces `auth:` / sin prefijo**: descartados a favor de `db:create-user`.

## Assumptions

- El `.env` raíz tiene `MONGO_URI`, `BETTER_AUTH_SECRET` y `BETTER_AUTH_URL` válidos y Mongo
  está accesible (`npm run db:up`).
- Importar `src/lib/auth.ts` desde un script Node (vía tsx) funciona pese a incluir el plugin
  `tanstackStartCookies` (no requiere contexto de request para `signUpEmail`).
- El top-level `await getDb()` de `auth.ts` se ejecuta al importar y conecta correctamente.
- El error de "usuario duplicado" de better-auth es identificable de forma estable por
  código/status/mensaje.

## Risks

- **Forma del error "ya existe"**: si el código/mensaje de better-auth no es el esperado, el
  `catch` podría no clasificarlo bien → habrá que ajustar la condición tras ver el error real en
  la primera re-ejecución.
- **`signUpEmail` con `autoSignIn`**: crea un doc de `session` huérfano en cada alta. Inocuo,
  pero ensucia ligeramente la colección `session`. Se puede desactivar con `autoSignIn:false` en
  la config si molesta (fuera de scope).
- **Top-level await en `auth.ts`**: si Mongo no está levantado, el import falla con un error de
  conexión poco descriptivo antes de llegar al `try/catch` del `main`.

## Open Points

- [ ] Versión con argumentos/prompt (`--email`, `--password`) para crear usuarios arbitrarios.
- [ ] ¿Marcar el email como verificado al crear el usuario de prueba, si la app pasa a requerir
      verificación de email?
- [ ] Cablear el login (`signInEmail`) para cerrar el círculo y validar end-to-end.

## Next Steps

- [ ] Implementar `scripts/create-user.ts` + entrada `db:create-user` en `package.json`.
- [ ] Verificación manual (crear / re-ejecutar / comprobar en Mongo).
- [ ] (Opcional) `prd-to-plan` / `prd-to-issues` si se quiere formalizar; para un script de
      tooling probablemente baste con implementarlo directamente.

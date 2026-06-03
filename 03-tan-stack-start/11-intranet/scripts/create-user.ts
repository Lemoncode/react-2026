// scripts/create-user.ts
//
// Crea un usuario administrador de prueba en la base de datos usando better-auth.
// Reutiliza la instancia `auth` de la app (src/lib/auth.ts), que ya tiene
// configurado el adaptador de Mongo y email+password, así que la contraseña se
// hashea con el mismo algoritmo que el login real.
//
// Ejecuta:  npm run db:create-user
// (carga el .env raíz con --env-file y ejecuta con tsx; requiere Mongo arriba:
//  npm run db:up)
//
// Las credenciales están hardcodeadas de momento.
// TODO: más adelante leer email/contraseña de argv o de un prompt.

import { auth } from "../src/lib/auth";

const EMAIL = "admin@email.com";
// >= 8 caracteres: cumple el minPasswordLength por defecto de better-auth (8).
const PASSWORD = "test1234";
const NAME = "Admin";

/** ¿El error de better-auth indica que el usuario ya existía? */
const isAlreadyExistsError = (error: unknown): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = error as any;
  const haystack = [e?.body?.message, e?.body?.code, e?.message]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes("already exists") || haystack.includes("already_exists");
};

const main = async () => {
  try {
    await auth.api.signUpEmail({
      body: { name: NAME, email: EMAIL, password: PASSWORD },
    });
    console.log(`✅ Usuario creado: ${EMAIL}`);
    // El MongoClient queda cacheado y abierto, así que salimos a mano para que
    // el proceso no se quede colgado.
    process.exit(0);
  } catch (error) {
    if (isAlreadyExistsError(error)) {
      console.log(`ℹ️  El usuario ${EMAIL} ya existía, nada que hacer`);
      process.exit(0);
    }
    console.error("❌ No se pudo crear el usuario:");
    console.error(error);
    process.exit(1);
  }
};

main();

# Area privada

Vamos a crear un area privada para permitir al dueño de la propiedad poder ver el calendario de reservas así como modificar entradas, o cancelarlas.

## Pasos

Para ellos necesitamos

- Tener un area en la que sea necesario que el usuario se loguee para acceder a ella.
- Tener un dialogo de login.
- Tener un area de calendario para mostrar las reservas.
- Tener un area de formulario para modificar o cancelar reservas.

## Area privada

Empezamos por crear un archivo `login.tsx` en el raiz de las rutas.

_src/routes/login.tsx_

Si tenemos el servidor de dev funcionando, automáticamente se recargará y podremos ver la página vacía de login en la ruta `/login.tsx`.

Ahora quiero crear un componente de login, para ello crearemos un pod, y añadiremos ese formulario, vamos a pedirselo a Claude

```md
/grill-me En la ruta login.tsx quiero usar un pod que llamare login y que se encargue de mostrar un formulario de login con los siguientes campos: email y contraseña, y un botón de submit. El formulario no tiene que hacer nada por ahora, solo mostrar los campos y el botón, sigue el estilado del proyecto y acuerdate de usar tailwind, shadcn y que sea responsivo.
```

Ya tenemos el formulario vamos ahora a usar una librería de autenticación, para ello vamos a usar `better-auth`, así nos ahorramos reinventar la rueda.

Vamos a instalar la librería:

```bash
pnpm add better-auth
```

Vamos ahora a definir variables para poner el secreto que servira como semilla para generar los tokens, y el tiempo de expiración de los mismos.

```bash
# Al menos 32 caracteres de longitud, la web de better auth
# https://better-auth.com/docs/installation
BETTER_AUTH_SECRET=OgyUtvUkBr9XINohCcdxTb20anyhCMgB
BETTER_AUTH_URL=http://localhost:3000 # URL Base de tu aplicación
```

Vamos ahora a crear el punto de entrada de la librería en nuestra aplicación, tiene que estar o bien en el raíz del proyecto, o bien en la carpeta `lib` o `utils`.

./src/lib/auth.ts

```ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  url: process.env.BETTER_AUTH_URL,
});
```

Vamos ahora a por la base de datos, en nuestro caso queremos usar MongoDB

Para ello instalamos el adaptador de MongoDB

https://better-auth.com/docs/adapters/mongo

```bash
pnpm add @better-auth/mongo-adapter
```

_./src/lib/auth.ts_

```diff
import { betterAuth } from "better-auth";
+ import {getDb} from './mongodb';
+ import { mongodbAdapter } from "better-auth/adapters/mongodb";
+ import { tanstackStartCookies } from "better-auth/tanstack-start";

+ const db = await getDb();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  url: process.env.BETTER_AUTH_URL,
+  database: mongodbAdapter(db),
+  emailAndPassword: {
+    enabled: true,
+  },
+  plugins: [
+    tanstackStartCookies(), 
+  ],
});
```

Vamos ahora a generar unos endpoint debajo de API/Auth para que better auth tenga un punto de entrada como endpoint

_./src/routes/api/auth.ts_

```ts
// src/routes/api/auth/$.ts
import { auth } from "@/lib/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }) => auth.handler(request),
      POST: async ({ request }) => auth.handler(request),
    },
  },
});
```

Antes de seguir y conectar el formulario de login con better auth, vamos a crear un usuario en la base de datos para poder logarnos, para ello vamos a crear un script que se conecte a la base de datos y cree un usuario usando el adaptador de MongoDB de better auth, si te acuerdas debajo de la carpeta script ya teníamos un script para crear datos de prueba, vamos a crear otro para crear un usuario, esto se lo vamos a pedir a Claude

```
```
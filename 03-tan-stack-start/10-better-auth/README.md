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

```md
/grill-me Quiero crear un script (debajo de carpeta scripts), un script nuevo para crear un usuario de prueba, de momento va a ser harcodeado (ojo las .env tienen las conexiones, secreto etc del raiz, y además en el proyecto web tenemos las librerías instaladas, mira para el script que haría falta hacer), más adelante podríamos preguntar usuario y clave, el usuario va a ser "admin@email.com" y la clave "test1234",crea la entrada en package.json para poder crearlo, tengo un ejemplo de código que creo podría valer: // scripts/create-user.ts
import { auth } from "../src/lib/auth";

async function main() {
const result = await auth.api.signUpEmail({
body: {
name: "Admin",
email: "admin@example.com",
password: "SuperPassword123!",
},
});

console.log(result);
}

main().catch(console.error);
```

Ahora toca conectar el back que hemos creado con el formulario que hemos creado, vamos a por otro grill-me

Para gestionar la seguridad en cliente, nos creamos debajo de lib, un fichero que llamaremos `auth-client.ts`

_./src/lib/auth-client.ts_

```ts
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  // Esto tendría que ir a una variable de entorno de cliente
  // y igual la podemos quitar porque tenemos auth y front en mismo server
  baseURL: "http://localhost:3000",
});
```

Vamonos al pod de login y validar lo que ha introducido el usuario y llamar al método de login de better auth.

_src/pods/login/login.pod.tsx_

```diff
import { LoginForm } from "./components/login-form.component";
import type { LoginFormValues } from "./login-form.schema";
+ import { authClient } from "@/lib/auth-client";

export const Login = () => {
  const handleSubmit = async (_values: LoginFormValues) => {
-    // TODO(better-auth): conectar aquí el signIn con email/contraseña.
-    // De momento no hace nada: solo mostramos el formulario.
-    console.log("[login] submit placeholder — pendiente de cablear better-auth");
+    try {
+      const result = await authClient.signIn.email({
+          email: _values.email,
+          password: _values.password,
+      });
+      if(result.error) {
+        console.error("Login error:", result.error);
+      } else {
+        console.log("Login successful:", result);
+      }
+    } catch (error) {
+      console.error("Login failed:", error);
+    }
  };
```

Vamos a probarlo

```bash
pnpm run dev
```

Tirando de consola parece que funciona, así que vamos a crear una páigna home de la intranet para que navegue a ella.

_./src/routes/(auth)/intranet/index.tsx_

Al crear el fichero si tenemos arracnado el run dev se creará automáticamente el código para la ruta.

Ahora volvemos al login, y si el login es correcto, navegamos a la intranet, vamos navegar por código para ello usaremos el hook _useNavigate_ de tan stack router.

_src/pods/login/login.pod.tsx_

```diff
import { LoginForm } from "./components/login-form.component";
import type { LoginFormValues } from "./login-form.schema";
import { authClient } from "@/lib/auth-client";
+ import { useNavigate } from "@tanstack/react-router";

export const Login = () => {
+  const navigate = useNavigate();
  const handleSubmit = async (_values: LoginFormValues) => {
    try {
      const result = await authClient.signIn.email({
        email: _values.email,
        password: _values.password,
      });

      if(result.error) {
        console.error("Login error:", result.error);
      } else {
        console.log("Login successful:", result);
+        navigate({ to: "/intranet" });
      }
```

Antes de seguir vamos a mostrar una tostada de éxito o error para el login, vamos a decirle a claude que lo haga por nosotros.

```
Ahora quiero mostrar una tostada de exito o error cuando se ha hecho el login en src/pods/login/login.pod.tsx sigue la misma aproximación que con otras tostadas de la aplicación
```

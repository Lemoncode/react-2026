# Estado en React

En React los componentes son funciones, y esto afecta mucho a como trabajamos.

Vamos a crear nuestro primer componente:

```tsx
import React from "react";

export const MiComponente = () => {
  return <h1>Hola mundo</h1>;
};
```

Vamos a ahora a utilizar este componente en nuestra aplicación:

```diff
import React from "react";
import { MiComponente } from "./MiComponente";

export const App = () => {
  return (
    <div>
+      <MiComponente />
    </div>
  );
};
```

Ejecutamos y bueno ahí lo tenemos.

Ahora vamos a ver binding, añadimos una variable nombre:

```diff
import React from "react";

export const MiComponente = () => {
+ const nombre = "Pepe";

-  return <h1>Hola mundo</h1>;
+  return <h1>Hola {nombre}</h1>;
};
```

Con esto se enlaza.

El siguiente paso sería añadir un input para cambiar el nombre, veamos que pasa si aplicamos mentalidad de JavaScript puro:

```diff
import React from "react";

export const MiComponente = () => {
+ const nombre = "Pepe";

-  return <h1>Hola {nombre}</h1>;
+ return (
+    <div>
+      <h1>Hola {nombre}</h1>
+      <input type="text" value={nombre} onChange={(e) => nombre = e.target.value} />
+    </div>
+  );
};
```

Si te fijas si intentamos ejecutra esto, al teclear no pasa nada, el valor del input no cambia, y el nombre tampoco.

Esto es normal, a fin de cuentas tenemos una función, que al volver a renderizarse el componente se vuelve a ejecutar, y el valor de nombre se vuelve a establecer a "Pepe", por lo que no cambia.

Y para esto React tiene los hooks, que son funciones especiales que nos permiten tener estado y otras funcionalidades en nuestros componentes funcionales.

Vamos a usar el hook useState para tener estado en nuestro componente:

```diff
- import React from "react";
+ import React, { useState } from "react";

export const MiComponente = () => {
- const nombre = "Pepe";
+ const [nombre, setNombre] = useState("Pepe");

 return (
    <div>
      <h1>Hola {nombre}</h1>
-      <input type="text" value={nombre} onChange={(e) => nombre = e.target.value} />
+      <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
    </div>
  );
};
```

Y para actualizar objetos, usaremos el spread operator para crear un nuevo objeto a partir del estado anterior, y así mantener la inmutabilidad, o immer.

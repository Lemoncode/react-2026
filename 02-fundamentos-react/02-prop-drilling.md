# Prop drilling en React

Y ahora vamos a separar responsabilidades.

Tenemos una parte que muestra el nombre y otra parte que permite editarlo.

Vamos a crear un componente `MostrarNombre`:

```tsx
import React from "react";

interface Props {
  nombre: string;
}

export const MostrarNombre = ({ nombre }: Props) => {
  return <h1>Hola {nombre}</h1>;
};
```

Y otro componente `EditarNombre`:

```tsx
import React from "react";

interface Props {
  nombre: string;
  onNombreChange: (nuevoNombre: string) => void;
}

export const EditarNombre = ({
  nombre,
  onNombreChange,
}: Props) => {
  return (
    <input
      type="text"
      value={nombre}
      onChange={(e) => onNombreChange(e.target.value)}
    />
  );
};
```

Ahora los usamos desde nuestro componente raíz:

```tsx
import React, { useState } from "react";
import { MostrarNombre } from "./MostrarNombre";
import { EditarNombre } from "./EditarNombre";

export const MiComponente = () => {
  const [nombre, setNombre] = useState("Pepe");

  return (
    <div>
      <MostrarNombre nombre={nombre} />
      <EditarNombre
        nombre={nombre}
        onNombreChange={setNombre}
      />
    </div>
  );
};
```

Vale, esto funciona, pero vamos a entender bien qué está pasando.

El estado vive en el componente padre:

```tsx
const [nombre, setNombre] = useState("Pepe");
```

Y el padre comparte ese estado con los hijos usando props.

`MostrarNombre` solamente recibe el dato y lo pinta:

```tsx
interface Props {
  nombre: string;
}

export const MostrarNombre = ({ nombre }: Props) => {
  return <h1>Hola {nombre}</h1>;
};
```

Mientras que `EditarNombre` recibe dos cosas:

- El valor actual.
- Un callback para notificar cambios.

```tsx
interface Props {
  nombre: string;
  onNombreChange: (nuevoNombre: string) => void;
}
```

Y cuando cambia el input:

```tsx
onChange={(e) => onNombreChange(e.target.value)}
```

El componente hijo no modifica el estado directamente.

Lo que hace es avisar al padre:

> "Oye, el nombre debería cambiar."

Y el padre, que es quien tiene el estado, decide actualizarlo mediante `setNombre`.

Por eso decimos que:

- Los datos bajan.
- Los eventos suben.

El valor baja desde el padre hacia los hijos mediante props.

Y el cambio sube mediante callbacks.

A esto normalmente se le llama **prop drilling** cuando vamos pasando datos y callbacks por varios niveles de componentes.

En este ejemplo solo tenemos un nivel:

```tsx
export const MiComponente = () => {
  const [nombre, setNombre] = useState("Pepe");

  return (
    <div>
      <MostrarNombre nombre={nombre} />

      <EditarNombre
        nombre={nombre}
        onNombreChange={setNombre}
      />
    </div>
  );
};
```

Pero si tuviéramos muchos componentes intermedios, tendríamos que seguir pasando esas props aunque algunos componentes no las usen directamente.

Y ahí es donde normalmente empezamos a buscar alternativas como Context o librerías de manejo de estado.

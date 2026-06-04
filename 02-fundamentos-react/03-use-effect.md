# useEffect en React

Ahora vamos a ver cómo cargar datos desde una API.

Vamos a usar la API de Rick & Morty.

El endpoint de personajes es:

```tsx
https://rickandmortyapi.com/api/character
```

Esta API devuelve los personajes dentro de una propiedad `results`, y también permite filtrar por nombre usando el query param `name`.

Vamos a empezar creando un componente:

```tsx
import React from "react";

export const MiComponente = () => {
  return <h1>Personajes</h1>;
};
```

Ahora podríamos pensar:

```tsx
import React, { useState } from "react";

interface Character {
  id: number;
  name: string;
  image: string;
}

export const MiComponente = () => {
  const [characters, setCharacters] = useState<Character[]>([]);

  fetch("https://rickandmortyapi.com/api/character")
    .then((response) => response.json())
    .then((data) => setCharacters(data.results));

  return (
    <div>
      <h1>Personajes</h1>
    </div>
  );
};
```

Pero esto no lo podemos hacer así.

¿Por qué?

Porque el componente es una función.

Y cada vez que cambia el estado, React vuelve a ejecutar la función.

Entonces pasa esto:

1. Se renderiza el componente.
2. Se ejecuta el `fetch`.
3. Llega la respuesta.
4. Hacemos `setCharacters`.
5. Al cambiar el estado, React vuelve a renderizar.
6. Se vuelve a ejecutar el `fetch`.
7. Y entramos en un bucle.

Para este tipo de operaciones usamos `useEffect`.

```tsx
import React, { useEffect, useState } from "react";

interface Character {
  id: number;
  name: string;
  image: string;
}

interface ApiResponse {
    results: Character[];
}

export const MiComponente = () => {
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    fetch("https://rickandmortyapi.com/api/character")
      .then((response) => response.json() as Promise<ApiResponse>)
      .then((data) => setCharacters(data.results));
  }, []);

  return (
    <div>
      <h1>Personajes</h1>

      {characters.map((character) => (
        <div key={character.id}>
          <img src={character.image} alt={character.name} />
          <p>{character.name}</p>
        </div>
      ))}
    </div>
  );
};
```

La parte importante es esta:

```tsx
useEffect(() => {
  fetch("https://rickandmortyapi.com/api/character")
    .then((response) => response.json() as Promise<ApiResponse>)
    .then((data) => setCharacters(data.results));
}, []);
```

`useEffect` nos permite ejecutar código después de que el componente se haya renderizado.

Y el array vacío:

```tsx
[];
```

significa:

> Ejecuta este efecto solamente al montar el componente.

Es decir, cuando el componente aparece por primera vez.

Esto nos sirve para explicar el concepto.

Aunque ojo, esto no significa que `useEffect` sea siempre la mejor forma de cargar datos.

Para una demo está bien.

Pero más adelante veremos otras opciones mejores para data fetching, cache, estados de carga, errores, reintentos, etc.

Ahora vamos a añadir un estado para filtrar por nombre.

```diff
export const MiComponente = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
+ const [filtro, setFiltro] = useState("");

  useEffect(() => {
    fetch("https://rickandmortyapi.com/api/character")
      .then((response) => response.json() as Promise<ApiResponse>)
      .then((data) => setCharacters(data.results));
  }, []);
```

Y añadimos un input:

```diff
return (
  <div>
    <h1>Personajes</h1>

+   <input
+     type="text"
+     value={filtro}
+     onChange={(e) => setFiltro(e.target.value)}
+     placeholder="Filtrar por nombre"
+   />

    {characters.map((character) => (
      <div key={character.id}>
        <img src={character.image} alt={character.name} />
        <p>{character.name}</p>
      </div>
    ))}
  </div>
);
```

Ahora queremos que cada vez que cambie el filtro, se vuelva a pedir la información a la API.

Para eso metemos `filtro` como dependencia del `useEffect`.

```diff
useEffect(() => {
- fetch("https://rickandmortyapi.com/api/character")
+ fetch(`https://rickandmortyapi.com/api/character?name=${filtro}`)
    .then((response) => response.json() as Promise<ApiResponse>)
-    .then((data) => setCharacters(data.results));
+    .then((data) => setCharacters(data.results ?? []));
-}, []);
+}, [filtro]);
```

Ahora el efecto depende de `filtro`.

Eso significa que React ejecutará este efecto:

- Al montar el componente.
- Cada vez que cambie `filtro`.

El código quedaría así:

```tsx
import React, { useEffect, useState } from "react";

interface Character {
  id: number;
  name: string;
  image: string;
}

interface ApiResponse {
    results: Character[];
}

export const MiComponente = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    fetch(`https://rickandmortyapi.com/api/character?name=${filtro}`)
      .then((response) => response.json() as Promise<ApiResponse>)
      .then((data) => setCharacters(data.results ?? []));
  }, [filtro]);

  return (
    <div>
      <h1>Personajes</h1>

      <input
        type="text"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        placeholder="Filtrar por nombre"
      />

      {characters.map((character) => (
        <div key={character.id}>
          <img src={character.image} alt={character.name} />
          <p>{character.name}</p>
        </div>
      ))}
    </div>
  );
};
```

Y con esto ya tenemos un ejemplo bastante claro.

El estado `filtro` controla el input.

El `useEffect` depende de `filtro`.

Cada vez que cambia el filtro, React vuelve a ejecutar el efecto.

Y el efecto hace una nueva petición a la API para traer personajes cuyo nombre coincida con ese filtro.

Más adelante mejoraremos esto, porque ahora mismo estamos haciendo una petición en cada tecla.

Pero para entender cómo funcionan las dependencias de `useEffect`, este ejemplo nos viene perfecto.

## Bonus: debounce con `setTimeout`

Ahora mismo tenemos un pequeño problema.

Cada vez que cambia el input:

```tsx
onChange={(e) => setFiltro(e.target.value)}
```

se vuelve a ejecutar el `useEffect`.

Y eso significa que hacemos una petición HTTP en cada tecla.

Si escribimos:

```txt
Rick
```

haremos:

- R
- Ri
- Ric
- Rick

Una forma muy sencilla de mejorar esto es hacer un debounce.

La idea es:

> Esperar un poco antes de lanzar la petición.

Y si el usuario sigue escribiendo, cancelar la anterior.

Podemos hacerlo usando `setTimeout`.

```diff
useEffect(() => {
- fetch(`https://rickandmortyapi.com/api/character?name=${filtro}`)
-   .then((response) => response.json() as Promise<ApiResponse>)
-   .then((data) => setCharacters(data.results ?? []));
+ const timeoutId = setTimeout(() => {
+   fetch(`https://rickandmortyapi.com/api/character?name=${filtro}`)
+     .then((response) => response.json() as Promise<ApiResponse>)
+     .then((data) => setCharacters(data.results ?? []));
+ }, 500);
+
+ return () => {
+   clearTimeout(timeoutId);
+ };
}, [filtro]);
```

La parte importante es esta:

```tsx
const timeoutId = setTimeout(() => {
  // petición
}, 500);
```

Le estamos diciendo:

> Espera 500ms antes de ejecutar la petición.

Y luego:

```tsx
return () => {
  clearTimeout(timeoutId);
};
```

Esto es el cleanup del `useEffect`.

React ejecuta esta función:

- Antes de volver a ejecutar el efecto.
- Cuando el componente se desmonta.

Así que si el usuario sigue escribiendo:

```txt
R
Ri
Ric
Rick
```

los timeouts anteriores se cancelan.

Y solamente se ejecuta la última petición cuando el usuario deja de escribir durante 500ms.

Esto reduce muchísimo el número de peticiones.

Y además nos sirve para entender algo muy importante de `useEffect`:

> Los efectos pueden tener cleanup.

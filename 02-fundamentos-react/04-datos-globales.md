# Estado global en React

Hasta ahora hemos visto que el estado puede vivir en un componente padre.

El padre tiene el estado y se lo pasa a los hijos mediante props.

Esto está bien para casos sencillos.

Pero empieza a ser incómodo cuando muchos componentes necesitan acceder al mismo dato.

Imagina esta estructura:

```tsx
<App />
  <Header />
  <Body />
  <Footer />
```

Queremos que el nombre se pueda editar en `Body`.

Pero también queremos mostrarlo en `Header` y en `Footer`.

Una primera opción sería tener el estado en `App` y pasarlo por props:

```tsx
<Header nombre={nombre} />
<Body nombre={nombre} onNombreChange={setNombre} />
<Footer nombre={nombre} />
```

Esto funciona.

Pero si la aplicación crece, empezamos a pasar props por muchos componentes.

A veces incluso por componentes que no usan esas props directamente.

Simplemente las reciben para pasárselas a otro hijo.

A esto lo llamamos **prop drilling**.

No es malo por sí mismo.

Pero cuando aparece mucho, suele ser una señal de que necesitamos otra forma de compartir estado.

Ahí entran los estados globales.

Vamos a crear un componente body que consuma editar nombre y mostrar nombre.

_./src/body.tsx_

```tsx
import React from "react";

export const Body = () => {
  const [nombre, setNombre] = React.useState("Pepe");

  return (
    <div>
      <h2>Body</h2>
      <p>Nombre: {nombre}</p>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
    </div>
  );
};
```

Y lo reemplazamos en App:

_./src/App.tsx_

```diff
import "./App.css";
- import { MiComponente } from "./micomponente";
+ import { Body } from "./body";

function App() {

  return (
    <>
+      <Body />
-      <MiComponente/>
    </>
  );
}

export default App;

```

Hasta aquí bien, vamos ahora a crear un componente header y un footer.

_./src/header.tsx_

```tsx
import React from "react";
export const Header = () => {
  return (
    <div>
      <h2>Header</h2>
      <p>Nombre: **Aquí iría el nombre**</p>
    </div>
  );
};
```

_./src/footer.tsx_

```tsx
import React from "react";

export const Footer = () => {
  return (
    <div>
      <h2>Footer</h2>
      <p>Nombre: **Aquí iría el nombre**</p>
    </div>
  );
};
```

Y vamos a añadirlo en App:

_./src/App.tsx_

```diff
import "./App.css";
import { Body } from "./body";
+ import { Header } from "./header";
+ import { Footer } from "./footer";

function App() {

  return (
    <>
+      <Header />
      <Body />
+      <Footer />
    </>
  );
}

export default App;
```

Ahora que pasa?

```bash
npm run dev
```

¿Cómo podemos compartir el estado del nombre entre Header, Body y Footer?

Una opción sería subir a _App_ el estado y pasarlo por props a los componentes hijos.

Pero eso es prop drilling, y en un proyecto grande puede ser un problema.

Vamos a probr otras opciones para compartir estado global.

# Opción 1: Context de React

_./src/nombre.context.tsx_

```tsx
import React, { createContext, useContext, useState } from "react";

interface NombreContextValue {
  nombre: string;
  setNombre: (nuevoNombre: string) => void;
}

const NombreContext = createContext<NombreContextValue | null>(null);

interface Props {
  children: React.ReactNode;
}

export const NombreProvider = ({ children }: Props) => {
  const [nombre, setNombre] = useState("Pepe");

  return (
    <NombreContext.Provider value={{ nombre, setNombre }}>
      {children}
    </NombreContext.Provider>
  );
};

export const useNombre = () => {
  const context = useContext(NombreContext);

  if (context === null) {
    throw new Error("useNombre debe usarse dentro de NombreProvider");
  }

  return context;
};
```

Y como usamos esto:

_./src/App.tsx_

```diff
import "./App.css";
import { MiComponente } from "./micomponente";
+ import { NombreProvider } from "./nombre.context";

function App() {

  return (
    <>
+      <NombreProvider>
        <Header/>
        <Body/>
        <Footer/>
+      </NombreProvider>
    </>
  );
}

export default App;
```

Y en cada componente:

_./src/body.tsx_

```diff
import React from "react";
+ import { useNombre } from "./nombre.context";

export const Body = () => {
-  const [nombre, setNombre] = React.useState("Pepe");
+  const { nombre, setNombre } = useNombre();

  return (
    <div>
      <h2>Body</h2>
      <p>Nombre: {nombre}</p>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
    </div>
  );
};
```

_./src/header.tsx_

```diff
import React from "react";
+ import { useNombre } from "./nombre.context";

export const Header = () => {
+ const { nombre } = useNombre();
  return (
    <div>
      <h2>Header</h2>
-      <p>Nombre: **Aquí iría el nombre**</p>
+      <p>Nombre: {nombre}</p>
    </div>
  );
};
```

Y en el footer igual:

```diff
import React from "react";
+ import { useNombre } from "./nombre.context";

export const Footer = () => {
+ const { nombre } = useNombre();
  return (
    <div>
      <h2>Footer</h2>
-      <p>Nombre: **Aquí iría el nombre**</p>
+      <p>Nombre: {nombre}</p>
    </div>
  );
};
```

---

# Opción 2: Zustand

```bash
pnpm install zustand
```

_./nombre.store.ts_

```tsx
import { create } from "zustand";

interface NombreStore {
  nombre: string;
  setNombre: (nuevoNombre: string) => void;
}

export const useNombreStore = create<NombreStore>()((set) => ({
  nombre: "Pepe",
  setNombre: (nuevoNombre) => set({ nombre: nuevoNombre }),
}));
```

Ahora en body:

_./src/body.tsx_

```diff
import { useNombre } from "./nombre.context";
+ import { useNombreStore } from "./nombre.store";
export const Body = () => {
-  const { nombre, setNombre } = useNombre();
+ const { nombre, setNombre } = useNombreStore();

  return (
    <div>
      <h2>Body</h2>
      <p>Nombre: {nombre}</p>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
    </div>
  );
};
```

En Header:

```diff
- import { useNombre } from "./nombre.context";
+ import { useNombreStore } from "./nombre.store";

export const Header = () => {
-  const { nombre } = useNombre();
+  const { nombre } = useNombreStore();

  return (
    <div>
      <h2>Header</h2>
      <p>Nombre: {nombre}</p>
    </div>
  );
};
```

En Footer

```diff
- import { useNombre } from "./nombre.context";
+ import { useNombreStore } from "./nombre.store";

export const Footer = () => {
-  const { nombre } = useNombre();
+ const { nombre } = useNombreStore();
  return (
    <div>
      <h2>Footer</h2>
      <p>Nombre: {nombre}</p>
    </div>
  );
};
```

---

# Opción 3: Nano Stores

```bash
pnpm install nanostores @nanostores/react
```

_nombre.nano.ts_

```tsx
import { atom } from "nanostores";

export const $nombre = atom("Pepe");
```

En Body

_./src/body.tsx_

```diff
- import { useNombreStore } from "./nombre.store";
+ import { $nombre } from "./nombre.nano";
+ import { useStore } from "@nanostores/react";

export const Body = () => {
-  const { nombre, setNombre } = useNombreStore();
+  const nombre = useStore($nombre);

  return (
    <div>
      <h2>Body</h2>
-      <p>Nombre: {nombre}</p>
+     <p>Nombre: {nombre}</p>
      <input
        type="text"
+        value={nombre}
+        onChange={(e) => $nombre.set(e.target.value)}
      />
    </div>
  );
};

```

En Header

```diff
- import { useNombreStore } from "./nombre.store";
+ import { $nombre } from "./nombre.nano";
+import { useStore } from "@nanostores/react";

export const Header = () => {
-  const { nombre } = useNombreStore();
+ const nombre = useStore($nombre);

  return (
    <div>
      <h2>Header</h2>
      <p>Nombre: {nombre}</p>
    </div>
  );
};

```

En Footer

```diff
- import { useNombreStore } from "./nombre.store";
+ import { $nombre } from "./nombre.nano";
+import { useStore } from "@nanostores/react";

export const Footer = () => {
-  const { nombre } = useNombreStore();
  return (
    <div>
      <h2>Footer</h2>
      <p>Nombre: {nombre}</p>
    </div>
  );
};
```

---

# Resumen

El prop drilling aparece cuando pasamos datos o callbacks por muchos componentes intermedios.

Para casos pequeños, no pasa nada.

Pero si muchos componentes necesitan acceder al mismo estado, podemos plantearnos usar estado global.

React Context es una solución integrada en React.

Zustand es una librería sencilla para crear stores globales.

Nano Stores es una alternativa muy ligera basada en stores pequeños y atómicos.

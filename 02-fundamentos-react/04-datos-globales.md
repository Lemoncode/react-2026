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

---

# Opción 1: Context de React

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

---

# Opción 2: Zustand

```bash
npm install zustand
```

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

---

# Opción 3: Nano Stores

```bash
npm install nanostores @nanostores/react
```

```tsx
import { atom } from "nanostores";

export const $nombre = atom("Pepe");

export const setNombre = (nuevoNombre: string) => {
  $nombre.set(nuevoNombre);
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

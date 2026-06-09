# Spread operator

Vamos a entender cómo funciona el spread operator de JS.

Con cliente plantilla:

```ts
const clientePlantilla: Cliente = {
  nombre: "",
  apellidos: "",
  descuento: 10,
};
```

¿Qué pasa si hago esto?

```ts
const nuevoCliente = {
  nombre: "Pepe",
  ...clientePlantilla,
};
```

Ahora vamos a meter una vuelta de tuerca más:

Si hago esto:

```ts
const nuevoCliente = {
  ...clientePlantilla,
};

nuevoCliente.descuento = 30;
```

¿Cambia el original?

Vamos a meter un poco más de complejidad, imagínate que descuento es un objeto:

```ts
interface Cliente {
  nombre: string;
  apellidos: string;
  descuento: {
    tipo: string;
    valor: number;
  };
}
```

Y tenemos nuestra plantilla:

```ts
const clientePlantilla: Cliente = {
  nombre: "",
  apellidos: "",
  descuento: {
    tipo: "fijo",
    valor: 10,
  },
};
```

Vamos a arreglar la función que crea el cliente VIP:

```ts
const creaClienteVIP = (nombre: string, apellidos: string): Cliente => {
  const nuevoCliente: Cliente = {
    ...clientePlantilla,
    nombre,
    apellidos,
  };

  nuevoCliente.descuento.valor = clientePlantilla.descuento.valor * 2;

  return nuevoCliente;
};
```

¿Qué pasa ahora si hago?

```ts
const cliente1 = creaClienteVIP("Pepe", "Perez");
console.log("Cliente 1:", cliente1);

const cliente2 = creaClienteVIP("Maria", "Gómez");
console.log("Cliente 2:", cliente2);

console.log("Cliente plantilla:", clientePlantilla);
```

¿Qué está pasando aquí? Que el spread operator hace una copia superficial, es decir sólo el primer nivel, si tenemos objetos anidados, el spread no hace una copia profunda, por lo que si modificamos un objeto anidado, estamos modificando el original. Esto es algo a tener en cuenta cuando trabajamos con objetos complejos.

¿Coomooo? Sí, y esto es bueno ya que a nivel de rendimiento va como una moto y también sirve para ver si tenemos que repintar un componente o no.

¿Cómo podríamos arreglarlo?

```diff
const creaClienteVIP = (nombre: string, apellidos: string): Cliente => {
  const nuevoCliente: Cliente = {
    ...clientePlantilla,
    nombre,
    apellidos,
+      descuento: {
+        ...clientePlantilla.descuento,
+      },
  };

  nuevoCliente.descuento.valor = clientePlantilla.descuento.valor * 2;

  return nuevoCliente;
};
```

Y si queremos ser más elegantes:

```diff
const creaClienteVIP = (nombre: string, apellidos: string): Cliente => {
  const nuevoCliente: Cliente = {
    ...clientePlantilla,
    nombre,
    apellidos,
      descuento: {
        ...clientePlantilla.descuento,
+      valor: clientePlantilla.descuento.valor * 2,
      },
  };

-  nuevoCliente.descuento.valor = clientePlantilla.descuento.valor * 2;

  return nuevoCliente;
};
```

Pero si tenemos objetos con varios niveles de anidación, esto se puede volver un poco engorroso, por lo que existen librerías como immer que nos hacen la vida más fácil.

Vamos a instalarla:

```bash
pnpm install immer
```

Y ahora podemos hacer esto:

```ts
import produce from "immer";
```

```diff
const creaClienteVIP = (nombre: string, apellidos: string): Cliente => {
-  const nuevoCliente: Cliente = {
-    ...clientePlantilla,
-     nombre,
-     apellidos,
-      descuento: {
-        ...clientePlantilla.descuento,
-        valor: clientePlantilla.descuento.valor * 2,
-      },
-  };

+  const nuevoCliente = produce(clientePlantilla, (draft) => {
+    draft.nombre = nombre;
+    draft.apellidos = apellidos;
+    draft.descuento.valor = clientePlantilla.descuento.valor * 2;
+  });

  return nuevoCliente;
};
```

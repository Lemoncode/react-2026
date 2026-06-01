# Inmutabilidad

## Crear proyecto

Vamos a ver porque es importante la inmutabilidad, así como conceptos clave.

```bash
pnpm create vite pruebas --template vanilla-ts
```

> Si no tienes pnpm, puedes instalarlo:npm install -g pnpm

Podemos arrancarlo

```bash
npm run dev
```

Y lo vemos funcionando en http://localhost:5173/

Nos cargamos lo que hay en main.ts

## Objetos y asignaciones

Vamos a empezar a jugar con objetos.

Imaginate que tengo esto:

_./main.ts_

```ts
interface Cliente {
  nombre: string;
  apellidos: string;
  descuento: number;
}

const clientePlantilla: Cliente = {
  nombre: "",
  apellidos: "",
  descuento: 10,
};
```

Vale, vamos ahora a crear un nuevo cliente.

```ts
const creaClienteVIP = (nombre: string, apellidos: string): Cliente => {
  const nuevoCliente: Cliente = clientePlantilla;
  nuevoCliente.nombre = nombre;
  nuevoCliente.apellidos = apellidos;
  nuevoCliente.descuento = clientePlantilla.descuento * 2;
  return nuevoCliente;
};
```

¿Que pasa si hacemos esto?

```ts
// Paso 1 ver por consola
const cliente1 = creaClienteVIP("Pepe", "Perez");
console.log("Cliente 1:", cliente1);

// Paso 2 ver por consola
const cliente2 = creaClienteVIP("Maria", "Gómez");
console.log("Cliente 2:", cliente2);

// Destapar tarro de las esencias
console.log("Cliente plantilla:", clientePlantilla);
```

¿Qué ha pasado aquí?

Pues que al modificar el nuevo cliente, también hemos modificado el cliente plantilla, porque ambos apuntan al mismo objeto en memoria.

Esto es un ejemplo de por qué la inmutabilidad es importante: si no queremos que los cambios en un objeto afecten a otros, debemos crear copias en lugar de modificar directamente los objetos existentes.

Varias temas a tener en cuenta de esta cagada:

- Siempre es mejor crear un nuevo objeto en lugar de modificar uno existente, nunca sabes quién más lo está usando (**efecto colateral**).

- Siempre que puedas intenta que una **función sea pura**, es decir, que no tenga efectos colaterales y que su salida dependa solo de sus entradas ¿Qué quiere decir esto? Que para mismos parametros de entrada siempre devuelva el mismo resultado, sin modificar nada fuera de la función.

- No suele ser buena idea modificar parametros de entrada, mejor crear un nuevo objeto a partir de ellos.

## Asignación inmutable

El tema aquí es que necesitamos crear un objeto nuevo a partir del cliente plantilla, en lugar de modificar el cliente plantilla directamente.

Vamos primero a hacerlo a lo burro:

```diff
const creaClienteVIP = (nombre: string, apellidos: string): Cliente => {
-  const nuevoCliente: Cliente = clientePlantilla;
+ const nuevoCliente: Cliente = {
+  nombre: nombre,
+  apellidos: apellidos,
+  descuento: clientePlantilla.descuento * 2,
+ };
-  nuevoCliente.nombre = nombre;
-  nuevoCliente.apellidos = apellidos;
-  nuevoCliente.descuento = clientePlantilla.descuento * 2;
  return nuevoCliente;
};
```

Si ahora probamos esto funciona ¿Pero le véis algún problema a esta aproximación?

Vamos a simplificar, para ello vamos a usar el _spread operator_ de JavaScript.

```diff
const creaClienteVIP = (nombre: string, apellidos: string): Cliente => {
-  const nuevoCliente: Cliente = {
-    nombre: nombre,
-    apellidos: apellidos,
-    descuento: clientePlantilla.descuento * 2,
-  };
+  const nuevoCliente: Cliente = {
+    ...clientePlantilla,
+    nombre: nombre,
+    apellidos: apellidos,
+    descuento: clientePlantilla.descuento * 2,
+  };
  return nuevoCliente;
};
```

¿Qué estamos haciendo aquí?

- Creamos un objeto con las llaves.
- Con los tres puntitos es como si abrieramos la lata de clientePlantilla y copiáramos todas sus propiedades dentro del nuevo objeto.
- Una vez copiada, sobreescribimos el campo descuento.

De hecho podríamos haber escrito esto de forma aún más corta:

```ts
const creaClienteVIP = (nombre: string, apellidos: string): Cliente => ({
    ...clientePlantilla,
    nombre,
    apellidos,
    descuento: clientePlantilla.descuento * 2,
});
```

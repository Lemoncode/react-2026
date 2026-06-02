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
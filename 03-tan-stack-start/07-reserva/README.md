# Página de reservas

Vamos a por la página de reservas vamos a dar un primer paso, armar la página con los parametros adecuados, y mostrar por consola la seleccion.

```md
/grill-me Ahora desde la página principal si selecciono las fechas y le doy a consultar disponibilidad, quiero que navegue a otro página con el mismo estilo y responsiva, que muestra la seleccion de fecha realizada (con opción de cambiarla), y pida los datos del huesped (nombre, apellido, email, teléfono, numero de huespedes, y un campo de text libre para comentarios adicionales) y un botón para enviar correo al dueño de la propiedad para confirmar la reserva.

De momento nos quedamos en lo que es la maquetación de la página y cuando se pinche en reservar se muestre por consola lo que se ha elegido

A tener en cuenta los datos de las fechas de reserva los podemos pasar por query string en la url
```

Empezamos con la validación del formulario:

```
/grill-me Como siguiente paso quiero validar el formulario, vamos a empezar facil, de primeras vamos a validar que el nombre este bien informado, vamos a usar TanStack Form y Zod para esto, y vamos a mostrar un mensaje de error debajo del campo de nombre si el nombre no es correcto, el mensaje de error debe desaparecer cuando el usuario corrija el error.

Tan Stack Form obliga a crear unos wrappers alrededor de los componentes, no quiero ir repetiendolos, para ello vamos a crear dentor de src/components una carpeta que llamaremos form donde vamos a poner los wrappers por ejemplo de el input del campo nombre
```

En el siguiente paso cubrimos todos los campos y se crean todos los wrappers

```
/grill-me Vamos a completar la validación para todos los campos del formulario, para ello vamos a crear los wrappers necesarios para cada campo, y vamos a mostrar un mensaje de error debajo de cada campo si el campo no es correcto, el mensaje de error debe desaparecer cuando el usuario corrija el error.

Además cuando se pulse en el botón de solicitar reserva, si el formulario no es correcto, tiene que aparece un aviso para que chequee los campos, acuerdate que estamos usando shad cn
```

Como último paso, si el formulario es correcot vamos a usar Resend para enviar un correo al dueño de la propiedad con los datos de la reserva, para ello vamos a crear una función en el backend que se encargue de enviar el correo, y vamos a llamar a esa función desde el frontend cuando se pulse en el botón de solicitar reserva, pasando los datos del formulario como parámetros.

```
Como último paso, si el formulario es correcot vamos a usar Resend para enviar un correo al dueño de la propiedad con los datos de la reserva, para ello vamos a crear una función en el backend que se encargue de enviar el correo, y vamos a llamar a esa función desde el frontend cuando se pulse en el botón de solicitar reserva, pasando los datos del formulario como parámetros.

Crea las variables de entorno necesarias para Resend, y el correo por defecto para pruebas y dime donde poner el token de resend
```

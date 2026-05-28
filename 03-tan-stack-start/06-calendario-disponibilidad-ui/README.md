# Calendario - UI

Ya tengo una server function que me carga la diponibilidad de un mes dado, ahora quiero conectar el UI con esa función para mostrar la disponibilidad en el calendario, y después permitir que el usuario pueda elegir rangos de fechas, quiero reservar desde este día a este otro día.

Así que vamos por pasos, primer prompt

```
/grill-me ahora quiero en la sección de disponibilidad añadir un calendario que muestre la disponibilidad del mes, y que permita seleccionar rangos de fechas para reservar, para los rangos de fecha creo que lo mejor es usar la server function que hemos creado, planteate si ampliarla a que traiga varios meses o no, y ten en cuenta que un usuario podría plantear que, por ejemplo, un usuario quiera reservar del 30 de marzo al 2 de abril,en un primer paso nos podemos centrar en mostrar la información, y ya despues ir a por la selección ,pero quiero que lo tengas en cuenta ya que tienes que mirar si ShadCN ofrece un componente como este y que de esta funcionalidad
```

Antes de ponernos con la selección hay dos cosas que sería bueno arreglar:
  - Debajo de disponibilidad siempre pone "Mayo de 2026" lo suyo es que ponga el mes que se está mostrando.
  - Estarí muy bien tener deep linking, es decir que si estoy en el mes actual, pues la url principal no tiene parametros, pero si no por ejemplo he elegido julio, meto eso para query param en la url principal y así si le mando por whatsapp o email un enlace a un amigo puede ver directamnete la disponibilidad de julio.

Vamos a arreglar esto en dos pasos

El primero no hace falta grill me es muy fácil:

```md
Debajo de disponibilidad siempre pone "Mayo de 2026" lo suyo es que ponga el mes que se está mostrando.
```

El segundo si toca temas de tanstack start especificos y hay que trabajarlo y decirle que lea la ultima versión de la documentación.

```
```
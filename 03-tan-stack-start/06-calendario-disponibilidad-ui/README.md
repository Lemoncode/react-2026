# Calendario - UI

Ya tengo una server function que me carga la diponibilidad de un mes dado, ahora quiero conectar el UI con esa función para mostrar la disponibilidad en el calendario, y después permitir que el usuario pueda elegir rangos de fechas, quiero reservar desde este día a este otro día.

Así que vamos por pasos, primer prompt

```
/grill-me ahora quiero en la sección de disponibilidad añadir un calendario que muestre la disponibilidad del mes, y que permita seleccionar rangos de fechas para reservar, para los rangos de fecha creo que lo mejor es usar la server function que hemos creado, planteate si ampliarla a que traiga varios meses o no, y ten en cuenta que un usuario podría plantear que, por ejemplo, un usuario quiera reservar del 30 de marzo al 2 de abril,en un primer paso nos podemos centrar en mostrar la información, y ya despues ir a por la selección ,pero quiero que lo tengas en cuenta ya que tienes que mirar si ShadCN ofrece un componente como este y que de esta funcionalidad
```

Antes de ponernos con la selección hay un detalle que sería bueno arreglar: Debajo de disponibilidad siempre pone "Mayo de 2026" lo suyo es que ponga el mes que se está mostrando.

Este es muy facil

```md
Debajo de disponibilidad siempre pone "Mayo de 2026" lo suyo es que ponga el mes que se está mostrando.
```


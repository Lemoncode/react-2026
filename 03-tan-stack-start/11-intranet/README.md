# Intranet

Vamos ahora a por la intranet, aquí vamos a tirar de Claude a tope, y vamos a ir avanzado por pasos pero contandole todo lo que queremos hacer.

Lo ideal sería partir de un Figma o un Pencil tirando de controles de ShadCN, pero vamos a ir más rápido y confiar con Claude.

Antes de escribir el prompt, vamos plantear que queremos hacer:

Queremos tener un panel de intranet el que el usuario vea un calendario con las reservas si hace hover sobre una reserva seria interesante mostrar un tooltip con la información de la reserva, y al hacer click en la reserva, que si está en escritorio aparezca el detalle de la reserva a la derecha, y si está en móvil, que aparezca abajo, y lo idea sería que se pudiera editar, y también se pudiera cambiar el estado de la reserva, y que se pudiera eliminar la reserva, ojo a tener en cuenta, no solo hay reservas, hay un tipo de reserva que es que no está disponible el espacio, y eso se tiene que tener en cuenta a la hora de gestionar que campos son obligatorios de informar.

Además le daremos como info un ejemplo de documento de mongoDb para que lo tenga en cuenta.

Y también vamos a hacerlo por pasos, aunque le digamos todo lo que queremos hacer, el primer paso es mostrar el calendario con las reservas, y asegurarnos que es una server function protegida por auth (que no se pueda acceder a la misma desde postman).

Vamos con el primer prompt:

```md
/grill-me 
Ahora quiero que en la intranet el usuario autenticado vea un calendario con las reservas si hace hover sobre una reserva seria interesante mostrar un tooltip con la información de la reserva, y al hacer click en la reserva, que si está en escritorio aparezca el detalle de la reserva a la derecha, y si está en móvil, que aparezca abajo, y lo idea sería que se pudiera editar, y también se pudiera cambiar el estado de la reserva, y que se pudiera eliminar la reserva, ojo a tener en cuenta, no solo hay reservas, hay un tipo de reserva que es que no está disponible el espacio, y eso se tiene que tener en cuenta a la hora de gestionar que campos son obligatorios de informar.

En Base de datos te paso varios ejemplos de documentos de reserva.

{
  "_id": {
    "$oid": "6a1dab079584647492e6e408"
  },
  "propertyId": "villa_001",
  "type": "booking",
  "status": "confirmed",
  "startDate": {
    "$date": "2026-07-15T00:00:00.000Z"
  },
  "endDate": {
    "$date": "2026-07-20T00:00:00.000Z"
  },
  "nights": 5,
  "guest": {
    "id": "guest_ana_perez",
    "name": "Ana Pérez",
    "email": "ana.perez@example.com",
    "phone": "+34600111222"
  },
  "occupancy": {
    "adults": 2,
    "children": 1,
    "babies": 0,
    "pets": 1
  },
  "price": {
    "nightlyRate": 150,
    "cleaningFee": 40,
    "touristTax": 20,
    "discount": 30,
    "subtotal": 750,
    "total": 780,
    "currency": "EUR"
  },
  "payment": {
    "status": "paid",
    "method": "stripe",
    "transactionId": "txn_seed_001",
    "paidAmount": 780,
    "paidAt": {
      "$date": "2026-05-29T00:00:00.000Z"
    }
  },
  "createdAt": {
    "$date": "2026-05-22T00:00:00.000Z"
  },
  "updatedAt": {
    "$date": "2026-05-29T00:00:00.000Z"
  }
}

{
  "_id": {
    "$oid": "6a1dab079584647492e6e40b"
  },
  "propertyId": "villa_001",
  "type": "booking",
  "status": "cancelled",
  "startDate": {
    "$date": "2026-09-05T00:00:00.000Z"
  },
  "endDate": {
    "$date": "2026-09-09T00:00:00.000Z"
  },
  "nights": 4,
  "guest": {
    "id": "guest_maria_lopez",
    "name": "María López",
    "email": "maria.lopez@example.com",
    "phone": "+34622333444"
  },
  "occupancy": {
    "adults": 3,
    "children": 0,
    "babies": 0,
    "pets": 0
  },
  "price": {
    "nightlyRate": 160,
    "cleaningFee": 40,
    "touristTax": 24,
    "discount": 0,
    "subtotal": 640,
    "total": 704,
    "currency": "EUR"
  },
  "payment": {
    "status": "refunded",
    "method": "stripe",
    "transactionId": "txn_seed_004",
    "paidAmount": 0,
    "paidAt": {
      "$date": "2026-05-12T00:00:00.000Z"
    }
  },
  "createdAt": {
    "$date": "2026-05-07T00:00:00.000Z"
  },
  "updatedAt": {
    "$date": "2026-05-22T00:00:00.000Z"
  },
  "cancelledAt": {
    "$date": "2026-05-22T00:00:00.000Z"
  }
}

{
  "_id": {
    "$oid": "6a1dab079584647492e6e426"
  },
  "propertyId": "villa_001",
  "type": "block",
  "subtype": "owner_use",
  "status": "confirmed",
  "startDate": {
    "$date": "2026-11-17T00:00:00.000Z"
  },
  "endDate": {
    "$date": "2026-11-19T00:00:00.000Z"
  },
  "nights": 2,
  "notes": {
    "internal": "Uso del propietario"
  },
  "createdAt": {
    "$date": "2026-05-06T00:00:00.000Z"
  },
  "updatedAt": {
    "$date": "2026-05-06T00:00:00.000Z"
  }
}

Esto lo vamos a hacer por pasos, el primer paso es mostrar el calendario con las reservas, y asegurarnos que es una server function protegida por auth (que no se pueda acceder a la misma desde postman).

Asegurate de ser consistente con el diseño, y de usar los componentes de ShadCN, y de que el código esté bien estructurado y sea fácil de mantener.
```

Vamos a por el siguiente paso, que se muestre el tooltip con la información de la reserva al hacer hover sobre una reserva:

```
/grill-me ahora quiero que implementes el tooltip con la información de la reserva al hacer hover sobre una reserva, el tooltip debe mostrar la información más relevante de la reserva, como el nombre del huésped, las fechas de la reserva, el estado de la reserva, y el precio total. Asegurate de que el diseño del tooltip sea consistente con el resto de la intranet y que se vea bien tanto en escritorio como en móvil.
```

Ahora quiero ir a la edición de detalle, empezamos por mostrar el detalle.

```md
/grill-me Ahora quiero que cuando se pinche en una reserva/slot, aparezca el detalle de la reserva, al ver el diseño me he dado cuenta que mejor que siempre aparezca abajo, de momento que salga como solo lectura y que haya un icono o no botón (lo que mejor veas a nivel de diseño) para editar la reserva (el edit lo haremos más adelante), deja también preparado un icono o botón para eliminar la reserva / slot, pero de momento que no haga nada, solo que se vea el icono. Asegurate de que el diseño del detalle sea consistente con el resto de la intranet y que se vea bien tanto en escritorio como en móvil

Para que lo pieneses también hara falta un botón para crear reserva, piensa donde poner ese botón, y ten en cuenta para el diseño que vas a hace ahora, que ese flujo estará también en la aplicación a futuro 
```

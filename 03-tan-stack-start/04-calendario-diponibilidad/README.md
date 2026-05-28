# Calendario 

Vamos ahora a por el calendario de disponibilidad, aquí tenemos lógica de negocio y datos propios que guardar.

Desafios:
  - Tenemos que modelar esto (no es Front End, pero nos toca como emprendedores que somos).
  - Tenemos que crear un entorno dockerizado para la BBDD y que sea fácil usarlo para todos.
  - Tenemos que crear un console runner para alimentar con los datos iniciales.

Empezamos por definir un mongoDB en un dockerfile para poder levantarlo y que cualquier desarrollador pueda trabajar con el sin tener que instalar mongo en su máquina local.

Vamos con un prompt en planning (Esto lo podría sacar también con chatp gpt):

```
/grill-me Vamos por pasos, primero quiero tener un docker compose para levantar un mongodb que persista los datos en el disco duro local, y los comandos en el package.json para levantarlo etc, y más adelante (no en este paso) crearemos un console runner para crear BBDD y alimentar datos de prueba, pero de primeras el docker file
```

## Base de datos local (MongoDB)

Requisitos: Docker Desktop instalado.

Comandos disponibles:

```bash
pnpm db:up     # Arranca Mongo en background (puerto 27018)
pnpm db:down   # Para el contenedor
pnpm db:logs   # Sigue los logs en tiempo real
```

Connection string (ya cargada en `.env` como `MONGO_URI`):

```
mongodb://localhost:27018/calendar-availability
```

Los datos persisten en `./data/mongo` (carpeta gitignored). Para empezar desde cero:

```bash
pnpm db:down && rm -rf ./data/mongo
```

> Nota: si tienes otra instancia de Mongo en `27017`, este setup no choca porque usa `27018` en el host. Si necesitas borrar `./data/mongo` y te da problemas de permisos, ejecútalo con `sudo` (los ficheros pertenecen al uid del contenedor).

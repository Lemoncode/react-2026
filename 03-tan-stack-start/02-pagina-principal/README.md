# Página principal

Vamos a darle caña a la página principal.

Antes de ponernos a promptear como si no hubier un mañana, pensemos en que la cagamos al ir en modo prototipo:

- Lo primero fue la configuracíon de ShadCN, que se lió y por si solo bajo a tailwind 3, así que vamos a investigar un poco como configurar ShadCN con Tailwind 4

En mi caso me voy a chatGPT y pregunto

```
Tengo tailwind 4 en mi proyecto, pero he ido a instalar ShadCN y se ha hecho la picha un lio y me ha hecho un downgrade a tailwind 3, creo que tenía documentación antigua, creo que desde 2025 se puede usar shadCN y tailwind 4es así? y como
```

```
Y siguiente paso estoy usando tan stack Start, tengo tailwind 4 instalado pero todavía no tengo shadCN, ¿Me dices los pasos para configurarlo?
```

Si lo que hay me convence, tendría que buscar documentacion oficial, me voy a shadCN y busco en docs

https://ui.shadcn.com/docs/installation/tanstack

Le voy a decir a chatGPT que haga un doble check

Vamos a hacer una cosa, como parece que está claro con la documentación le vamos a pedir a claude que cree un skill para poder instalar shadCN, le indicamos que la info que tiene es antigua y que la ha cagado antes, después comprobaremos si tiene sentido e iremos a por ese skill

Así que abrimos claude le pedimos que vaya en modo plan, o si no estamo seguros, /grill-me y le decimos

```
Me hace falta hacer setup de shadCN con Tailwind 4 (que ya está instalado en el proyecto), pasa una cosa, en otro proyecto te lo pedí pero la cagaste, porque tenías documentación antigua y me llegaste a hacer un downgrade a tailwind 3, así que he buscado la documentación oficial, aquí la tienes: https://ui.shadcn.com/docs/installation/tanstack quiero que me crees un skill para poder integrar shadCN en un proyecto tanStackStart con Tailwind 4, siguiendo la documentación oficial, hazlo paso a paso y con comandos concretos, no te olvides de nada, y si hay algo que no entiendes me lo preguntas antes de crear el skill, ese skill se puede llamar setup-shadcn-tanstack-tailwind4
```

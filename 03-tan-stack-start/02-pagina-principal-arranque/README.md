# Página principal

Vamos a darle caña a la página principal.

Antes de ponernos a promptear como si no hubiera un mañana, pensemos en que la cagamos al ir en modo prototipo:

- Lo primero fue la configuración de ShadCN, que se lió y por sí solo bajo a tailwind 3, así que vamos a investigar un poco cómo configurar ShadCN con Tailwind 4

> ShadCN es un proyecto "especial" si quieres ver como funciona: https://www.youtube.com/watch?v=hhudoSMM0yU

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

Así que abrimos claude le pedimos que vaya en modo plan, o si no estamos seguros, /grill-me y le decimos

```
Me hace falta hacer setup de shadCN con Tailwind 4 (que ya está instalado en el proyecto), pasa una cosa, en otro proyecto te lo pedí pero la cagaste, porque tenías documentación antigua y me llegaste a hacer un downgrade a tailwind 3, así que he buscado la documentación oficial, aquí la tienes: https://ui.shadcn.com/docs/installation/tanstack quiero que me crees un skill para poder integrar shadCN en un proyecto tanStackStart con Tailwind 4, siguiendo la documentación oficial, hazlo paso a paso y con comandos concretos, no te olvides de nada, y si hay algo que no entiendes me lo preguntas antes de crear el skill, ese skill se puede llamar setup-shadcn-tanstack-tailwind4
```

Vamos ahora a pedirle que ejecute ese skills

```
Vamos a probar el skill que acabas de crear, dale caña
```

Una vez que vemos que todo ok le indicamos que revise y mejor el skill con lo que ha aprendido, y que lo deje perfecto para que lo pueda usar cualquiera

```
Ahora que han funcionado, mejora el skill con lo que has aprendido, hazlo perfecto para que lo pueda usar cualquiera, revisa que no te hayas dejado nada, y que todo esté correcto, hazlo paso a paso y con comandos concretos
```

Otro tema interesante es instalar lucide-icons

```bash
npm install lucide-react
```

Aquí en el Claude MD podemos indicar que siempre que vaya a usar un icono que busque en lucide-react y lo use.

_./CLAUDE.md_

```
- Siempre que necesites usar un icono, busca en lucide-react y úsalo, no te olvides de importarlo
```

Para aprender tengo el contenido estático en un Headless CMS así directamente puedo darle acceso al propietario de la villa para que pueda modificar contenido.

Estando modo "IA a tope" podríamos directamente indicarle que creara el layout e incluso hiciera todo el setup para Content Island etc...

Instalamos el cliente de Content Island

```bash
pnpm add @content-island/api-client
```

Lo primero que vamos a hacer es meter la variable de entorno con el token de lectura para poder leer estos datos:

```bash
CONTENT_ISLAND_ACCESS_TOKEN=d2e92c0f5bc6b23e86cc901026fd51c3
```

Lo segundo vamos a inicializar el cliente de Content Island

_./src/lib/content-island.ts_

```ts
import { createClient } from "@content-island/api-client";

export const contentIslandClient = createClient({
  accessToken: process.env.CONTENT_ISLAND_ACCESS_TOKEN!,
});
```

Y ahora vamos a cargar los datos y montar la página, para ello podríamos optar por diferentes opciones:

- Cargarlo con un loader en la página principal, y después pasarselo a los componentes (tener un pod que sea página principal), lo bueno de esto es que tenemos SSR y es una sola llamada.

- Cargarlo con un loader en la página principal y tener un pod por cada sección, se podrían pasar las props a cada sección, o tener un contexto para compartir la info, lo bueno de esto es que cada sección se puede cargar de forma independiente, y si hay algo que no se muestra en una sección no afecta a las demás.

- Que cada sección cargue sus datos, lo bueno de esto es que cada sección es totalmente independiente, y si hay algo que no se muestra en una sección no afecta a las demás, lo malo es que perdemos SSR y tenemos que hacer varias llamadas.

Por simplicidad vamos a meter un pod para la página principal.

_./src/pods/home/home.model.ts_

```ts
import type { Media } from "@content-island/api-client";

export type FeatureType =
  | "beach"
  | "bathrooms"
  | "bedrooms"
  | "guests"
  | "wifi"
  | "kitchen"
  | "parking"
  | "aircon";

export interface HeaderSection {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  logo: Media;
  villaName: string;
  navigationLinks: NavLink[];
}

export interface HeroSection {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  starText: string;
  title: string;
  location: string;
  "description ": string;
  featuresSummary: HeroSummaryFeature[];
  Pictures: Picture[];
}

export interface FeaturesSection {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  topTitle: string;
  mainTitle: string;
  features: Feature[];
  bookingInfo: string;
}

export interface AvailabilitySection {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  topTitle: string;
  freeLabel: string;
  BusyLabel: string;
  selectionLabel: string;
  rangeSelectedTopTitle: string;
  rangeSelectedMainTitle: string;
  CheckAvailabilityLabel: string;
}

export interface FooterSection {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  copyRight: string;
  privacyPolicy: NavLink;
}

export interface NavLink {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  label: string;
  url: string;
}

export interface HeroSummaryFeature {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  name: string;
  value: string;
}

export interface Picture {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  picture: Media;
  description: string;
}

export interface Feature {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  type: FeatureType;
  text: string;
}

export interface FullMainPage {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  headerSection: HeaderSection;
  heroSection: HeroSection;
  featureSection: FeaturesSection;
  availabilitySection: AvailabilitySection;
  footerSection: FooterSection;
}
```

Vamos a crear un modelo de la vista que de momento va a ser igual que el modelo de datos, así que crearemos un type y a futuro podrías hacer especializaciones.

_./src/pods/home/home.vm.ts_

```ts
import type { FullMainPage } from "./home.model";

export type FullMainPageVm = FullMainPage;
```

El mapper sería de momento directo

_./src/pods/home/home.mapper.ts_

```ts
import type { FullMainPage } from "./home.model";
import type { FullMainPageVm } from "./home.vm";

export const mapFullMainPageToVm = (content: FullMainPage): FullMainPageVm => {
  return content;
};
```

_./src/pods/home/home.server.ts_

```tsx
import { createServerFn } from "@tanstack/react-start";
import { contentIslandClient } from "@/lib/content-island";
import type { FullMainPageVm } from "./home.vm";
import { mapFullMainPageToVm } from "./home.mapper";

export const getHomePageContent = createServerFn({ method: "GET" }).handler(
  async () => {
    const content = await contentIslandClient.getContent<FullMainPageVm>({
      contentType: "FullMainPage",
      includeRelatedContent: "all",
    });
    return mapFullMainPageToVm(content);
  },
);
```

Ahora voy a crear un componente de React para crear el pod de pagina Home, que recibirá como prop el contenido que hemos cargado desde el servidor, y lo renderizará.

_./src/pods/home/home.pod.tsx_

```tsx
import type { FullMainPageVm } from "./home.vm";

interface HomeProps {
  content: FullMainPageVm;
}

export const Home: React.FC<HomeProps> = ({ content }) => {
  return (
    <div>
      <h1>{content.headerSection.villaName}</h1>
    </div>
  );
};
```

Ahora exponemos el pod y la API para que lo llame la página principal (nos hace falta así para el loader)

_./src/pods/home/index.tsx_

```tsx
export { getHomePageContent } from "./home.server";
export { Home } from "./home.pod";
```

En la página principal, vamos a llamar al loader para cargar el contenido y se lo pasamos al pod.

Borramos todo lo que hay dentro del return.

_./src/routes/index.tsx_

```ts
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main>
    </main>
  )
}
```

Y ahora nos traemos la llamada a la api y lo metemos en el loader:

_./src/routes/index.tsx_

```diff
import { createFileRoute } from '@tanstack/react-router';
+ import { getHomePageContent } from '@/pods/home';

export const Route = createFileRoute('/')({
+ loader: async() =>  {
+    const content = await getHomePageContent();
+    return { content };
+ },
  component: App
})

function App() {
  const { content } = Route.useLoaderData<{ content: FullMainPageVm }>();

  return (
+    <main className="page-wrap px-4 pb-8 pt-14">
+      <h1 className="text-4xl font-bold">{content.headerSection.villaName}</h1>
+    </main>
  )
}
```

Si arrancamos la aplicación, deberíamos ver el nombre de la villa que tenemos en el CMS, si no es así, revisa la consola y arregla los errores que puedan salir.

```bash
npm run dev
```

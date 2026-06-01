# Optimizaciones

Tenemos el sitio basico funcionando, vamos a pararnos a optimizarlo para que tenga el mejor rendimiento, sobre todo la página de home, una página que cargue muy rápido, nos posiciona en google y también da mejor experiencia al usuario.

Aquí el caso final que veremos el de tener la página pregenerada, pero antes vamos a pasar por otros casos para entender que nos ofrece Tan Stack Start

## Streaming

Una cosa muy chula que nos ofrece Tan Stack Start es el streaming, es decir, que podemos empezar a renderizar la página antes de tener toda la información, esto es muy útil para mejorar el rendimiento, sobre todo en páginas que tienen mucha información o que tardan mucho en cargar.

Vamos a simular que por ejemplo la sección de disponibilidad tarda mucho en cargar, y queremos que el usuario pueda ver la info sobre la villa cuanto antes, sin tener que esperar a que cargue toda la información.

Vamos a simular que hay un lag de 5000 segundos en cargar la disponiblidad.

_./src/pods/home/availability.api.ts_

```diff
export const getAvailabilityByMonth = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<CalendarBlockVm[]> => {
    const { month, year, monthsAhead = 0 } = data;
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month + monthsAhead, 1));

    const db = await getDb();
    const docs = await db
      .collection("calendarBlocks")
      .find({
        propertyId: PROPERTY_ID,
        status: { $in: ["confirmed", "pending"] },
        startDate: { $lt: monthEnd },
        endDate: { $gt: monthStart },
      })
      .sort({ startDate: 1 })
      .toArray();

+   // Simulamos un lag de 5000 segundos
+   await new Promise((resolve) => setTimeout(resolve, 5000));

    return docs.map(mapToCalendarBlockVm);
  });
```

Si te fijas se queda cargando, aunque la info publica ya la tengamos ¿Qué podemos hacer?

Pues en el loader de la página, indicar que la disponibilidad va a ser una promesa y que cuando se cargue se renderice esa parte de la página, mientras tanto se renderiza el resto de la página.

```diff
export const Route = createFileRoute("/")({
  loader: async () => {
    const now = new Date();
-    const [content, availability] = await Promise.all([
-      getHomePageContent(),
-      getAvailabilityByMonth({
-        data: {
-          month: now.getMonth() + 1,
-          year: now.getFullYear(),
-          monthsAhead: 1,
-        },
-      }),
-    ]);
+ const content = await getHomePageContent();
+ const availability = getAvailabilityByMonth({
+   data: {
+     month: now.getMonth() + 1,
+     year: now.getFullYear(),
+     monthsAhead: 1,
+   },
+ });

    return { content, availability };
  },
  component: App,
});
```

Tengo que hacer un build o tener funcionando el server y refactoizar el pod de home

_src/pods/home/home.pod.tsx_

```diff
interface HomeProps {
  content: FullMainPageVm;
-  availability: CalendarBlockVm[];
+  availability: Promise<CalendarBlockVm[]>;
}

export const Home: React.FC<HomeProps> = ({ content, availability }) => {
```

```diff
import type { FullMainPageVm } from "./home.vm";
import type { CalendarBlockVm } from "./availability.vm";
import { Hero } from "./components/hero.component";
import { Features } from "./components/features.component";
import { Availability } from "./components/availability.component";
+ import { Suspense, use } from "react";

export const Home: React.FC<HomeProps> = ({ content, availability }) => {
+ const availabilityContent = use(availability);

  return (
    <main className="pb-8">
      <Hero hero={content.heroSection} />
      <section className="page-wrap grid gap-8 py-10 md:grid-cols-[0.9fr_1.1fr] md:py-14">
        <Features features={content.featureSection} />
+      <Suspense fallback={<div>Loading availability...</div>}>
        <Availability
          availability={content.availabilitySection}
-          blocks={availability}
+         blocks={availabilityContent}
        />
+      </Suspense>
      </section>
    </main>
  );
};
```

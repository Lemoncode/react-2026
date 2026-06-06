# SSG

IMPORTANTE: ahora partimos del ejemplo 07 !!!!

Copiamos del ejemplo 07.

Queremos que la página cargue como un tiro y no depender de la velocidad del Headless CMS

¿Qué podemos hacer? Pregenar la página en HTML y servirla como un archivo estático, esto es lo que suelen hacer muy bien Frameworks como Astro.

Pero aquí en la home tenemos un problema:

- Hay una parte que no cambia nunca.
- Hay otra parte que es la gestión de disponibilidad que sí tiene que estar al día.

Vamos a por una solución de compromiso:

- Prerrendizo la parte que no cambia nunca.
- La parte que sí cambia la muevo como client only.

Empezamos por generar la página de forma estática:

./vite.config.ts

```diff
const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart(
+    {
+      prerender: {
+        enabled: true,
+        autoStaticPathsDiscovery: false,
+        crawlLinks: false,
+      },
+      pages: [
+        {
+          path: '/',
+          prerender: {
+            enabled: true,
+            outputPath: '/index.html',
+          },
+        },
+      ],
+   }
    ),
    viteReact(),
  ],
})
```

Si hacemos un build podemos ver que tenemos en `.output/public/index.html` el HTML generado.

Pero tenemos un problema y es que la disponibilidad sí la quiero en tiempo real ¿Qué podemos hacer? Pues mover esa parte a un componente client only.

Para ello quitamos del home page la parte de disponibilidad y la movemos a un componente client only.

_./src/routes/index.tsx_

```diff
import { createFileRoute } from "@tanstack/react-router";
import { getHomePageContent } from "@/pods/home/home.api";
import { getAvailabilityByMonth } from "@/pods/home/availability.api";
import { Home } from "@/pods/home";

export const Route = createFileRoute("/")({
  loader: async () => {
-    const now = new Date();
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
-    return { content, availability };
+   const content = await getHomePageContent();
+    return { content };
  },
  component: App,
});

function App() {
-  const { content, availability } = Route.useLoaderData();
+  const { content } = Route.useLoaderData();
-  return <Home content={content} availability={availability} />;
+  return <Home content={content} />;
}
```

_./src/pods/home/home.pod.tsx_

```diff
import type { FullMainPageVm } from "./home.vm";
import type { CalendarBlockVm } from "./availability.vm";
import { Hero } from "./components/hero.component";
import { Features } from "./components/features.component";
import { Availability } from "./components/availability.component";

interface HomeProps {
  content: FullMainPageVm;
-  availability: CalendarBlockVm[];
}

export const Home: React.FC<HomeProps> = ({ content
-, availability
}) => {
  return (
    <main className="pb-8">
      <Hero hero={content.heroSection} />
      <section className="page-wrap grid gap-8 py-10 md:grid-cols-[0.9fr_1.1fr] md:py-14">
        <Features features={content.featureSection} />
        <Availability
          availability={content.availabilitySection}
-          blocks={availability}
        />
      </section>
    </main>
  );
};
```

_./src/pods/home/components/availability.component.tsx_

```diff
- import { useState } from "react";
+ import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
// (...)
+ import { getAvailabilityByMonth } from "@/pods/home/availability.api";

interface AvailabilityProps {
  availability: AvailabilitySection;
-  blocks: CalendarBlockVm[];
}

export const Availability = ({ availability,
- blocks
}: AvailabilityProps) => {
```

```diff
export const Availability = ({ availability, blocks }: AvailabilityProps) => {
  const navigate = useNavigate();
  const [range, setRange] = useState<DateRange | undefined>(undefined);
+ const [blocks, setBlocks] = useState<CalendarBlockVm[]>([]);

  const { isValid } = getRangeValidity(range);

  // Esto se podría hacer con TanStack Query pero lo hacemos así para no complicar el ejemplo
+  useEffect(() => {
+    const now = new Date();
+
+    getAvailabilityByMonth({
+      data: {
+        month: now.getMonth() + 1,
+        year: now.getFullYear(),
+        monthsAhead: 1,
+      },
+    }).then(setBlocks);
+  }, []);

  const { isValid } = getRangeValidity(range);
```

Si lo probamos, no sale en blanco, vamos a hacer un ajuste más en `date-range-picker.tsx`

```diff
export const DateRangePicker = ({
  blocks,
  value,
  onChange,
  labels,
  minNights = MIN_NIGHTS,
  children,
}: DateRangePickerProps) => {
  const today = useMemo(startOfToday, []);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [visibleMonth, setVisibleMonth] = useState<Date>(value?.from ?? today);
  const [currentBlocks, setCurrentBlocks] = useState<CalendarBlockVm[]>(blocks);
  const isInitialRender = useRef(true);

+  useEffect(() => {
+    setCurrentBlocks(blocks);
+  }, [blocks]);

  const bookedRanges = useMemo(
    () =>
      currentBlocks.map((block) => ({
        from: new Date(block.startDate),
        to: addDays(new Date(block.endDate), -1),
      })),
    [currentBlocks],
  );

```

Se podría haber hecho con TanStack Query y Suspense.

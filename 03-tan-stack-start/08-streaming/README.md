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

Navego desde homePod hasta availability

```diff

- import { useState } from "react";
+ import { Suspense, use, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DateRangePicker,
  getRangeValidity,
  toIsoDate,
} from "@/components/date-range-picker";
import type { AvailabilitySection } from "../home.model";
import type { CalendarBlockVm } from "../availability.vm";

interface AvailabilityProps {
  availability: AvailabilitySection;
-   blocks: CalendarBlockVm[];
+  blocks: Promise<CalendarBlockVm[]>;
}

export const Availability = ({ availability, blocks }: AvailabilityProps) => {
  const navigate = useNavigate();
  const [range, setRange] = useState<DateRange | undefined>(undefined);
+  const blocksContent = use(blocks);
  const { isValid } = getRangeValidity(range);

  const handleConsult = () => {
    if (!isValid || !range?.from || !range?.to) return;
    navigate({
      to: "/reserva",
      search: { from: toIsoDate(range.from), to: toIsoDate(range.to) },
    });
  };



  return (
    <Card className="island-shell gap-0 rounded-[2rem] border-0 p-0 ring-0">
      <CardContent className="p-7">
+        <Suspense fallback={<div>Loading availability...</div>}>
          <DateRangePicker
-           blocks={blocks}
+            blocks={blocksContent}
            value={range}
            onChange={setRange}
            labels={{
              topTitle: availability.topTitle,
              freeLabel: availability.freeLabel,
              busyLabel: availability.BusyLabel,
              selectionLabel: availability.selectionLabel,
              rangeSelectedTopTitle: availability.rangeSelectedTopTitle,
              rangeSelectedMainTitle: availability.rangeSelectedMainTitle,
            }}
          >
            <Button
              type="button"
              disabled={!isValid}
              onClick={handleConsult}
              aria-label={availability.CheckAvailabilityLabel}
              className="mt-4 h-12 w-full rounded-2xl bg-[var(--lagoon-deep)] text-base font-semibold text-white hover:bg-[#246f76] disabled:opacity-60"
            >
              {availability.CheckAvailabilityLabel}
            </Button>
          </DateRangePicker>
+        </Suspense>
      </CardContent>
    </Card>
  );
};
```

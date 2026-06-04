import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { IntranetCalendar, getBookingsByMonth } from "@/pods/intranet-calendar";

const searchSchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  selected: z.string().optional(),
});

export const Route = createFileRoute("/(auth)/intranet/")({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search }) => ({ year: search.year, month: search.month }),
  loader: async ({ deps }) => {
    const now = new Date();
    const year = deps.year ?? now.getUTCFullYear();
    const month = deps.month ?? now.getUTCMonth() + 1;
    // Protected server function: rejects calls without a valid session (401).
    const items = await getBookingsByMonth({ data: { year, month } });
    return { items, year, month };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { items, year, month } = Route.useLoaderData();
  const { selected } = Route.useSearch();
  return (
    <IntranetCalendar
      items={items}
      year={year}
      month={month}
      selectedId={selected}
    />
  );
}

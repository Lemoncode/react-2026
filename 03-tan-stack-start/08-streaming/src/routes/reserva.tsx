import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { getAvailabilityByMonth } from "@/pods/home/availability.api";
import { MIN_NIGHTS, parseIsoDate } from "@/components/date-range-picker";
import { Booking } from "@/pods/booking";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;

const searchSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

const startOfToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Business validation for the dates carried in the query string. */
const isValidDateRange = (from?: string, to?: string): boolean => {
  if (!from || !to || !ISO_DATE.test(from) || !ISO_DATE.test(to)) return false;
  const fromDate = parseIsoDate(from);
  const toDate = parseIsoDate(to);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return false;
  }
  if (fromDate < startOfToday()) return false;
  const nights = Math.round((toDate.getTime() - fromDate.getTime()) / MS_PER_DAY);
  return nights >= MIN_NIGHTS;
};

export const Route = createFileRoute("/reserva")({
  validateSearch: (search) => searchSchema.parse(search),
  beforeLoad: ({ search }) => {
    // Malformed/manipulated URL (bad format, order, past dates, < min nights):
    // bounce back to home. Occupied-but-well-formed dates are handled in the
    // page with a modal, so they intentionally pass through here.
    if (!isValidDateRange(search.from, search.to)) {
      throw redirect({ to: "/" });
    }
  },
  loaderDeps: ({ search }) => ({ from: search.from!, to: search.to! }),
  loader: async ({ deps }) => {
    const fromDate = parseIsoDate(deps.from);
    const toDate = parseIsoDate(deps.to);
    const monthsAhead = Math.min(
      6,
      Math.max(
        0,
        (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
          (toDate.getMonth() - fromDate.getMonth()),
      ),
    );
    const blocks = await getAvailabilityByMonth({
      data: {
        month: fromDate.getMonth() + 1,
        year: fromDate.getFullYear(),
        monthsAhead,
      },
    });
    return { blocks };
  },
  component: ReservaPage,
});

function ReservaPage() {
  const { from, to } = Route.useSearch();
  const { blocks } = Route.useLoaderData();
  return <Booking from={from!} to={to!} blocks={blocks} />;
}

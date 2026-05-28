import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { es } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { AvailabilitySection } from "../home.model";
import type { CalendarBlockVm } from "../availability.vm";
import { getAvailabilityByMonth } from "../availability.api";

interface AvailabilityProps {
  availability: AvailabilitySection;
  currentMonth: string;
  blocks: CalendarBlockVm[];
}

const startOfToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date: Date, n: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

export const Availability = ({
  availability,
  currentMonth,
  blocks,
}: AvailabilityProps) => {
  const today = useMemo(startOfToday, []);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [visibleMonth, setVisibleMonth] = useState<Date>(today);
  const [currentBlocks, setCurrentBlocks] = useState<CalendarBlockVm[]>(blocks);
  const isInitialRender = useRef(true);

  const bookedRanges = useMemo(
    () =>
      currentBlocks.map((block) => ({
        from: new Date(block.startDate),
        to: addDays(new Date(block.endDate), -1),
      })),
    [currentBlocks],
  );

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    let cancelled = false;
    getAvailabilityByMonth({
      data: {
        month: visibleMonth.getMonth() + 1,
        year: visibleMonth.getFullYear(),
        monthsAhead: 1,
      },
    }).then((next) => {
      if (!cancelled) setCurrentBlocks(next);
    });
    return () => {
      cancelled = true;
    };
  }, [visibleMonth]);

  return (
    <Card className="island-shell gap-0 rounded-[2rem] border-0 p-0 ring-0">
      <CardContent className="p-7">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="island-kicker mb-2 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> {availability.topTitle}
            </p>
            <h2 className="text-3xl font-semibold text-[var(--sea-ink)]">
              {currentMonth}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--sea-ink-soft)]">
            <span className="flex items-center gap-2">
              <i className="h-3 w-3 rounded-full bg-[var(--sand)]" />
              {availability.freeLabel}
            </span>
            <span className="flex items-center gap-2">
              <i className="h-3 w-3 rounded-full bg-[#e8b3a4]" />
              {availability.BusyLabel}
            </span>
          </div>
        </div>

        <Calendar
          mode="single"
          locale={es}
          numberOfMonths={isDesktop ? 2 : 1}
          month={visibleMonth}
          onMonthChange={setVisibleMonth}
          startMonth={today}
          disabled={[{ before: today }, ...bookedRanges]}
          modifiers={{ booked: bookedRanges }}
          modifiersClassNames={{
            booked:
              "bg-[#e8b3a4]/70 text-[var(--sea-ink)] line-through opacity-100",
          }}
          showOutsideDays={false}
          className="mx-auto"
        />

        <div className="mt-7 rounded-3xl bg-[var(--sand)] p-5">
          <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
            {availability.rangeSelectedTopTitle}
          </p>
          <p className="mt-1 text-xl font-semibold text-[var(--sea-ink)]">
            {availability.rangeSelectedMainTitle}
          </p>
          <Button
            type="button"
            disabled
            aria-label={availability.CheckAvailabilityLabel}
            className="mt-4 h-12 w-full rounded-2xl bg-[var(--lagoon-deep)] text-base font-semibold text-white hover:bg-[#246f76] disabled:opacity-60"
          >
            {availability.CheckAvailabilityLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

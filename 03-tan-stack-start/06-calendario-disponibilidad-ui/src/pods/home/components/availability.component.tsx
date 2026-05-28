import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { es } from "react-day-picker/locale";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { AvailabilitySection } from "../home.model";
import type { CalendarBlockVm } from "../availability.vm";
import { getAvailabilityByMonth } from "../availability.api";

interface AvailabilityProps {
  availability: AvailabilitySection;
  blocks: CalendarBlockVm[];
}

const MIN_NIGHTS = 2;

const formatMonthLabel = (date: Date): string => {
  const label = date.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

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

const diffInNights = (from: Date, to: Date): number =>
  Math.round((to.getTime() - from.getTime()) / 86_400_000);

const formatRangeLabel = (from: Date, to: Date): string => {
  const sameMonth =
    from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  const fromDay = from.getDate();
  const toDay = to.getDate();
  const fromMonth = from.toLocaleDateString("es-ES", { month: "long" });
  const toMonth = to.toLocaleDateString("es-ES", { month: "long" });
  return sameMonth
    ? `Del ${fromDay} al ${toDay} de ${toMonth}`
    : `Del ${fromDay} de ${fromMonth} al ${toDay} de ${toMonth}`;
};

export const Availability = ({
  availability,
  blocks,
}: AvailabilityProps) => {
  const today = useMemo(startOfToday, []);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [visibleMonth, setVisibleMonth] = useState<Date>(today);
  const [currentBlocks, setCurrentBlocks] = useState<CalendarBlockVm[]>(blocks);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
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

  const hasSelection = Boolean(range?.from);
  const isComplete = Boolean(range?.from && range?.to);
  const nights =
    range?.from && range?.to ? diffInNights(range.from, range.to) : 0;
  const isValid = isComplete && nights >= MIN_NIGHTS;
  const isInvalid = isComplete && nights < MIN_NIGHTS;

  const handleConsult = () => {
    if (!isValid || !range?.from || !range?.to) return;
    console.log("Consulta disponibilidad:", {
      from: range.from,
      to: range.to,
      nights,
    });
  };

  const handleClear = () => setRange(undefined);

  const renderPanelMainText = () => {
    if (isValid && range?.from && range?.to) {
      return (
        <p className="mt-1 text-xl font-semibold text-[var(--sea-ink)]">
          {formatRangeLabel(range.from, range.to)} · {nights} noches
        </p>
      );
    }
    if (isInvalid && range?.from && range?.to) {
      return (
        <p className="mt-1 text-xl font-semibold text-destructive">
          {formatRangeLabel(range.from, range.to)} · Mínimo {MIN_NIGHTS} noches
        </p>
      );
    }
    return (
      <p className="mt-1 text-xl font-semibold text-[var(--sea-ink)]">
        {availability.rangeSelectedMainTitle}
      </p>
    );
  };

  return (
    <Card className="island-shell gap-0 rounded-[2rem] border-0 p-0 ring-0">
      <CardContent className="p-7">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="island-kicker mb-2 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> {availability.topTitle}
            </p>
            <h2 className="text-3xl font-semibold text-[var(--sea-ink)]">
              {formatMonthLabel(visibleMonth)}
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
            <span className="flex items-center gap-2">
              <i className="h-3 w-3 rounded-full bg-[var(--lagoon-deep)]" />
              {availability.selectionLabel}
            </span>
          </div>
        </div>

        <Calendar
          mode="range"
          locale={es}
          numberOfMonths={isDesktop ? 2 : 1}
          month={visibleMonth}
          onMonthChange={setVisibleMonth}
          startMonth={today}
          selected={range}
          onSelect={setRange}
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
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
              {availability.rangeSelectedTopTitle}
            </p>
            {hasSelection && (
              <button
                type="button"
                onClick={handleClear}
                className="text-sm font-medium text-[var(--lagoon-deep)] underline-offset-2 hover:underline"
              >
                Limpiar
              </button>
            )}
          </div>
          {renderPanelMainText()}
          <Button
            type="button"
            disabled={!isValid}
            onClick={handleConsult}
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

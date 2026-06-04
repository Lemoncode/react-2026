import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { es } from "react-day-picker/locale";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getAvailabilityByMonth } from "@/pods/home/availability.api";
import type { CalendarBlockVm } from "@/pods/home/availability.vm";

export const MIN_NIGHTS = 2;

const MS_PER_DAY = 86_400_000;

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
  Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);

/** Serializes a Date to the `YYYY-MM-DD` form used in the URL query string. */
export const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Parses a `YYYY-MM-DD` string into a local Date at midnight. */
export const parseIsoDate = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1, 0, 0, 0, 0);
};

export interface RangeValidity {
  hasSelection: boolean;
  isComplete: boolean;
  nights: number;
  isValid: boolean;
  isInvalid: boolean;
}

export const getRangeValidity = (
  range: DateRange | undefined,
  minNights = MIN_NIGHTS,
): RangeValidity => {
  const hasSelection = Boolean(range?.from);
  const isComplete = Boolean(range?.from && range?.to);
  const nights =
    range?.from && range?.to ? diffInNights(range.from, range.to) : 0;
  return {
    hasSelection,
    isComplete,
    nights,
    isValid: isComplete && nights >= minNights,
    isInvalid: isComplete && nights < minNights,
  };
};

export const formatRangeLabel = (from: Date, to: Date): string => {
  const sameMonth =
    from.getMonth() === to.getMonth() &&
    from.getFullYear() === to.getFullYear();
  const fromDay = from.getDate();
  const toDay = to.getDate();
  const fromMonth = from.toLocaleDateString("es-ES", { month: "long" });
  const toMonth = to.toLocaleDateString("es-ES", { month: "long" });
  return sameMonth
    ? `Del ${fromDay} al ${toDay} de ${toMonth}`
    : `Del ${fromDay} de ${fromMonth} al ${toDay} de ${toMonth}`;
};

const formatMonthLabel = (date: Date): string => {
  const label = date.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export interface DateRangePickerLabels {
  topTitle: string;
  freeLabel: string;
  busyLabel: string;
  selectionLabel: string;
  rangeSelectedTopTitle: string;
  rangeSelectedMainTitle: string;
}

interface DateRangePickerProps {
  blocks: CalendarBlockVm[];
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  labels: DateRangePickerLabels;
  minNights?: number;
  /** Rendered inside the selection panel (e.g. the page-specific CTA). */
  children?: React.ReactNode;
}

/**
 * Calendar + selection panel for picking a booking date range. It loads the
 * occupied blocks for the visible month and enforces a minimum number of
 * nights, but it is action-agnostic: the consuming page supplies its own CTA
 * through `children`.
 */
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

  useEffect(() => {
    setCurrentBlocks(blocks);
  }, [blocks]);

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

  const { hasSelection, isValid, isInvalid } = getRangeValidity(
    value,
    minNights,
  );
  const nights =
    value?.from && value?.to ? diffInNights(value.from, value.to) : 0;

  const handleClear = () => onChange(undefined);

  const renderPanelMainText = () => {
    if (isValid && value?.from && value?.to) {
      return (
        <p className="mt-1 text-xl font-semibold text-[var(--sea-ink)]">
          {formatRangeLabel(value.from, value.to)} · {nights} noches
        </p>
      );
    }
    if (isInvalid && value?.from && value?.to) {
      return (
        <p className="mt-1 text-xl font-semibold text-destructive">
          {formatRangeLabel(value.from, value.to)} · Mínimo {minNights} noches
        </p>
      );
    }
    return (
      <p className="mt-1 text-xl font-semibold text-[var(--sea-ink)]">
        {labels.rangeSelectedMainTitle}
      </p>
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="island-kicker mb-2 flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> {labels.topTitle}
          </p>
          <h2 className="text-3xl font-semibold text-[var(--sea-ink)]">
            {formatMonthLabel(visibleMonth)}
          </h2>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-[var(--sea-ink-soft)]">
          <span className="flex items-center gap-2">
            <i className="h-3 w-3 rounded-full bg-[var(--sand)]" />
            {labels.freeLabel}
          </span>
          <span className="flex items-center gap-2">
            <i className="h-3 w-3 rounded-full bg-[#e8b3a4]" />
            {labels.busyLabel}
          </span>
          <span className="flex items-center gap-2">
            <i className="h-3 w-3 rounded-full bg-[var(--lagoon-deep)]" />
            {labels.selectionLabel}
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
        selected={value}
        onSelect={onChange}
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
            {labels.rangeSelectedTopTitle}
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
        {children}
      </div>
    </div>
  );
};

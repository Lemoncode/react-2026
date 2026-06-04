import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatMonthTitle,
  nextMonth,
  previousMonth,
} from "./calendar-grid.helpers";
import { CalendarLegend } from "./components/calendar-legend.component";
import { MonthCalendarGrid } from "./components/month-calendar-grid.component";
import type { CalendarItemVm } from "./intranet-calendar.vm";

interface IntranetCalendarProps {
  items: CalendarItemVm[];
  year: number;
  month: number;
}

const navButtonClass =
  "inline-flex size-9 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]";

const todayButtonClass =
  "inline-flex h-9 items-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 text-sm font-medium text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]";

export const IntranetCalendar = ({
  items,
  year,
  month,
}: IntranetCalendarProps) => {
  const prev = previousMonth(year, month);
  const next = nextMonth(year, month);
  const today = new Date();

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
          {formatMonthTitle(year, month)}
        </h1>

        <nav className="flex items-center gap-2" aria-label="Navegación de meses">
          <Link
            to="/intranet"
            search={{ year: prev.year, month: prev.month }}
            aria-label="Mes anterior"
            className={navButtonClass}
          >
            <ChevronLeft className="size-4" />
          </Link>
          <Link to="/intranet" search={{}} className={todayButtonClass}>
            Hoy
          </Link>
          <Link
            to="/intranet"
            search={{ year: next.year, month: next.month }}
            aria-label="Mes siguiente"
            className={navButtonClass}
          >
            <ChevronRight className="size-4" />
          </Link>
        </nav>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <CalendarLegend />
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Sin reservas ni bloqueos este mes.
          </p>
        )}
      </div>

      <MonthCalendarGrid
        year={year}
        month={month}
        items={items}
        today={today}
      />
    </section>
  );
};

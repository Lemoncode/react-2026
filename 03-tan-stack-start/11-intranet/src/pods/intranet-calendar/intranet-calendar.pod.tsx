import { useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatMonthTitle,
  nextMonth,
  previousMonth,
} from "./calendar-grid.helpers";
import { CalendarCreateMenu } from "./components/calendar-create-menu.component";
import { CalendarItemDetail } from "./components/calendar-item-detail.component";
import { CalendarItemForm } from "./components/calendar-item-form.component";
import { CalendarLegend } from "./components/calendar-legend.component";
import { MonthCalendarGrid } from "./components/month-calendar-grid.component";
import type { CalendarItemVm } from "./intranet-calendar.vm";

interface IntranetCalendarProps {
  items: CalendarItemVm[];
  year: number;
  month: number;
  selectedId?: string;
  creating?: "booking" | "block";
}

const navButtonClass =
  "inline-flex size-9 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]";

const todayButtonClass =
  "inline-flex h-9 items-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 text-sm font-medium text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]";

export const IntranetCalendar = ({
  items,
  year,
  month,
  selectedId,
  creating,
}: IntranetCalendarProps) => {
  const navigate = useNavigate();
  const prev = previousMonth(year, month);
  const next = nextMonth(year, month);
  const today = new Date();
  const createRef = useRef<HTMLElement>(null);

  const selectedItem = selectedId
    ? items.find((item) => item.id === selectedId) ?? null
    : null;

  // Bring the create panel into view when it opens (mobile-friendly).
  useEffect(() => {
    if (creating) {
      createRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [creating]);

  // Selection and creation both live in the URL and are mutually exclusive.
  // resetScroll:false keeps the page from jumping — panels scroll themselves.
  const handleSelect = (id: string) => {
    navigate({
      to: "/intranet",
      search: (current) => ({
        year: current.year,
        month: current.month,
        selected: current.selected === id ? undefined : id,
      }),
      resetScroll: false,
    });
  };

  const handleClose = () => {
    navigate({
      to: "/intranet",
      search: (current) => ({ ...current, selected: undefined }),
      resetScroll: false,
    });
  };

  const handleCreate = (type: "booking" | "block") => {
    navigate({
      to: "/intranet",
      search: (current) => ({
        year: current.year,
        month: current.month,
        new: type,
      }),
      resetScroll: false,
    });
  };

  const handleCancelCreate = () => {
    navigate({
      to: "/intranet",
      search: (current) => ({ ...current, new: undefined }),
      resetScroll: false,
    });
  };

  // After creating, jump to the month where the new item lives and open it.
  const handleCreated = (created: CalendarItemVm) => {
    navigate({
      to: "/intranet",
      search: {
        year: created.startDate.getUTCFullYear(),
        month: created.startDate.getUTCMonth() + 1,
        selected: created.id,
      },
      resetScroll: false,
    });
  };

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
          {formatMonthTitle(year, month)}
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <nav
            className="flex items-center gap-2"
            aria-label="Navegación de meses"
          >
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

          <CalendarCreateMenu onCreate={handleCreate} />
        </div>
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
        selectedId={selectedId}
        onSelect={handleSelect}
      />

      {creating ? (
        <section
          ref={createRef}
          className="island-shell scroll-mt-6 rounded-2xl p-5 md:p-6"
        >
          <CalendarItemForm
            createType={creating}
            defaultMonth={{ year, month }}
            siblings={items}
            onCancel={handleCancelCreate}
            onSuccess={handleCreated}
          />
        </section>
      ) : (
        selectedItem && (
          <CalendarItemDetail
            item={selectedItem}
            items={items}
            onClose={handleClose}
          />
        )
      )}
    </section>
  );
};

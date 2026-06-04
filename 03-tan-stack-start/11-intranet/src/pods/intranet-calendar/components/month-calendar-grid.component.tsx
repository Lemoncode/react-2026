import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import {
  buildMonthWeeks,
  getWeekSegments,
  WEEKDAY_LABELS,
} from "../calendar-grid.helpers";
import { getItemAppearance } from "../calendar-item-appearance";
import { CalendarItemHoverCard } from "./calendar-item-hover-card.component";
import type { CalendarItemVm } from "../intranet-calendar.vm";

interface MonthCalendarGridProps {
  year: number;
  month: number;
  items: CalendarItemVm[];
  today: Date;
}

export const MonthCalendarGrid = ({
  year,
  month,
  items,
  today,
}: MonthCalendarGridProps) => {
  const weeks = buildMonthWeeks(year, month, today);

  return (
    <div className="island-shell overflow-hidden rounded-2xl">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-border/60 bg-[var(--chip-bg)]">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week) => {
        const segments = getWeekSegments(week, items);
        const laneCount = segments.reduce(
          (max, seg) => Math.max(max, seg.lane + 1),
          0,
        );

        return (
          <div
            key={week.days[0].date.toISOString()}
            className="relative border-b border-border/40 last:border-b-0"
          >
            {/* Day-number background grid */}
            <div className="grid grid-cols-7">
              {week.days.map((day) => (
                <div
                  key={day.date.toISOString()}
                  className={cn(
                    "min-h-24 border-r border-border/40 p-1.5 last:border-r-0",
                    !day.inCurrentMonth && "bg-muted/30",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-medium tabular-nums",
                      day.inCurrentMonth
                        ? "text-[var(--sea-ink)]"
                        : "text-muted-foreground/50",
                      day.isToday &&
                        "bg-[var(--lagoon-deep)] font-bold text-white",
                    )}
                  >
                    {day.date.getUTCDate()}
                  </span>
                </div>
              ))}
            </div>

            {/* Bars overlay aligned to the same 7 columns */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-1.5 top-9 grid grid-cols-7 gap-x-1 px-1"
              style={{
                gridTemplateRows: `repeat(${Math.max(laneCount, 1)}, 1.35rem)`,
                rowGap: "0.25rem",
              }}
            >
              {segments.map((seg) => {
                const appearance = getItemAppearance(seg.item);
                return (
                  <HoverCard
                    key={`${seg.item.id}-${seg.startCol}`}
                    openDelay={120}
                    closeDelay={80}
                  >
                    <HoverCardTrigger asChild>
                      <button
                        type="button"
                        aria-label={appearance.label}
                        className={cn(
                          "pointer-events-auto h-5 w-full cursor-default self-center overflow-hidden p-0 shadow-sm transition-[filter] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[var(--lagoon-deep)]/60 focus-visible:outline-none",
                          appearance.className,
                          seg.continuesLeft
                            ? "rounded-l-none"
                            : "rounded-l-full",
                          seg.continuesRight
                            ? "rounded-r-none"
                            : "rounded-r-full",
                        )}
                        style={{
                          ...appearance.style,
                          gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}`,
                          gridRow: seg.lane + 1,
                        }}
                      />
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <CalendarItemHoverCard item={seg.item} />
                    </HoverCardContent>
                  </HoverCard>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

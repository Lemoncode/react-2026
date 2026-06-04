import type { CalendarItemVm } from "./intranet-calendar.vm";

export const MS_PER_DAY = 86_400_000;

/**
 * All dates here are treated as UTC day-only values. The DB stores midnight-UTC
 * dates; rendering them in local time would shift days in the grid, so every
 * comparison normalises to UTC midnight first.
 */
export const toUtcDay = (date: Date): Date =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

export const addUtcDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * MS_PER_DAY);

export const isSameUtcDay = (a: Date, b: Date): boolean =>
  a.getTime() === b.getTime();

const diffInDays = (a: Date, b: Date): number =>
  Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);

/** Monday = 0 … Sunday = 6 (Spanish week starts on Monday). */
const mondayIndex = (date: Date): number => (date.getUTCDay() + 6) % 7;

export interface CalendarDay {
  date: Date; // UTC midnight
  inCurrentMonth: boolean;
  isToday: boolean;
}

export interface CalendarWeek {
  days: CalendarDay[]; // length 7, Monday → Sunday
}

/** Builds the month matrix (full weeks Mon→Sun) covering `month` (1-12). */
export const buildMonthWeeks = (
  year: number,
  month: number,
  today: Date,
): CalendarWeek[] => {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const leading = mondayIndex(firstOfMonth);
  const weekCount = Math.ceil((leading + daysInMonth) / 7);

  const gridStart = addUtcDays(firstOfMonth, -leading);
  const todayUtc = toUtcDay(today);

  const weeks: CalendarWeek[] = [];
  let cursor = gridStart;

  for (let w = 0; w < weekCount; w++) {
    const days: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      days.push({
        date: cursor,
        inCurrentMonth: cursor.getUTCMonth() === month - 1,
        isToday: isSameUtcDay(cursor, todayUtc),
      });
      cursor = addUtcDays(cursor, 1);
    }
    weeks.push({ days });
  }

  return weeks;
};

export interface BarSegment {
  item: CalendarItemVm;
  startCol: number; // 0-6, inclusive
  endCol: number; // 0-6, inclusive
  continuesLeft: boolean; // the item started before this week
  continuesRight: boolean; // the item continues after this week
  lane: number; // vertical row within the week (0-based)
}

/**
 * Produces the positioned, lane-packed bar segments for a single week.
 *
 * An item occupies the nights in `[startDate, endDate)` — the checkout day
 * (`endDate`) is NOT occupied. The last occupied night is therefore
 * `endDate - 1 day`, which is what we clip against the week.
 */
export const getWeekSegments = (
  week: CalendarWeek,
  items: CalendarItemVm[],
): BarSegment[] => {
  const weekStart = week.days[0].date;
  const weekEnd = week.days[6].date;

  const segments: Omit<BarSegment, "lane">[] = [];

  for (const item of items) {
    const start = toUtcDay(item.startDate);
    const lastNight = addUtcDays(toUtcDay(item.endDate), -1);

    // Defensive: ignore degenerate ranges (endDate <= startDate).
    if (lastNight < start) continue;

    const segStart = start > weekStart ? start : weekStart;
    const segEnd = lastNight < weekEnd ? lastNight : weekEnd;
    if (segStart > segEnd) continue; // no overlap with this week

    segments.push({
      item,
      startCol: diffInDays(segStart, weekStart),
      endCol: diffInDays(segEnd, weekStart),
      continuesLeft: start < weekStart,
      continuesRight: lastNight > weekEnd,
    });
  }

  return packLanes(segments);
};

/**
 * Greedy interval-packing: assigns each segment to the first lane whose last
 * segment ends before this one starts. With a single property and no cancelled
 * bookings, overlaps essentially never happen (one lane), but this keeps the
 * grid correct if they ever do.
 */
const packLanes = (segments: Omit<BarSegment, "lane">[]): BarSegment[] => {
  const ordered = [...segments].sort(
    (a, b) => a.startCol - b.startCol || a.endCol - b.endCol,
  );
  const laneEnds: number[] = []; // last endCol occupied per lane

  return ordered.map((seg) => {
    let lane = laneEnds.findIndex((end) => end < seg.startCol);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(seg.endCol);
    } else {
      laneEnds[lane] = seg.endCol;
    }
    return { ...seg, lane };
  });
};

/** Capitalised "junio de 2026" style label, computed in UTC. */
export const formatMonthTitle = (year: number, month: number): string => {
  const label = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const WEEKDAY_LABELS = [
  "Lun",
  "Mar",
  "Mié",
  "Jue",
  "Vie",
  "Sáb",
  "Dom",
] as const;

export interface MonthNav {
  year: number;
  month: number;
}

export const previousMonth = (year: number, month: number): MonthNav =>
  month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };

export const nextMonth = (year: number, month: number): MonthNav =>
  month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };

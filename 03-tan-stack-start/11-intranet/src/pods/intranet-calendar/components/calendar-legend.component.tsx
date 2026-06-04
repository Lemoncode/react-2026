import { LEGEND_ENTRIES } from "../calendar-item-appearance";

export const CalendarLegend = () => (
  <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
    {LEGEND_ENTRIES.map((entry) => (
      <li
        key={entry.key}
        className="flex items-center gap-1.5 text-xs text-[var(--sea-ink-soft)]"
      >
        <span
          className={`h-3 w-5 rounded-full ${entry.className}`}
          style={entry.style}
          aria-hidden
        />
        {entry.label}
      </li>
    ))}
  </ul>
);

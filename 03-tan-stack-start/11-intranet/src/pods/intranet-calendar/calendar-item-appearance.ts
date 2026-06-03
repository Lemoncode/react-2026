import type { CSSProperties } from "react";
import type { CalendarItemVm } from "./intranet-calendar.vm";

export interface ItemAppearance {
  /** Tailwind classes for the bar / legend swatch. */
  className: string;
  /** Inline styles for colours that come from design tokens or gradients. */
  style?: CSSProperties;
  /** Accessible label describing the item (used as aria-label, no visible text). */
  label: string;
}

const STRIPED_BLOCK_BG =
  "repeating-linear-gradient(45deg, rgba(100,116,139,0.55) 0, rgba(100,116,139,0.55) 5px, rgba(203,213,225,0.6) 5px, rgba(203,213,225,0.6) 10px)";

const SUBTYPE_LABELS: Record<string, string> = {
  owner_use: "Uso del propietario",
  maintenance: "Mantenimiento",
};

/** Human-readable reason for a block, or undefined if it has no subtype. */
export const getBlockReason = (subtype?: string): string | undefined =>
  subtype ? SUBTYPE_LABELS[subtype] ?? subtype : undefined;

const formatUtcDate = (date: Date): string =>
  new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);

const rangeLabel = (item: CalendarItemVm): string =>
  `${formatUtcDate(item.startDate)} → ${formatUtcDate(item.endDate)}`;

/**
 * Single source of truth for how each calendar item type/status looks.
 *
 * - confirmed booking → solid brand green (`--palm`)
 * - pending booking   → amber
 * - block             → neutral grey diagonal stripes ("no disponible")
 *
 * Bars are colour-only (no visible text); the `label` is exposed via aria-label.
 */
export const getItemAppearance = (item: CalendarItemVm): ItemAppearance => {
  if (item.type === "block") {
    const reason = getBlockReason(item.subtype);
    return {
      className: "border border-slate-400/70 text-slate-700",
      style: { backgroundImage: STRIPED_BLOCK_BG },
      label: `No disponible${reason ? ` · ${reason}` : ""} · ${rangeLabel(item)}`,
    };
  }

  if (item.status === "pending") {
    return {
      className: "border border-amber-500/50 bg-amber-400/90 text-amber-950",
      label: `Reserva pendiente · ${item.guest?.name ?? ""} · ${rangeLabel(item)}`,
    };
  }

  return {
    className: "border border-black/10 text-white",
    style: { backgroundColor: "var(--palm)" },
    label: `Reserva confirmada · ${item.guest?.name ?? ""} · ${rangeLabel(item)}`,
  };
};

export interface LegendEntry {
  key: string;
  label: string;
  className: string;
  style?: CSSProperties;
}

export const LEGEND_ENTRIES: LegendEntry[] = [
  {
    key: "confirmed",
    label: "Confirmada",
    className: "border border-black/10",
    style: { backgroundColor: "var(--palm)" },
  },
  {
    key: "pending",
    label: "Pendiente",
    className: "border border-amber-500/50 bg-amber-400/90",
  },
  {
    key: "block",
    label: "No disponible",
    className: "border border-slate-400/70",
    style: { backgroundImage: STRIPED_BLOCK_BG },
  },
];

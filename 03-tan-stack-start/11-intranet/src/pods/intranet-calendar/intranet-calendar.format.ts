import type { OccupancyVm } from "./intranet-calendar.vm";

const dayMonthFmt = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** "15 jul → 20 jul" (UTC, no local-time drift). */
export const formatDateRange = (start: Date, end: Date): string =>
  `${dayMonthFmt.format(start)} → ${dayMonthFmt.format(end)}`;

export const formatNights = (nights: number): string =>
  `${nights} ${nights === 1 ? "noche" : "noches"}`;

export const formatCurrency = (amount: number, currency: string): string =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const pluralize = (count: number, singular: string, plural: string): string =>
  `${count} ${count === 1 ? singular : plural}`;

/** "2 adultos · 1 niño · 1 mascota" — adults always shown, the rest only if > 0. */
export const formatOccupancy = (occupancy: OccupancyVm): string => {
  const parts = [pluralize(occupancy.adults, "adulto", "adultos")];
  if (occupancy.children > 0) {
    parts.push(pluralize(occupancy.children, "niño", "niños"));
  }
  if (occupancy.babies > 0) {
    parts.push(pluralize(occupancy.babies, "bebé", "bebés"));
  }
  if (occupancy.pets > 0) {
    parts.push(pluralize(occupancy.pets, "mascota", "mascotas"));
  }
  return parts.join(" · ");
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  pending: "Pendiente",
  cancelled: "Cancelada",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: "Pagada",
  pending: "Pago pendiente",
  refunded: "Reembolsada",
  failed: "Pago fallido",
};

export const getBookingStatusLabel = (status: string): string =>
  BOOKING_STATUS_LABELS[status] ?? status;

export const getPaymentStatusLabel = (status: string): string =>
  PAYMENT_STATUS_LABELS[status] ?? status;

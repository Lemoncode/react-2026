import type { CalendarItemFormValues } from "./intranet-calendar-form.schema";
import type { CalendarItemVm } from "./intranet-calendar.vm";

const MS_PER_DAY = 86_400_000;

const pad = (n: number): string => String(n).padStart(2, "0");

/** UTC midnight Date (from the DB) → "yyyy-mm-dd". */
export const isoFromUtc = (date: Date): string =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

/** "yyyy-mm-dd" → UTC midnight Date (for storing / day math). */
export const utcFromIso = (iso: string): Date => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

/** "yyyy-mm-dd" → local-midnight Date (for react-day-picker, which is local). */
export const localFromIso = (iso: string): Date => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Local Date (from react-day-picker) → "yyyy-mm-dd" using local getters. */
export const isoFromLocal = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Nights between two iso days (checkout exclusive). */
export const nightsBetween = (isoStart: string, isoEnd: string): number => {
  const diff = utcFromIso(isoEnd).getTime() - utcFromIso(isoStart).getTime();
  return Math.max(0, Math.round(diff / MS_PER_DAY));
};

export const computeSubtotal = (nightlyRate: number, nights: number): number =>
  nightlyRate * nights;

export const computeTotal = (
  subtotal: number,
  cleaningFee: number,
  touristTax: number,
  discount: number,
): number => subtotal + cleaningFee + touristTax - discount;

/** Builds form defaults from a VM, flattening nested booking/block fields. */
export const buildDefaultValues = (
  item: CalendarItemVm,
): CalendarItemFormValues => {
  const startDate = isoFromUtc(item.startDate);
  const endDate = isoFromUtc(item.endDate);

  if (item.type === "block") {
    const subtype =
      item.subtype === "owner_use" || item.subtype === "maintenance"
        ? item.subtype
        : "other";
    return {
      type: "block",
      startDate,
      endDate,
      subtype,
      notesInternal: item.notes?.internal ?? "",
    };
  }

  return {
    type: "booking",
    startDate,
    endDate,
    status: item.status,
    guestName: item.guest?.name ?? "",
    guestEmail: item.guest?.email ?? "",
    guestPhone: item.guest?.phone ?? "",
    adults: item.occupancy?.adults ?? 1,
    children: item.occupancy?.children ?? 0,
    babies: item.occupancy?.babies ?? 0,
    pets: item.occupancy?.pets ?? 0,
    nightlyRate: item.price?.nightlyRate ?? 0,
    cleaningFee: item.price?.cleaningFee ?? 0,
    touristTax: item.price?.touristTax ?? 0,
    discount: item.price?.discount ?? 0,
  };
};

/** Empty form defaults for a new booking/block (create flow). */
export const buildEmptyValues = (
  type: "booking" | "block",
): CalendarItemFormValues => {
  if (type === "block") {
    return {
      type: "block",
      startDate: "",
      endDate: "",
      subtype: "owner_use",
      notesInternal: "",
    };
  }

  return {
    type: "booking",
    startDate: "",
    endDate: "",
    status: "confirmed",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    adults: 1,
    children: 0,
    babies: 0,
    pets: 0,
    nightlyRate: 0,
    cleaningFee: 0,
    touristTax: 0,
    discount: 0,
  };
};

/**
 * True if the proposed range overlaps another calendar item (excluding the one
 * being edited). Half-open night ranges: [start, end). Used for early client
 * feedback; the server function is the authoritative check.
 */
export const overlapsOtherItem = (
  items: CalendarItemVm[],
  values: CalendarItemFormValues,
  selfId: string,
): boolean => {
  const start = utcFromIso(values.startDate).getTime();
  const end = utcFromIso(values.endDate).getTime();
  return items.some((item) => {
    if (item.id === selfId) return false;
    const itemStart = item.startDate.getTime();
    const itemEnd = item.endDate.getTime();
    return start < itemEnd && end > itemStart;
  });
};

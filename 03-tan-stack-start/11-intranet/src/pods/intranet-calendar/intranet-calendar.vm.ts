export type CalendarItemType = "booking" | "block";

/** A booking can be cancelled in the DB, but the intranet calendar never shows
 *  cancelled ones in step 1 — they are filtered out at query time. */
export type CalendarItemStatus = "pending" | "confirmed" | "cancelled";

export interface GuestVm {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface OccupancyVm {
  adults: number;
  children: number;
  babies: number;
  pets: number;
}

export interface PriceVm {
  nightlyRate: number;
  cleaningFee: number;
  touristTax: number;
  discount: number;
  subtotal: number;
  total: number;
  currency: string;
}

export interface PaymentVm {
  status: string;
  method: string;
  transactionId: string;
  paidAmount: number;
  paidAt: Date | null;
}

/**
 * Full detail of a calendar item (booking or block). The server function that
 * produces this is auth-protected, so it is safe to expose guest/price/payment
 * data here; future steps (tooltip, detail panel, edit) reuse this VM without
 * touching the backend again.
 *
 * Fields specific to a booking (`guest`, `occupancy`, `price`, `payment`) are
 * absent on a `block`; `subtype`/`notes` are typically only present on a block.
 */
export interface CalendarItemVm {
  id: string;
  type: CalendarItemType;
  status: CalendarItemStatus;
  startDate: Date;
  endDate: Date;
  nights: number;

  // booking-only
  guest?: GuestVm;
  occupancy?: OccupancyVm;
  price?: PriceVm;
  payment?: PaymentVm;

  // block-only
  subtype?: string;
  notes?: { internal?: string };
}

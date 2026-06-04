import type { Document, WithId } from "mongodb";
import type { CalendarItemVm, PaymentVm } from "./intranet-calendar.vm";

const mapPayment = (payment: Document | undefined): PaymentVm | undefined => {
  if (!payment) return undefined;
  return {
    status: payment.status,
    method: payment.method,
    transactionId: payment.transactionId,
    paidAmount: payment.paidAmount,
    paidAt: payment.paidAt ?? null,
  };
};

/**
 * Maps a raw `calendarBlocks` document to the rich calendar VM, keeping
 * booking-only and block-only fields conditional on the document type.
 */
export const mapToCalendarItemVm = (doc: WithId<Document>): CalendarItemVm => {
  const base: CalendarItemVm = {
    id: doc._id.toString(),
    type: doc.type,
    status: doc.status,
    startDate: doc.startDate,
    endDate: doc.endDate,
    nights: doc.nights,
  };

  if (doc.type === "block") {
    return {
      ...base,
      subtype: doc.subtype,
      notes: doc.notes,
    };
  }

  return {
    ...base,
    guest: doc.guest,
    occupancy: doc.occupancy,
    price: doc.price,
    payment: mapPayment(doc.payment),
  };
};

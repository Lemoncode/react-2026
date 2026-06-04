import type { WithId, Document } from "mongodb";
import type { CalendarBlockVm } from "./availability.vm";

export const mapToCalendarBlockVm = (doc: WithId<Document>): CalendarBlockVm => ({
  id: doc._id.toString(),
  type: doc.type,
  status: doc.status,
  startDate: doc.startDate,
  endDate: doc.endDate,
  nights: doc.nights,
});

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { authMiddleware } from "@/core/auth-middleware";
import { mapToCalendarItemVm } from "./intranet-calendar.mapper";
import type { CalendarItemVm } from "./intranet-calendar.vm";

const PROPERTY_ID = "villa_001";
const MS_PER_DAY = 86_400_000;

const inputSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
});

/**
 * Owner-only calendar feed for a month.
 *
 * Protected by `authMiddleware`: calling this endpoint without a valid session
 * returns 401, so guest/price/payment data can never be scraped directly.
 *
 * Returns bookings (`confirmed` / `pending`) and blocks (`type: block`) that
 * overlap the visible month grid. Cancelled bookings are intentionally
 * excluded. The query window is widened by a week on each side so that items
 * touching the leading/trailing days of adjacent months (visible in the grid)
 * are also returned.
 */
export const getBookingsByMonth = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<CalendarItemVm[]> => {
    const { year, month } = data;

    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 1));
    const windowStart = new Date(monthStart.getTime() - 7 * MS_PER_DAY);
    const windowEnd = new Date(monthEnd.getTime() + 7 * MS_PER_DAY);

    const db = await getDb();
    const docs = await db
      .collection("calendarBlocks")
      .find({
        propertyId: PROPERTY_ID,
        startDate: { $lt: windowEnd },
        endDate: { $gt: windowStart },
        $or: [
          { type: "booking", status: { $in: ["confirmed", "pending"] } },
          { type: "block" },
        ],
      })
      .sort({ startDate: 1 })
      .toArray();

    return docs.map(mapToCalendarItemVm);
  });

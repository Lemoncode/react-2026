import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { mapToCalendarBlockVm } from "./availability.mapper";
import type { CalendarBlockVm } from "./availability.vm";

const PROPERTY_ID = "villa_001";

const inputSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

export const getAvailabilityByMonth = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<CalendarBlockVm[]> => {
    const { month, year } = data;
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 1));

    const db = await getDb();
    const docs = await db
      .collection("calendarBlocks")
      .find({
        propertyId: PROPERTY_ID,
        status: { $in: ["confirmed", "pending"] },
        startDate: { $lt: monthEnd },
        endDate: { $gt: monthStart },
      })
      .sort({ startDate: 1 })
      .toArray();

    return docs.map(mapToCalendarBlockVm);
  });

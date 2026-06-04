import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { authMiddleware } from "@/core/auth-middleware";
import { mapToCalendarItemVm } from "./intranet-calendar.mapper";
import { calendarItemFormSchema } from "./intranet-calendar-form.schema";
import {
  computeSubtotal,
  computeTotal,
  nightsBetween,
  utcFromIso,
} from "./intranet-calendar-form.helpers";
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

const updateInputSchema = z.object({
  id: z.string().min(1),
  values: calendarItemFormSchema,
});

/**
 * Updates a booking/block. Protected by `authMiddleware`. Recomputes derived
 * fields server-side (nights/subtotal/total — never trusts the client) and
 * rejects ranges that overlap another active item (excluding itself, any
 * month). Preserves `payment` and the guest id; `cancelled` stamps `cancelledAt`.
 */
export const updateCalendarItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((data: unknown) => updateInputSchema.parse(data))
  .handler(async ({ data }): Promise<CalendarItemVm> => {
    const { id, values } = data;
    const _id = new ObjectId(id);
    const db = await getDb();
    const collection = db.collection("calendarBlocks");

    const existing = await collection.findOne({ _id, propertyId: PROPERTY_ID });
    if (!existing) {
      throw new Error("No se encontró la reserva o bloqueo.");
    }

    const startDate = utcFromIso(values.startDate);
    const endDate = utcFromIso(values.endDate);
    const nights = nightsBetween(values.startDate, values.endDate);

    const conflict = await collection.findOne({
      propertyId: PROPERTY_ID,
      _id: { $ne: _id },
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
      $or: [
        { type: "booking", status: { $in: ["confirmed", "pending"] } },
        { type: "block" },
      ],
    });
    if (conflict) {
      throw new Error("Las fechas se solapan con otra reserva o bloqueo.");
    }

    const now = new Date();

    if (values.type === "block") {
      await collection.updateOne(
        { _id, propertyId: PROPERTY_ID },
        {
          $set: {
            type: "block",
            subtype: values.subtype,
            startDate,
            endDate,
            nights,
            notes: { internal: values.notesInternal ?? "" },
            updatedAt: now,
          },
        },
      );
    } else {
      const subtotal = computeSubtotal(values.nightlyRate, nights);
      const total = computeTotal(
        subtotal,
        values.cleaningFee,
        values.touristTax,
        values.discount,
      );
      const set: Record<string, unknown> = {
        type: "booking",
        status: values.status,
        startDate,
        endDate,
        nights,
        guest: {
          id: existing.guest?.id ?? `guest_${_id.toString()}`,
          name: values.guestName,
          email: values.guestEmail,
          phone: values.guestPhone,
        },
        occupancy: {
          adults: values.adults,
          children: values.children,
          babies: values.babies,
          pets: values.pets,
        },
        price: {
          nightlyRate: values.nightlyRate,
          cleaningFee: values.cleaningFee,
          touristTax: values.touristTax,
          discount: values.discount,
          subtotal,
          total,
          currency: existing.price?.currency ?? "EUR",
        },
        updatedAt: now,
      };
      if (values.status === "cancelled") {
        set.cancelledAt = now;
      }
      await collection.updateOne(
        { _id, propertyId: PROPERTY_ID },
        { $set: set },
      );
    }

    const updated = await collection.findOne({ _id });
    if (!updated) {
      throw new Error("No se pudo recuperar el elemento actualizado.");
    }
    return mapToCalendarItemVm(updated);
  });

const deleteInputSchema = z.object({ id: z.string().min(1) });

/** Deletes a booking/block by id. Protected by `authMiddleware`. */
export const deleteCalendarItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((data: unknown) => deleteInputSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const _id = new ObjectId(data.id);
    const db = await getDb();
    const result = await db
      .collection("calendarBlocks")
      .deleteOne({ _id, propertyId: PROPERTY_ID });
    if (result.deletedCount === 0) {
      throw new Error("No se encontró el elemento a eliminar.");
    }
    return { ok: true };
  });

import { z } from "zod";
import type { SelectFieldOption } from "@/components/form";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const isoDate = z
  .string()
  .trim()
  .regex(ISO_DATE, "La fecha es obligatoria");

export const BOOKING_STATUS_OPTIONS: SelectFieldOption[] = [
  { value: "confirmed", label: "Confirmada" },
  { value: "pending", label: "Pendiente" },
  { value: "cancelled", label: "Cancelada" },
];

export const BLOCK_SUBTYPE_OPTIONS: SelectFieldOption[] = [
  { value: "owner_use", label: "Uso del propietario" },
  { value: "maintenance", label: "Mantenimiento" },
  { value: "other", label: "Otro" },
];

const bookingObject = z.object({
  type: z.literal("booking"),
  startDate: isoDate,
  endDate: isoDate,
  status: z.enum(["confirmed", "pending", "cancelled"]),
  guestName: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  guestEmail: z.email("Introduce un email válido"),
  guestPhone: z
    .string()
    .trim()
    .min(1, "El teléfono es obligatorio")
    .min(7, "El teléfono es demasiado corto"),
  adults: z
    .number({ error: "Indica el número de adultos" })
    .int("Debe ser un número entero")
    .min(1, "Debe haber al menos 1 adulto"),
  children: z.number().int("Debe ser un número entero").min(0, "No puede ser negativo"),
  babies: z.number().int("Debe ser un número entero").min(0, "No puede ser negativo"),
  pets: z.number().int("Debe ser un número entero").min(0, "No puede ser negativo"),
  nightlyRate: z
    .number({ error: "Indica la tarifa por noche" })
    .min(0, "No puede ser negativa"),
  cleaningFee: z.number().min(0, "No puede ser negativa"),
  touristTax: z.number().min(0, "No puede ser negativa"),
  discount: z.number().min(0, "No puede ser negativo"),
});

const blockObject = z.object({
  type: z.literal("block"),
  startDate: isoDate,
  endDate: isoDate,
  subtype: z.enum(["owner_use", "maintenance", "other"]),
  notesInternal: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres")
    .optional(),
});

/**
 * Discriminated union by `type` — this is where the diverging "required fields"
 * for a booking vs a block live. The cross-field rule (checkout after entry) is
 * applied at the union level via `.refine` (lexicographic compare is valid for
 * `yyyy-mm-dd`).
 */
export const calendarItemFormSchema = z
  .discriminatedUnion("type", [bookingObject, blockObject])
  .refine((value) => value.endDate > value.startDate, {
    path: ["endDate"],
    message: "La salida debe ser posterior a la entrada",
  });

export type CalendarItemFormValues = z.infer<typeof calendarItemFormSchema>;
export type BookingFormValues = z.infer<typeof bookingObject>;
export type BlockFormValues = z.infer<typeof blockObject>;

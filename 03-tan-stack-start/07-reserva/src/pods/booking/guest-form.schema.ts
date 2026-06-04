import { z } from "zod";

/** Validación completa del formulario de huésped. */
export const guestFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z
    .string()
    .trim()
    .min(1, "El apellido es obligatorio")
    .min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.email("Introduce un email válido"),
  phone: z
    .string()
    .trim()
    .min(1, "El teléfono es obligatorio")
    .min(7, "El teléfono es demasiado corto"),
  guests: z
    .number({ error: "Indica el número de huéspedes" })
    .int("Debe ser un número entero")
    .min(1, "Debe haber al menos 1 huésped"),
  comments: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres")
    .optional(),
});

export type GuestFormValues = z.infer<typeof guestFormSchema>;

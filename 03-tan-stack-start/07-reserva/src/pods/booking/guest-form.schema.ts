import { z } from "zod";

/**
 * Validación del formulario de huésped. De momento solo el nombre; el resto de
 * campos se añadirá en un segundo paso.
 */
export const guestFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
});

export type GuestFormValues = z.infer<typeof guestFormSchema>;

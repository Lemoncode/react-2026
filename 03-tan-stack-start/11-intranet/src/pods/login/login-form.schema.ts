import { z } from "zod";

/** Validación del formulario de login del propietario. */
export const loginFormSchema = z.object({
  email: z.email("Introduce un email válido"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

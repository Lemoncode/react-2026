import type { GuestFormValues } from "./guest-form.schema";

/** Datos del huésped — fuente de verdad: el schema Zod del formulario. */
export type GuestDetails = GuestFormValues;

export interface BookingRequest {
  dates: {
    from: string; // ISO YYYY-MM-DD
    to: string; // ISO YYYY-MM-DD
    nights: number;
  };
  guest: GuestDetails;
}

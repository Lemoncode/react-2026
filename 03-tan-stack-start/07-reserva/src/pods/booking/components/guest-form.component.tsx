import { Button } from "@/components/ui/button";
import type { GuestDetails } from "../booking.model";

interface GuestFormProps {
  onSubmit: (guest: GuestDetails) => void;
}

interface FieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
}

const Field = ({ id, label, children }: FieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={id}
      className="text-sm font-medium text-[var(--sea-ink)]"
    >
      {label}
    </label>
    {children}
  </div>
);

const fieldClassName =
  "h-12 w-full rounded-2xl border border-[var(--sand)] bg-[var(--card)] px-4 text-base text-[var(--sea-ink)] outline-none transition-colors placeholder:text-[var(--sea-ink-soft)]/60 focus-visible:border-[var(--lagoon-deep)] focus-visible:ring-2 focus-visible:ring-[var(--lagoon-deep)]/20";

export const GuestForm = ({ onSubmit }: GuestFormProps) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({
      firstName: String(data.get("firstName") ?? "").trim(),
      lastName: String(data.get("lastName") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      guests: Number(data.get("guests") ?? 1),
      comments: String(data.get("comments") ?? "").trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="firstName" label="Nombre">
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="María"
            className={fieldClassName}
          />
        </Field>
        <Field id="lastName" label="Apellido">
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="García"
            className={fieldClassName}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="email" label="Email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="maria@ejemplo.com"
            className={fieldClassName}
          />
        </Field>
        <Field id="phone" label="Teléfono">
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+34 600 000 000"
            className={fieldClassName}
          />
        </Field>
      </div>

      <Field id="guests" label="Número de huéspedes">
        <input
          id="guests"
          name="guests"
          type="number"
          min={1}
          defaultValue={1}
          className={`${fieldClassName} sm:max-w-[10rem]`}
        />
      </Field>

      <Field id="comments" label="Comentarios adicionales">
        <textarea
          id="comments"
          name="comments"
          rows={4}
          placeholder="¿Algo que debamos saber? Llegada tardía, niños, alergias…"
          className={`${fieldClassName} h-auto resize-y py-3 leading-7`}
        />
      </Field>

      <Button
        type="submit"
        className="mt-1 h-12 w-full rounded-2xl bg-[var(--lagoon-deep)] text-base font-semibold text-white hover:bg-[#246f76]"
      >
        Solicitar reserva
      </Button>
    </form>
  );
};

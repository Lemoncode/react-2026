import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { TextField, NumberField, TextareaField } from "@/components/form";
import { useToast } from "@/components/ui/toast";
import { guestFormSchema, type GuestFormValues } from "../guest-form.schema";

interface GuestFormProps {
  onSubmit: (guest: GuestFormValues) => void;
}

export const GuestForm = ({ onSubmit }: GuestFormProps) => {
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      guests: 1,
      comments: "",
    } as GuestFormValues,
    validators: { onChange: guestFormSchema, onBlur: guestFormSchema },
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
    onSubmitInvalid: () => {
      toast({
        variant: "error",
        title: "Revisa el formulario",
        description: "Hay errores en el formulario. Revisa los campos.",
      });
    },
  });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          form={form}
          name="firstName"
          label="Nombre"
          type="text"
          autoComplete="given-name"
          placeholder="María"
        />
        <TextField
          form={form}
          name="lastName"
          label="Apellido"
          type="text"
          autoComplete="family-name"
          placeholder="García"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          form={form}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="maria@ejemplo.com"
        />
        <TextField
          form={form}
          name="phone"
          label="Teléfono"
          type="tel"
          autoComplete="tel"
          placeholder="+34 600 000 000"
        />
      </div>

      <NumberField
        form={form}
        name="guests"
        label="Número de huéspedes"
        min={1}
        className="sm:max-w-[10rem]"
      />

      <TextareaField
        form={form}
        name="comments"
        label="Comentarios adicionales"
        rows={4}
        maxLength={500}
        placeholder="¿Algo que debamos saber? Llegada tardía, niños, alergias…"
      />

      <Button
        type="submit"
        className="mt-1 h-12 w-full rounded-2xl bg-[var(--lagoon-deep)] text-base font-semibold text-white hover:bg-[#246f76]"
      >
        Solicitar reserva
      </Button>
    </form>
  );
};

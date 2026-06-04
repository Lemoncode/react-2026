import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { TextField, PasswordField } from "@/components/form";
import { useToast } from "@/components/ui/toast";
import { loginFormSchema, type LoginFormValues } from "../login-form.schema";

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
}

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    } as LoginFormValues,
    validators: { onChange: loginFormSchema, onBlur: loginFormSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
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
      <TextField
        form={form}
        name="email"
        label="Email"
        type="email"
        autoComplete="username"
        inputMode="email"
        placeholder="propietario@ejemplo.com"
      />

      <PasswordField
        form={form}
        name="password"
        label="Contraseña"
        autoComplete="current-password"
        placeholder="Tu contraseña"
      />

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 h-12 w-full rounded-2xl bg-[var(--lagoon-deep)] text-base font-semibold text-white hover:bg-[#246f76] disabled:opacity-60"
          >
            {isSubmitting ? "Entrando…" : "Entrar"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};

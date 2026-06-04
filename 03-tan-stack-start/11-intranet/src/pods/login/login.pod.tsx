import { LoginForm } from "./components/login-form.component";
import type { LoginFormValues } from "./login-form.schema";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { useToast } from "@/components/ui/toast";

export const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (_values: LoginFormValues) => {
    try {
      const result = await authClient.signIn.email({
        email: _values.email,
        password: _values.password,
      });

      if (result.error) {
        toast({
          variant: "error",
          title: "No se pudo iniciar sesión",
          description:
            result.error.message ?? "Revisa tu email y contraseña.",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Sesión iniciada",
        description: "Bienvenido de nuevo.",
      });
      navigate({ to: "/intranet" });
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        variant: "error",
        title: "No se pudo iniciar sesión",
        description: "Ha ocurrido un error. Inténtalo de nuevo en unos minutos.",
      });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="island-shell rounded-[2rem] p-7 sm:p-9">
          <p className="island-kicker mb-2">Acceso propietario</p>
          <h1 className="display-title mb-2 text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
            Entra a tu panel
          </h1>
          <p className="m-0 mb-7 text-base leading-7 text-[var(--sea-ink-soft)]">
            Introduce tus credenciales para gestionar tu villa.
          </p>
          <LoginForm onSubmit={handleSubmit} />
        </div>
      </div>
    </main>
  );
};

import { LoginForm } from "./components/login-form.component";
import type { LoginFormValues } from "./login-form.schema";

export const Login = () => {
  const handleSubmit = async (_values: LoginFormValues) => {
    // TODO(better-auth): conectar aquí el signIn con email/contraseña.
    // De momento no hace nada: solo mostramos el formulario.
    console.log("[login] submit placeholder — pendiente de cablear better-auth");
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

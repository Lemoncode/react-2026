import { useId, useState } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

export interface PasswordFieldClassNames {
  root?: string;
  label?: string;
  input?: string;
  inputError?: string;
  toggle?: string;
  error?: string;
}

export interface PasswordFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    | "value"
    | "onChange"
    | "onBlur"
    | "name"
    | "id"
    | "type"
    | "form"
    | "aria-invalid"
    | "aria-describedby"
  > {
  /** TanStack Form instance — uses `form.Field` under the hood. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  name: string;
  label: string;
  id?: string;
  classNames?: PasswordFieldClassNames;
}

const DEFAULT_CLASS_NAMES: Required<PasswordFieldClassNames> = {
  root: "flex flex-col gap-1.5",
  label: "text-sm font-medium text-[var(--sea-ink)]",
  input:
    "h-12 w-full rounded-2xl border border-[var(--sand)] bg-[var(--card)] pl-4 pr-12 text-base text-[var(--sea-ink)] outline-none transition-colors placeholder:text-[var(--sea-ink-soft)]/60 focus-visible:border-[var(--lagoon-deep)] focus-visible:ring-2 focus-visible:ring-[var(--lagoon-deep)]/20",
  inputError:
    "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
  toggle:
    "absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-2xl text-[var(--sea-ink-soft)] outline-none transition-colors hover:text-[var(--sea-ink)] focus-visible:text-[var(--lagoon-deep)] focus-visible:ring-2 focus-visible:ring-[var(--lagoon-deep)]/20",
  error: "text-sm font-medium text-destructive",
};

/**
 * Password input wired to a TanStack Form field, con botón de mostrar/ocultar
 * (Eye / EyeOff). Mismo contrato que `TextField`: los errores aparecen tras
 * blur/touched (o submit) y se limpian en vivo al corregir. Totalmente
 * etiquetado y con `aria-*`.
 */
export const PasswordField = ({
  form,
  name,
  label,
  id,
  classNames,
  className,
  ...inputProps
}: PasswordFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const [visible, setVisible] = useState(false);
  const styles = { ...DEFAULT_CLASS_NAMES, ...classNames };

  return (
    <form.Field name={name}>
      {(field: AnyFieldApi) => {
        const showError =
          (field.state.meta.isBlurred || field.state.meta.isTouched) &&
          field.state.meta.errors.length > 0;
        const errorMessage = showError
          ? String(
              field.state.meta.errors[0]?.message ??
                field.state.meta.errors[0],
            )
          : null;

        return (
          <div className={styles.root}>
            <label htmlFor={inputId} className={styles.label}>
              {label}
            </label>
            <div className="relative">
              <input
                {...inputProps}
                id={inputId}
                name={name}
                type={visible ? "text" : "password"}
                value={field.state.value ?? ""}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={showError || undefined}
                aria-describedby={showError ? errorId : undefined}
                className={cn(
                  styles.input,
                  showError && styles.inputError,
                  className,
                )}
              />
              <button
                type="button"
                onClick={() => setVisible((prev) => !prev)}
                aria-label={
                  visible ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                aria-pressed={visible}
                className={styles.toggle}
                tabIndex={-1}
              >
                {visible ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errorMessage && (
              <p id={errorId} role="alert" className={styles.error}>
                {errorMessage}
              </p>
            )}
          </div>
        );
      }}
    </form.Field>
  );
};

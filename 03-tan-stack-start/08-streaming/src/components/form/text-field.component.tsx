import { useId } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";

import { cn } from "@/lib/utils";

export interface TextFieldClassNames {
  root?: string;
  label?: string;
  input?: string;
  inputError?: string;
  error?: string;
}

export interface TextFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    | "value"
    | "onChange"
    | "onBlur"
    | "name"
    | "id"
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
  classNames?: TextFieldClassNames;
}

const DEFAULT_CLASS_NAMES: Required<TextFieldClassNames> = {
  root: "flex flex-col gap-1.5",
  label: "text-sm font-medium text-[var(--sea-ink)]",
  input:
    "h-12 w-full rounded-2xl border border-[var(--sand)] bg-[var(--card)] px-4 text-base text-[var(--sea-ink)] outline-none transition-colors placeholder:text-[var(--sea-ink-soft)]/60 focus-visible:border-[var(--lagoon-deep)] focus-visible:ring-2 focus-visible:ring-[var(--lagoon-deep)]/20",
  inputError:
    "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
  error: "text-sm font-medium text-destructive",
};

/**
 * Reusable text input wired to a TanStack Form field. Errors only surface once
 * the field has been blurred/touched (or a submit was attempted) and clear
 * live as the value becomes valid. Fully labelled and `aria-*` wired.
 */
export const TextField = ({
  form,
  name,
  label,
  id,
  classNames,
  className,
  ...inputProps
}: TextFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
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
            <input
              {...inputProps}
              id={inputId}
              name={name}
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

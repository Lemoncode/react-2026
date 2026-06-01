import { useId } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";

import { cn } from "@/lib/utils";

export interface NumberFieldClassNames {
  root?: string;
  label?: string;
  input?: string;
  inputError?: string;
  error?: string;
}

export interface NumberFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    | "value"
    | "onChange"
    | "onBlur"
    | "name"
    | "id"
    | "form"
    | "type"
    | "aria-invalid"
    | "aria-describedby"
  > {
  /** TanStack Form instance — uses `form.Field` under the hood. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  name: string;
  label: string;
  id?: string;
  classNames?: NumberFieldClassNames;
}

const DEFAULT_CLASS_NAMES: Required<NumberFieldClassNames> = {
  root: "flex flex-col gap-1.5",
  label: "text-sm font-medium text-[var(--sea-ink)]",
  input:
    "h-12 w-full rounded-2xl border border-[var(--sand)] bg-[var(--card)] px-4 text-base text-[var(--sea-ink)] outline-none transition-colors placeholder:text-[var(--sea-ink-soft)]/60 focus-visible:border-[var(--lagoon-deep)] focus-visible:ring-2 focus-visible:ring-[var(--lagoon-deep)]/20",
  inputError:
    "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
  error: "text-sm font-medium text-destructive",
};

/**
 * Numeric input wired to a TanStack Form field. Delivers a real `number` to the
 * form (`NaN` when emptied, so the schema can flag it). Same error/a11y rules as
 * `TextField`: errors surface after blur/submit and clear live on correction.
 */
export const NumberField = ({
  form,
  name,
  label,
  id,
  classNames,
  className,
  ...inputProps
}: NumberFieldProps) => {
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
        const value = field.state.value;

        return (
          <div className={styles.root}>
            <label htmlFor={inputId} className={styles.label}>
              {label}
            </label>
            <input
              {...inputProps}
              id={inputId}
              name={name}
              type="number"
              value={Number.isNaN(value) || value == null ? "" : value}
              onChange={(event) =>
                field.handleChange(event.target.valueAsNumber)
              }
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

import { useId } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";

import { cn } from "@/lib/utils";

export interface TextareaFieldClassNames {
  root?: string;
  label?: string;
  textarea?: string;
  textareaError?: string;
  error?: string;
}

export interface TextareaFieldProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
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
  classNames?: TextareaFieldClassNames;
}

const DEFAULT_CLASS_NAMES: Required<TextareaFieldClassNames> = {
  root: "flex flex-col gap-1.5",
  label: "text-sm font-medium text-[var(--sea-ink)]",
  textarea:
    "w-full resize-y rounded-2xl border border-[var(--sand)] bg-[var(--card)] px-4 py-3 text-base leading-7 text-[var(--sea-ink)] outline-none transition-colors placeholder:text-[var(--sea-ink-soft)]/60 focus-visible:border-[var(--lagoon-deep)] focus-visible:ring-2 focus-visible:ring-[var(--lagoon-deep)]/20",
  textareaError:
    "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
  error: "text-sm font-medium text-destructive",
};

/**
 * Multiline text input wired to a TanStack Form field. Same error/a11y rules as
 * `TextField`: errors surface after blur/submit and clear live on correction.
 */
export const TextareaField = ({
  form,
  name,
  label,
  id,
  classNames,
  className,
  ...textareaProps
}: TextareaFieldProps) => {
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
            <textarea
              {...textareaProps}
              id={inputId}
              name={name}
              value={field.state.value ?? ""}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={showError || undefined}
              aria-describedby={showError ? errorId : undefined}
              className={cn(
                styles.textarea,
                showError && styles.textareaError,
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

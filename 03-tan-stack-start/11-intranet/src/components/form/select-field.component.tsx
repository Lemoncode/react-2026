import { useId } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldClassNames {
  root?: string;
  label?: string;
  trigger?: string;
  triggerError?: string;
  error?: string;
}

export interface SelectFieldProps {
  /** TanStack Form instance — uses `form.Field` under the hood. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  name: string;
  label: string;
  options: SelectFieldOption[];
  id?: string;
  placeholder?: string;
  classNames?: SelectFieldClassNames;
}

const DEFAULT_CLASS_NAMES: Required<SelectFieldClassNames> = {
  root: "flex flex-col gap-1.5",
  label: "text-sm font-medium text-[var(--sea-ink)]",
  trigger: "",
  triggerError:
    "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
  error: "text-sm font-medium text-destructive",
};

/**
 * Select wired to a TanStack Form field. Same error/a11y rules as `TextField`:
 * errors surface after blur/submit and clear live on correction.
 */
export const SelectField = ({
  form,
  name,
  label,
  options,
  id,
  placeholder,
  classNames,
}: SelectFieldProps) => {
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
            <Select
              value={field.state.value ?? undefined}
              onValueChange={(value) => field.handleChange(value)}
            >
              <SelectTrigger
                id={inputId}
                onBlur={field.handleBlur}
                aria-invalid={showError || undefined}
                aria-describedby={showError ? errorId : undefined}
                className={cn(styles.trigger, showError && styles.triggerError)}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

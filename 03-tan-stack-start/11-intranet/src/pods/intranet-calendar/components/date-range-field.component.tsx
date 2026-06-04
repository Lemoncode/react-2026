import type { DateRange } from "react-day-picker";
import { es } from "date-fns/locale";

import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { isoFromLocal, localFromIso } from "../intranet-calendar-form.helpers";

interface DateRangeFieldProps {
  /** TanStack Form instance — operates on two field names (start/end). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  startName: string;
  endName: string;
  label: string;
}

/**
 * Range picker wired to two TanStack Form fields (iso `yyyy-mm-dd` strings).
 * Uses the ShadCN calendar in range mode (no min-nights). Errors surface after
 * a selection/submit and clear live, matching the other form wrappers.
 */
export const DateRangeField = ({
  form,
  startName,
  endName,
  label,
}: DateRangeFieldProps) => (
  <form.Subscribe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selector={(state: any) => ({
      start: state.values[startName] as string,
      end: state.values[endName] as string,
      startMeta: state.fieldMeta[startName],
      endMeta: state.fieldMeta[endName],
      submitted: state.submissionAttempts > 0,
    })}
  >
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    {({ start, end, startMeta, endMeta, submitted }: any) => {
      const touched =
        submitted ||
        startMeta?.isTouched ||
        startMeta?.isBlurred ||
        endMeta?.isTouched ||
        endMeta?.isBlurred;
      const errors = [
        ...(endMeta?.errors ?? []),
        ...(startMeta?.errors ?? []),
      ];
      const showError = Boolean(touched) && errors.length > 0;
      const errorMessage = showError
        ? String(errors[0]?.message ?? errors[0])
        : null;

      const selected: DateRange | undefined = start
        ? {
            from: localFromIso(start),
            to: end ? localFromIso(end) : undefined,
          }
        : undefined;

      const handleSelect = (range: DateRange | undefined) => {
        form.setFieldValue(
          startName,
          range?.from ? isoFromLocal(range.from) : "",
        );
        form.setFieldValue(endName, range?.to ? isoFromLocal(range.to) : "");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.setFieldMeta(startName, (m: any) => ({ ...m, isTouched: true }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.setFieldMeta(endName, (m: any) => ({ ...m, isTouched: true }));
      };

      return (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--sea-ink)]">
            {label}
          </span>
          <div
            className={cn(
              "flex justify-center rounded-2xl border border-[var(--sand)] bg-[var(--card)] p-1.5",
              showError && "border-destructive",
            )}
          >
            <Calendar
              mode="range"
              selected={selected}
              onSelect={handleSelect}
              locale={es}
              numberOfMonths={1}
              className="bg-transparent"
            />
          </div>
          {errorMessage && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {errorMessage}
            </p>
          )}
        </div>
      );
    }}
  </form.Subscribe>
);

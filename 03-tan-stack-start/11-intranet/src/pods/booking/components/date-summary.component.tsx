import { CalendarDays, Pencil } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
  DateRangePicker,
  formatRangeLabel,
  getRangeValidity,
} from "@/components/date-range-picker";
import type { CalendarBlockVm } from "@/pods/home/availability.vm";

const PICKER_LABELS = {
  topTitle: "Cambia tus fechas",
  freeLabel: "Libre",
  busyLabel: "Ocupado",
  selectionLabel: "Tu selección",
  rangeSelectedTopTitle: "Fechas seleccionadas",
  rangeSelectedMainTitle: "Elige tus fechas",
};

interface DateSummaryProps {
  range: DateRange | undefined;
  blocks: CalendarBlockVm[];
  isEditing: boolean;
  onStartEdit: () => void;
  onChange: (range: DateRange | undefined) => void;
  onDone: () => void;
}

export const DateSummary = ({
  range,
  blocks,
  isEditing,
  onStartEdit,
  onChange,
  onDone,
}: DateSummaryProps) => {
  const { isValid, nights } = getRangeValidity(range);

  if (isEditing) {
    return (
      <DateRangePicker
        blocks={blocks}
        value={range}
        onChange={onChange}
        labels={PICKER_LABELS}
      >
        <Button
          type="button"
          disabled={!isValid}
          onClick={onDone}
          className="mt-4 h-12 w-full rounded-2xl bg-[var(--lagoon-deep)] text-base font-semibold text-white hover:bg-[#246f76] disabled:opacity-60"
        >
          Listo
        </Button>
      </DateRangePicker>
    );
  }

  return (
    <div>
      <p className="island-kicker mb-2 flex items-center gap-2">
        <CalendarDays className="h-4 w-4" /> Tu estancia
      </p>
      <h2 className="text-3xl font-semibold text-[var(--sea-ink)]">
        {range?.from && range?.to
          ? formatRangeLabel(range.from, range.to)
          : "Selecciona tus fechas"}
      </h2>
      {nights > 0 && (
        <p className="mt-1 text-base text-[var(--sea-ink-soft)]">
          {nights} {nights === 1 ? "noche" : "noches"}
        </p>
      )}

      <div className="mt-6 rounded-3xl bg-[var(--sand)] p-5">
        <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
          ¿No son las fechas correctas?
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={onStartEdit}
          className="mt-3 h-11 w-full gap-2 rounded-2xl border-[var(--lagoon-deep)]/30 bg-transparent text-base font-semibold text-[var(--lagoon-deep)] hover:bg-[var(--lagoon-deep)]/5"
        >
          <Pencil className="h-4 w-4" /> Cambiar fechas
        </Button>
      </div>
    </div>
  );
};

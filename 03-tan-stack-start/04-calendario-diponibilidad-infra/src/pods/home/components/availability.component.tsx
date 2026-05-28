import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AvailabilitySection } from "../home.model";

interface AvailabilityProps {
  availability: AvailabilitySection;
  currentMonth: string;
}

export const Availability = ({
  availability,
  currentMonth,
}: AvailabilityProps) => (
  <Card className="island-shell gap-0 rounded-[2rem] border-0 p-0 ring-0">
    <CardContent className="p-7">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="island-kicker mb-2 flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> {availability.topTitle}
          </p>
          <h2 className="text-3xl font-semibold text-[var(--sea-ink)]">
            {currentMonth}
          </h2>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-[var(--sea-ink-soft)]">
          <span className="flex items-center gap-2">
            <i className="h-3 w-3 rounded-full bg-[var(--sand)]" />
            {availability.freeLabel}
          </span>
          <span className="flex items-center gap-2">
            <i className="h-3 w-3 rounded-full bg-[#e8b3a4]" />
            {availability.BusyLabel}
          </span>
          <span className="flex items-center gap-2">
            <i className="h-3 w-3 rounded-full bg-[var(--lagoon-deep)]" />
            {availability.selectionLabel}
          </span>
        </div>
      </div>

      {/* Placeholder: el calendario interactivo llega en el paso 2 */}
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[var(--line)] bg-[var(--chip-bg)] p-8 text-center">
        <CalendarDays className="h-10 w-10 text-[var(--lagoon-deep)]" />
        <p className="m-0 font-semibold text-[var(--sea-ink)]">
          Calendario próximamente
        </p>
        <p className="m-0 max-w-xs text-sm text-[var(--sea-ink-soft)]">
          El calendario de disponibilidad interactivo llegará en el siguiente
          paso.
        </p>
      </div>

      <div className="mt-7 rounded-3xl bg-[var(--sand)] p-5">
        <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
          {availability.rangeSelectedTopTitle}
        </p>
        <p className="mt-1 text-xl font-semibold text-[var(--sea-ink)]">
          {availability.rangeSelectedMainTitle}
        </p>
        <Button
          type="button"
          aria-label={availability.CheckAvailabilityLabel}
          className="mt-4 h-12 w-full rounded-2xl bg-[var(--lagoon-deep)] text-base font-semibold text-white hover:bg-[#246f76]"
        >
          {availability.CheckAvailabilityLabel}
        </Button>
      </div>
    </CardContent>
  </Card>
);

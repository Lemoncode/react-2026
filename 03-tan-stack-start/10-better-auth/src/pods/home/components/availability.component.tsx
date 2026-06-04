import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DateRangePicker,
  getRangeValidity,
  toIsoDate,
} from "@/components/date-range-picker";
import type { AvailabilitySection } from "../home.model";
import type { CalendarBlockVm } from "../availability.vm";

interface AvailabilityProps {
  availability: AvailabilitySection;
  blocks: CalendarBlockVm[];
}

export const Availability = ({ availability, blocks }: AvailabilityProps) => {
  const navigate = useNavigate();
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  const { isValid } = getRangeValidity(range);

  const handleConsult = () => {
    if (!isValid || !range?.from || !range?.to) return;
    navigate({
      to: "/reserva",
      search: { from: toIsoDate(range.from), to: toIsoDate(range.to) },
    });
  };

  return (
    <Card className="island-shell gap-0 rounded-[2rem] border-0 p-0 ring-0">
      <CardContent className="p-7">
        <DateRangePicker
          blocks={blocks}
          value={range}
          onChange={setRange}
          labels={{
            topTitle: availability.topTitle,
            freeLabel: availability.freeLabel,
            busyLabel: availability.BusyLabel,
            selectionLabel: availability.selectionLabel,
            rangeSelectedTopTitle: availability.rangeSelectedTopTitle,
            rangeSelectedMainTitle: availability.rangeSelectedMainTitle,
          }}
        >
          <Button
            type="button"
            disabled={!isValid}
            onClick={handleConsult}
            aria-label={availability.CheckAvailabilityLabel}
            className="mt-4 h-12 w-full rounded-2xl bg-[var(--lagoon-deep)] text-base font-semibold text-white hover:bg-[#246f76] disabled:opacity-60"
          >
            {availability.CheckAvailabilityLabel}
          </Button>
        </DateRangePicker>
      </CardContent>
    </Card>
  );
};

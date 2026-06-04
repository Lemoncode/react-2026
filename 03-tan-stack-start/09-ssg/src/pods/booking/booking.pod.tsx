import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CalendarOff } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getRangeValidity,
  parseIsoDate,
  toIsoDate,
} from "@/components/date-range-picker";
import type { CalendarBlockVm } from "@/pods/home/availability.vm";
import { DateSummary } from "./components/date-summary.component";
import { GuestForm } from "./components/guest-form.component";
import { sendBookingRequest } from "./booking.api";
import type { GuestDetails } from "./booking.model";

interface BookingProps {
  from: string; // ISO YYYY-MM-DD
  to: string; // ISO YYYY-MM-DD
  blocks: CalendarBlockVm[];
}

/** Calendar day (`YYYY-MM-DD`) of a block date, read in UTC to match how the
 * blocks are stored (UTC midnight). Avoids local-vs-UTC instant comparisons. */
const toIsoDay = (value: Date | string): string =>
  typeof value === "string"
    ? value.slice(0, 10)
    : new Date(value).toISOString().slice(0, 10);

/** Half-open overlap at day granularity: the stay occupies nights [from, to)
 * and a block occupies [startDate, endDate). Lexicographic compare on
 * `YYYY-MM-DD` is chronological. */
const rangeOverlapsBlocks = (
  from: string,
  to: string,
  blocks: CalendarBlockVm[],
): boolean =>
  blocks.some(
    (block) =>
      from < toIsoDay(block.endDate) && to > toIsoDay(block.startDate),
  );

export const Booking = ({ from, to, blocks }: BookingProps) => {
  const navigate = useNavigate();

  const [range, setRange] = useState<DateRange | undefined>(() => ({
    from: parseIsoDate(from),
    to: parseIsoDate(to),
  }));
  const [isEditing, setIsEditing] = useState(false);
  const [isOccupiedOpen, setIsOccupiedOpen] = useState(() =>
    rangeOverlapsBlocks(from, to, blocks),
  );

  const { isValid, nights } = useMemo(
    () => getRangeValidity(range),
    [range],
  );

  const handleDateChangeDone = () => {
    if (!isValid || !range?.from || !range?.to) return;
    setIsEditing(false);
    navigate({
      to: "/reserva",
      search: { from: toIsoDate(range.from), to: toIsoDate(range.to) },
      replace: true,
    });
  };

  const handleOccupiedClose = () => {
    setIsOccupiedOpen(false);
    setIsEditing(true);
  };

  const handleSubmit = async (guest: GuestDetails) => {
    if (!range?.from || !range?.to) return;
    await sendBookingRequest({
      data: {
        ...guest,
        from: toIsoDate(range.from),
        to: toIsoDate(range.to),
        nights,
      },
    });
  };

  return (
    <main className="page-wrap px-4 py-10 md:py-14">
      <div className="mb-8">
        <p className="island-kicker mb-2">Reserva</p>
        <h1 className="display-title text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          Completa tu solicitud
        </h1>
        <p className="m-0 mt-2 max-w-2xl text-base leading-8 text-[var(--sea-ink-soft)]">
          Revisa tus fechas y déjanos tus datos. Enviaremos tu solicitud al
          propietario para confirmar la reserva.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
        <Card className="island-shell h-fit gap-0 rounded-[2rem] border-0 p-0 ring-0">
          <CardContent className="p-7">
            <DateSummary
              range={range}
              blocks={blocks}
              isEditing={isEditing}
              onStartEdit={() => setIsEditing(true)}
              onChange={setRange}
              onDone={handleDateChangeDone}
            />
          </CardContent>
        </Card>

        <Card className="island-shell h-fit gap-0 rounded-[2rem] border-0 p-0 ring-0">
          <CardContent className="p-7">
            <p className="island-kicker mb-2">Datos del huésped</p>
            <h2 className="mb-6 text-3xl font-semibold text-[var(--sea-ink)]">
              ¿Quién se aloja?
            </h2>
            <GuestForm onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isOccupiedOpen}
        onOpenChange={(open) => {
          if (!open) handleOccupiedClose();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8b3a4]/40 text-[var(--sea-ink)]">
              <CalendarOff className="h-6 w-6" />
            </span>
            <DialogTitle>Esas fechas ya no están disponibles</DialogTitle>
            <DialogDescription>
              Parte de las fechas que elegiste se ha ocupado. Elige un nuevo
              rango disponible en el calendario para continuar con tu reserva.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleOccupiedClose}
              className="h-11 rounded-2xl bg-[var(--lagoon-deep)] px-6 text-base font-semibold text-white hover:bg-[#246f76]"
            >
              Elegir otras fechas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

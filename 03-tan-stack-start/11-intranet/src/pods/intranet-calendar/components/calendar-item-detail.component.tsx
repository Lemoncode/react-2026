import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { getBlockReason } from "../calendar-item-appearance";
import {
  formatCurrency,
  formatDateRange,
  formatNights,
  formatOccupancy,
  getBookingStatusLabel,
  getPaymentStatusLabel,
} from "../intranet-calendar.format";
import type { CalendarItemVm, PriceVm } from "../intranet-calendar.vm";

interface CalendarItemDetailProps {
  item: CalendarItemVm;
  onClose: () => void;
}

const StatusPill = ({ status }: { status: string }) => {
  const isConfirmed = status === "confirmed";
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isConfirmed ? "text-white" : "bg-amber-400/90 text-amber-950",
      )}
      style={isConfirmed ? { backgroundColor: "var(--palm)" } : undefined}
    >
      {getBookingStatusLabel(status)}
    </span>
  );
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="space-y-0.5">
    <dt className="text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
      {label}
    </dt>
    <dd className="text-sm text-[var(--sea-ink)]">{children}</dd>
  </div>
);

const PriceRow = ({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) => (
  <div
    className={cn(
      "flex items-center justify-between py-1 text-sm",
      strong &&
        "mt-1 border-t border-border/60 pt-2 text-base font-bold text-[var(--sea-ink)]",
    )}
  >
    <span className={cn("text-[var(--sea-ink-soft)]", strong && "text-[var(--sea-ink)]")}>
      {label}
    </span>
    <span className="tabular-nums">{value}</span>
  </div>
);

const PriceBreakdown = ({ price }: { price: PriceVm }) => (
  <div className="rounded-xl bg-[var(--chip-bg)] p-3">
    <PriceRow
      label="Subtotal"
      value={formatCurrency(price.subtotal, price.currency)}
    />
    {price.cleaningFee > 0 && (
      <PriceRow
        label="Limpieza"
        value={formatCurrency(price.cleaningFee, price.currency)}
      />
    )}
    {price.touristTax > 0 && (
      <PriceRow
        label="Tasa turística"
        value={formatCurrency(price.touristTax, price.currency)}
      />
    )}
    {price.discount > 0 && (
      <PriceRow
        label="Descuento"
        value={`-${formatCurrency(price.discount, price.currency)}`}
      />
    )}
    <PriceRow
      label="Total"
      value={formatCurrency(price.total, price.currency)}
      strong
    />
  </div>
);

const BookingBody = ({ item }: { item: CalendarItemVm }) => (
  <div className="grid gap-5 md:grid-cols-2">
    <dl className="space-y-4">
      {item.guest && (
        <Field label="Huésped">
          <div className="space-y-0.5">
            <p className="font-medium">{item.guest.name}</p>
            <p className="text-[var(--sea-ink-soft)]">{item.guest.email}</p>
            <p className="text-[var(--sea-ink-soft)]">{item.guest.phone}</p>
          </div>
        </Field>
      )}
      <Field label="Fechas">
        {formatDateRange(item.startDate, item.endDate)} ·{" "}
        {formatNights(item.nights)}
      </Field>
      {item.occupancy && (
        <Field label="Ocupación">{formatOccupancy(item.occupancy)}</Field>
      )}
      {item.payment && (
        <Field label="Pago">
          {getPaymentStatusLabel(item.payment.status)}
          <span className="text-[var(--sea-ink-soft)]"> · {item.payment.method}</span>
        </Field>
      )}
    </dl>

    {item.price && (
      <div>
        <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
          Precio
        </p>
        <PriceBreakdown price={item.price} />
      </div>
    )}
  </div>
);

const BlockBody = ({ item }: { item: CalendarItemVm }) => {
  const reason = getBlockReason(item.subtype);
  return (
    <dl className="space-y-4">
      <Field label="Fechas">
        {formatDateRange(item.startDate, item.endDate)} ·{" "}
        {formatNights(item.nights)}
      </Field>
      {reason && <Field label="Motivo">{reason}</Field>}
      {item.notes?.internal && (
        <Field label="Nota interna">
          <span className="italic">{item.notes.internal}</span>
        </Field>
      )}
    </dl>
  );
};

export const CalendarItemDetail = ({
  item,
  onClose,
}: CalendarItemDetailProps) => {
  const { toast } = useToast();
  const sectionRef = useRef<HTMLElement>(null);
  const isBlock = item.type === "block";

  // Bring the detail into view and move focus to it when a new item is opened
  // (especially important on mobile, where it appears below a tall calendar).
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "nearest" });
    node.focus({ preventScroll: true });
  }, [item.id]);

  const editComingSoon = () =>
    toast({
      title: isBlock ? "Editar bloqueo" : "Editar reserva",
      description: "Disponible próximamente.",
    });

  return (
    <section
      ref={sectionRef}
      tabIndex={-1}
      aria-label={isBlock ? "Detalle del bloqueo" : "Detalle de la reserva"}
      className="island-shell scroll-mt-6 rounded-2xl p-5 outline-none md:p-6"
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="display-title text-xl font-bold text-[var(--sea-ink)]">
            {isBlock ? "No disponible" : item.guest?.name ?? "Reserva"}
          </h2>
          {isBlock ? (
            getBlockReason(item.subtype) && (
              <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                {getBlockReason(item.subtype)}
              </span>
            )
          ) : (
            <StatusPill status={item.status} />
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isBlock ? "Editar bloqueo" : "Editar reserva"}
            onClick={editComingSoon}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Cerrar detalle"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>
      </header>

      {isBlock ? <BlockBody item={item} /> : <BookingBody item={item} />}
    </section>
  );
};

import type { ReactNode } from "react";
import { CalendarDays, CreditCard, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
import type { CalendarItemVm } from "../intranet-calendar.vm";

interface CalendarItemHoverCardProps {
  item: CalendarItemVm;
}

const StatusBadge = ({ status }: { status: string }) => {
  const isConfirmed = status === "confirmed";
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isConfirmed
          ? "text-white"
          : "bg-amber-400/90 text-amber-950",
      )}
      style={isConfirmed ? { backgroundColor: "var(--palm)" } : undefined}
    >
      {getBookingStatusLabel(status)}
    </span>
  );
};

const InfoRow = ({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) => (
  <div className="flex items-center gap-2 text-sm text-[var(--sea-ink-soft)]">
    <Icon className="size-4 shrink-0 text-[var(--lagoon-deep)]" aria-hidden />
    <span>{children}</span>
  </div>
);

const BookingHoverCard = ({ item }: { item: CalendarItemVm }) => (
  <div className="space-y-2.5">
    <div className="flex items-start justify-between gap-3">
      <p className="font-semibold leading-tight text-[var(--sea-ink)]">
        {item.guest?.name ?? "Reserva"}
      </p>
      <StatusBadge status={item.status} />
    </div>

    <div className="space-y-1.5">
      <InfoRow icon={CalendarDays}>
        {formatDateRange(item.startDate, item.endDate)}
        <span className="text-[var(--sea-ink-soft)]/70">
          {" · "}
          {formatNights(item.nights)}
        </span>
      </InfoRow>
      {item.occupancy && (
        <InfoRow icon={Users}>{formatOccupancy(item.occupancy)}</InfoRow>
      )}
      {item.payment && (
        <InfoRow icon={CreditCard}>
          {getPaymentStatusLabel(item.payment.status)}
        </InfoRow>
      )}
    </div>

    {item.price && (
      <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
        <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
          Total
        </span>
        <span className="text-lg font-bold text-[var(--sea-ink)]">
          {formatCurrency(item.price.total, item.price.currency)}
        </span>
      </div>
    )}
  </div>
);

const BlockHoverCard = ({ item }: { item: CalendarItemVm }) => {
  const reason = getBlockReason(item.subtype);
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold leading-tight text-[var(--sea-ink)]">
          No disponible
        </p>
        {reason && (
          <span className="shrink-0 rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {reason}
          </span>
        )}
      </div>

      <InfoRow icon={CalendarDays}>
        {formatDateRange(item.startDate, item.endDate)}
        <span className="text-[var(--sea-ink-soft)]/70">
          {" · "}
          {formatNights(item.nights)}
        </span>
      </InfoRow>

      {item.notes?.internal && (
        <p className="border-t border-border/60 pt-2.5 text-sm italic text-[var(--sea-ink-soft)]">
          {item.notes.internal}
        </p>
      )}
    </div>
  );
};

export const CalendarItemHoverCard = ({ item }: CalendarItemHoverCardProps) =>
  item.type === "block" ? (
    <BlockHoverCard item={item} />
  ) : (
    <BookingHoverCard item={item} />
  );

import { useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useBlocker, useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  NumberField,
  SelectField,
  TextField,
  TextareaField,
} from "@/components/form";
import { useToast } from "@/components/ui/toast";
import { updateCalendarItem } from "../intranet-calendar.api";
import {
  BLOCK_SUBTYPE_OPTIONS,
  BOOKING_STATUS_OPTIONS,
  calendarItemFormSchema,
  type CalendarItemFormValues,
} from "../intranet-calendar-form.schema";
import {
  buildDefaultValues,
  computeSubtotal,
  computeTotal,
  nightsBetween,
  overlapsOtherItem,
} from "../intranet-calendar-form.helpers";
import { formatCurrency } from "../intranet-calendar.format";
import type { CalendarItemVm } from "../intranet-calendar.vm";
import { ConfirmDialog } from "./confirm-dialog.component";
import { DateRangeField } from "./date-range-field.component";

interface CalendarItemFormProps {
  item: CalendarItemVm;
  /** All items in view, used for early client-side overlap feedback. */
  siblings: CalendarItemVm[];
  onCancel: () => void;
  onSaved: () => void;
}

const DerivedRow = ({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) => (
  <div
    className={
      strong
        ? "mt-1 flex items-center justify-between border-t border-border/60 pt-2 text-base font-bold text-[var(--sea-ink)]"
        : "flex items-center justify-between py-0.5 text-sm text-[var(--sea-ink-soft)]"
    }
  >
    <span>{label}</span>
    <span className="tabular-nums">{value}</span>
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DerivedTotals = ({ form }: { form: any }) => (
  <form.Subscribe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selector={(state: any) => ({
      start: state.values.startDate,
      end: state.values.endDate,
      nightlyRate: state.values.nightlyRate,
      cleaningFee: state.values.cleaningFee,
      touristTax: state.values.touristTax,
      discount: state.values.discount,
    })}
  >
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    {({ start, end, nightlyRate, cleaningFee, touristTax, discount }: any) => {
      const nights = start && end ? nightsBetween(start, end) : 0;
      const subtotal = computeSubtotal(Number(nightlyRate) || 0, nights);
      const total = computeTotal(
        subtotal,
        Number(cleaningFee) || 0,
        Number(touristTax) || 0,
        Number(discount) || 0,
      );
      return (
        <div className="rounded-xl bg-[var(--chip-bg)] p-3">
          <DerivedRow label="Noches" value={String(nights)} />
          <DerivedRow label="Subtotal" value={formatCurrency(subtotal, "EUR")} />
          <DerivedRow label="Total" value={formatCurrency(total, "EUR")} strong />
        </div>
      );
    }}
  </form.Subscribe>
);

export const CalendarItemForm = ({
  item,
  siblings,
  onCancel,
  onSaved,
}: CalendarItemFormProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const isBlock = item.type === "block";
  const [pendingCancel, setPendingCancel] = useState(false);

  const form = useForm({
    defaultValues: buildDefaultValues(item) as CalendarItemFormValues,
    validators: {
      onChange: calendarItemFormSchema,
      onBlur: calendarItemFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      if (overlapsOtherItem(siblings, value, item.id)) {
        toast({
          variant: "error",
          title: "Fechas no disponibles",
          description: "Las fechas se solapan con otra reserva o bloqueo.",
        });
        return;
      }
      try {
        await updateCalendarItem({ data: { id: item.id, values: value } });
        // Reset the baseline so the form is no longer dirty (releases the
        // navigation blocker) before we switch back to view mode.
        formApi.reset(value);
        await router.invalidate();
        toast({
          variant: "success",
          title: "Cambios guardados",
          description: "La información se ha actualizado.",
        });
        if (value.type === "booking" && value.status === "cancelled") {
          toast({
            title: "Reserva cancelada",
            description:
              "Las reservas canceladas no se muestran en el calendario.",
          });
        }
        onSaved();
      } catch (error) {
        toast({
          variant: "error",
          title: "No se pudo guardar",
          description:
            error instanceof Error ? error.message : "Inténtalo de nuevo.",
        });
      }
    },
    onSubmitInvalid: () => {
      toast({
        variant: "error",
        title: "Revisa el formulario",
        description: "Hay errores en el formulario. Revisa los campos.",
      });
    },
  });

  const isDirty = useStore(form.store, (state) => state.isDirty);

  // Full guard: any navigation (other bar, month nav, back, refresh) while
  // there are unsaved changes is intercepted and routed to the discard modal.
  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: () => isDirty,
    withResolver: true,
  });

  const discardOpen = blocker.status === "blocked" || pendingCancel;

  const handleCancel = () => {
    if (isDirty) setPendingCancel(true);
    else onCancel();
  };

  const confirmDiscard = () => {
    if (blocker.status === "blocked") {
      blocker.proceed();
    } else {
      setPendingCancel(false);
      onCancel();
    }
  };

  const keepEditing = () => {
    if (blocker.status === "blocked") blocker.reset();
    setPendingCancel(false);
  };

  return (
    <>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-5"
      >
        <h2 className="display-title text-xl font-bold text-[var(--sea-ink)]">
          {isBlock ? "Editar bloqueo" : "Editar reserva"}
        </h2>

        <DateRangeField
          form={form}
          startName="startDate"
          endName="endDate"
          label="Fechas"
        />

        {isBlock ? (
          <>
            <SelectField
              form={form}
              name="subtype"
              label="Motivo"
              options={BLOCK_SUBTYPE_OPTIONS}
              placeholder="Selecciona un motivo"
            />
            <TextareaField
              form={form}
              name="notesInternal"
              label="Nota interna"
              rows={3}
              maxLength={500}
              placeholder="Notas internas (opcional)"
            />
          </>
        ) : (
          <>
            <SelectField
              form={form}
              name="status"
              label="Estado"
              options={BOOKING_STATUS_OPTIONS}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                form={form}
                name="guestName"
                label="Huésped"
                type="text"
                autoComplete="name"
              />
              <TextField
                form={form}
                name="guestEmail"
                label="Email"
                type="email"
                autoComplete="email"
              />
            </div>
            <TextField
              form={form}
              name="guestPhone"
              label="Teléfono"
              type="tel"
              autoComplete="tel"
              className="sm:max-w-[18rem]"
            />

            <fieldset className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <NumberField form={form} name="adults" label="Adultos" min={1} />
              <NumberField form={form} name="children" label="Niños" min={0} />
              <NumberField form={form} name="babies" label="Bebés" min={0} />
              <NumberField form={form} name="pets" label="Mascotas" min={0} />
            </fieldset>

            <fieldset className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <NumberField
                form={form}
                name="nightlyRate"
                label="Tarifa/noche (€)"
                min={0}
                step="0.01"
              />
              <NumberField
                form={form}
                name="cleaningFee"
                label="Limpieza (€)"
                min={0}
                step="0.01"
              />
              <NumberField
                form={form}
                name="touristTax"
                label="Tasa (€)"
                min={0}
                step="0.01"
              />
              <NumberField
                form={form}
                name="discount"
                label="Descuento (€)"
                min={0}
                step="0.01"
              />
            </fieldset>

            <DerivedTotals form={form} />
          </>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[var(--lagoon-deep)] text-white hover:bg-[#246f76]"
              >
                {isSubmitting ? "Guardando…" : "Guardar cambios"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>

      <ConfirmDialog
        open={discardOpen}
        onOpenChange={(open) => {
          if (!open) keepEditing();
        }}
        title="¿Descartar cambios?"
        description="Tienes cambios sin guardar. Si continúas, se perderán."
        confirmLabel="Descartar"
        cancelLabel="Seguir editando"
        destructive
        onConfirm={confirmDiscard}
      />
    </>
  );
};

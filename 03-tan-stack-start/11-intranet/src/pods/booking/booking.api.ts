import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getResend } from "@/lib/resend";
import { guestFormSchema } from "./guest-form.schema";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const bookingRequestSchema = guestFormSchema.extend({
  from: z.string().regex(ISO_DATE, "Fecha de entrada inválida"),
  to: z.string().regex(ISO_DATE, "Fecha de salida inválida"),
  nights: z.number().int().min(1),
});

type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

const formatDate = (iso: string): string => {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
};

const buildEmailHtml = (data: BookingRequestInput): string => {
  const fullName = escapeHtml(`${data.firstName} ${data.lastName}`);
  const rows: Array<[string, string]> = [
    ["Huésped", fullName],
    ["Email", escapeHtml(data.email)],
    ["Teléfono", escapeHtml(data.phone)],
    ["Huéspedes", String(data.guests)],
    [
      "Fechas",
      `${formatDate(data.from)} → ${formatDate(data.to)} (${data.nights} ${
        data.nights === 1 ? "noche" : "noches"
      })`,
    ],
  ];
  if (data.comments && data.comments.trim()) {
    rows.push(["Comentarios", escapeHtml(data.comments)]);
  }

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:8px 12px;color:#5b6b6e;font-weight:600;vertical-align:top;white-space:nowrap;">${label}</td>
          <td style="padding:8px 12px;color:#1f2d2f;">${value}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;background:#f3efe7;padding:24px;font-family:Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e7e0d3;">
      <div style="background:#2a7e86;padding:20px 28px;">
        <h1 style="margin:0;color:#ffffff;font-size:20px;">Nueva solicitud de reserva</h1>
      </div>
      <div style="padding:24px 28px;">
        <p style="margin:0 0 16px;color:#1f2d2f;font-size:15px;">
          Has recibido una nueva solicitud de reserva. Puedes responder
          directamente a este correo para contactar al huésped.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:15px;">
          ${tableRows}
        </table>
      </div>
    </div>
  </body>
</html>`;
};

export const sendBookingRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bookingRequestSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const ownerEmail = process.env.OWNER_EMAIL;
    if (!ownerEmail) throw new Error("Missing OWNER_EMAIL in environment");
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: `Reservas Villa <${fromEmail}>`,
      to: ownerEmail,
      replyTo: data.email,
      subject: `Nueva solicitud de reserva — ${data.firstName} ${data.lastName} (${data.from} → ${data.to})`,
      html: buildEmailHtml(data),
    });

    if (error) {
      throw new Error(error.message ?? "No se pudo enviar el correo");
    }

    return { ok: true };
  });

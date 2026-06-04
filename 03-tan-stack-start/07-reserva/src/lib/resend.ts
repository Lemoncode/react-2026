import { Resend } from "resend";

// Cache the client on globalThis so Vite HMR doesn't create a new one per reload.
const globalForResend = globalThis as unknown as {
  __resend?: Resend;
};

export const getResend = (): Resend => {
  if (globalForResend.__resend) {
    return globalForResend.__resend;
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing RESEND_API_KEY in environment");
  globalForResend.__resend = new Resend(apiKey);
  return globalForResend.__resend;
};

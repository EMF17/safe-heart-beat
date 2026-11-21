import { createServerFn } from "@tanstack/react-start";

// Public configuration only: no credentials, recipients, receipts or account data.
export const getAlertConfiguration = createServerFn({ method: "GET" }).handler(async () => {
  const { smsConfigured } = await import("./sms.server");
  return {
    emailConfigured: Boolean(process.env["RESEND_API_KEY"]),
    smsConfigured: smsConfigured(),
    checkedAt: new Date().toISOString(),
  };
});
import { createServerFn } from "@tanstack/react-start";

// Public configuration only: no credentials, recipients, receipts or account data.
export const getAlertConfiguration = createServerFn({ method: "GET" }).handler(async () => {
  const { smsConfigured } = await import("./sms.server");
  const { readSweepHealth } = await import("./heartbeat.server");
  let sweep: { available: boolean; lastCompletedAt: string | null; stale: boolean | null; source: string | null } = {
    available: false, lastCompletedAt: null, stale: null, source: null,
  };
  try {
    const { lastMs, stale, data } = await readSweepHealth();
    const result = data?.last_result;
    const src = result && typeof result === "object" && !Array.isArray(result) ? result["source"] : null;
    sweep = { available: true, lastCompletedAt: lastMs ? new Date(lastMs).toISOString() : null, stale,
      source: src === "primary" || src === "backup" ? src : null };
  } catch { /* Keep configuration visible while marking sweep health unavailable. */ }
  return {
    emailConfigured: Boolean(process.env["RESEND_API_KEY"]),
    smsConfigured: smsConfigured(),
    checkedAt: new Date().toISOString(),
    sweep,
  };
});
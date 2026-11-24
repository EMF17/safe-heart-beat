import { createServerFn } from "@tanstack/react-start";

// Public configuration only: no credentials, recipients, receipts or account data.
export const getAlertConfiguration = createServerFn({ method: "GET" }).handler(async () => {
  const { smsConfigured } = await import("./sms.server");
  const { readSweepHealth } = await import("./heartbeat.server");
  const { validHealthchecksUrl } = await import("./external-heartbeat.server");
  let sweep: { available: boolean; lastCompletedAt: string | null; stale: boolean | null; externalPing: string | null } = {
    available: false, lastCompletedAt: null, stale: null, externalPing: null,
  };
  try {
    const { lastMs, stale, data } = await readSweepHealth();
    const result = data?.last_result;
    const ping = result && typeof result === "object" && !Array.isArray(result) ? result["externalHeartbeat"] : null;
    sweep = { available: true, lastCompletedAt: lastMs ? new Date(lastMs).toISOString() : null, stale,
      externalPing: typeof ping === "string" && ["accepted", "not_configured", "invalid_configuration", "failed"].includes(ping) ? ping : null };
  } catch { /* Keep configuration visible while marking sweep health unavailable. */ }
  return {
    emailConfigured: Boolean(process.env["RESEND_API_KEY"]),
    smsConfigured: smsConfigured(),
    checkedAt: new Date().toISOString(),
    sweep,
    externalHeartbeatConfigured: validHealthchecksUrl(process.env["HEALTHCHECKS_PING_URL"]),
  };
});
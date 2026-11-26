const LATE_SWEEP_MS = 90 * 60_000;
const OWNER_EMAIL = "pulse.safety.fin@gmail.com";

/** Claim a sweep start before reporting a recovered gap. Concurrent starts
 * compare-and-swap the same row; only the winner can send the owner email. */
export async function recordSweepStart(startedAt: string, apiKey: string | undefined) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const table = () => supabaseAdmin.from("pulse_cron_heartbeats");
  const { data: previous, error: readError } = await table()
    .select("last_started_at, last_finished_at").eq("job", "overdue-alerts").maybeSingle();
  if (readError) throw new Error(`Unable to read previous sweep: ${readError.message}`);
  if (!previous) {
    const { error } = await table().upsert({ job: "overdue-alerts", last_started_at: startedAt });
    if (error) throw new Error(`Unable to record sweep start: ${error.message}`);
    return "not_needed";
  }

  const update = table().update({ last_started_at: startedAt }).eq("job", "overdue-alerts");
  const claim = previous.last_started_at
    ? update.eq("last_started_at", previous.last_started_at)
    : update.is("last_started_at", null);
  const { data: claimed, error: claimError } = await claim.select("job").maybeSingle();
  if (claimError) throw new Error(`Unable to record sweep start: ${claimError.message}`);
  if (!claimed) return "claimed_elsewhere";

  const previousAt = previous.last_started_at ?? previous.last_finished_at;
  const previousMs = previousAt ? Date.parse(previousAt) : NaN;
  const gapMs = Date.parse(startedAt) - previousMs;
  if (!Number.isFinite(gapMs) || gapMs <= LATE_SWEEP_MS) return "not_needed";
  if (!apiKey) {
    console.error("Late sweep email failed: RESEND_API_KEY is not configured");
    return "failed";
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(10_000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `sweep-late-${previousAt}`,
      },
      body: JSON.stringify({
        from: "Pulse Monitor <alerts@pulse-checkin.app>",
        to: [OWNER_EMAIL],
        subject: "Sweep was late.",
        text: `Sweep was late.\n\nThe previous sweep started at ${previousAt}. The next sweep resumed at ${startedAt}, after a gap of ${Math.floor(gapMs / 60_000)} minutes.\n\nThis notice is sent after recovery, not while the sweep is stopped. The resumed sweep will now check stored deadlines; alert delivery is not guaranteed.`,
      }),
    });
    if (!response.ok) {
      console.error(`Late sweep email failed [${response.status}]: ${await response.text()}`);
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error("Late sweep email failed", error instanceof Error ? error.message : "Unknown error");
    return "failed";
  }
}
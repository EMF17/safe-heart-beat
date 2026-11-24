import { isHeartbeatStale } from "@/lib/alert-state";

export async function readSweepHealth() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("pulse_cron_heartbeats")
    .select("last_finished_at, last_watchdog_alert_at, last_result").eq("job", "overdue-alerts").maybeSingle();
  if (error) throw new Error("Sweep health unavailable");
  const lastMs = data?.last_finished_at ? new Date(data.last_finished_at).getTime() : null;
  return { supabaseAdmin, data, lastMs, stale: isHeartbeatStale(lastMs, Date.now()) };
}

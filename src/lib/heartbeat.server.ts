import { isHeartbeatStale } from "@/lib/alert-state";

export async function readSweepHealth() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("pulse_cron_heartbeats")
    .select("last_finished_at, last_watchdog_alert_at").eq("job", "overdue-alerts").maybeSingle();
  const lastMs = data?.last_finished_at ? new Date(data.last_finished_at).getTime() : null;
  return { supabaseAdmin, data, lastMs, stale: isHeartbeatStale(lastMs, Date.now()) };
}

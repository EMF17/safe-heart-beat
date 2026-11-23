import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

// Scheduled sweep: finds accounts whose last check-in is older than two
// check-in windows (and not paused) and sends the missed-check-in alert.
// Runs on the server, so it works even when the user's phone is off.
export const Route = createFileRoute("/api/public/cron/overdue-alerts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await authenticateCronRequest(request);
        if (denied) return denied;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { sendAccountAlert } = await import("@/lib/alert.server");
        const startedAt = new Date().toISOString();
        await supabaseAdmin.from("pulse_cron_heartbeats").upsert({ job: "overdue-alerts", last_started_at: startedAt });
        // ok -> warned (one window missed) and back to ok after a check-in or pause.
        const { data: stateChanges, error: stateErr } = await supabaseAdmin.rpc("pulse_advance_alert_states");
        if (stateErr) console.error("State update failed", stateErr.message);
        const { data, error } = await supabaseAdmin.rpc("pulse_overdue_accounts", { _limit: 100 });
        if (error) {
          console.error("Overdue lookup failed", error.message);
          await supabaseAdmin.from("pulse_cron_heartbeats").update({ last_result: { error: "lookup_failed", at: startedAt } }).eq("job", "overdue-alerts");
          return Response.json({ error: "Lookup failed" }, { status: 500 });
        }
        let sent = 0;
        let skipped = 0;
        for (const row of data ?? []) {
          try {
            const res = await sendAccountAlert(row.id, "missed");
            if (res.ok) sent++;
            else skipped++;
          } catch (e) {
            skipped++;
            console.error("Overdue alert failed", e instanceof Error ? e.message : "Unknown error");
          }
        }
        const result = { checked: (data ?? []).length, sent, skipped, stateChanges: stateChanges ?? 0 };
        // Heartbeat only on a completed run, so the watchdog notices crashes too.
        await supabaseAdmin.from("pulse_cron_heartbeats").update({ last_finished_at: new Date().toISOString(), last_result: result }).eq("job", "overdue-alerts");
        console.log(JSON.stringify({ event: "overdue_sweep", ...result }));
        return Response.json(result);
      },
    },
  },
});

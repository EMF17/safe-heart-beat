import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

// Backup triggers (e.g. GitHub Actions) call without credentials. The sweep only
// acts on stored deadlines and every send is claimed by a unique key, so an extra
// run can never double-send; unauthenticated runs are just throttled globally.
export const BACKUP_MIN_INTERVAL_SECONDS = 600;

export const Route = createFileRoute("/api/public/cron/overdue-alerts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await authenticateCronRequest(request);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        let source = "primary";
        if (denied) {
          if (denied.status !== 401) return denied;
          const { data: allowed, error: rateErr } = await supabaseAdmin.rpc("pulse_rate_hit", {
            _bucket: "sweep:backup", _limit: 1, _window_seconds: BACKUP_MIN_INTERVAL_SECONDS,
          });
          if (rateErr) return Response.json({ error: "Unavailable" }, { status: 503 });
          if (!allowed) return Response.json({ skipped: "recent backup run" }, { status: 202 });
          source = "backup";
        }

        const { sendAccountAlert } = await import("@/lib/alert.server");
        const startedAt = new Date().toISOString();
        const { recordSweepStart } = await import("@/lib/sweep-start.server");
        let gapEmail: string;
        try {
          gapEmail = await recordSweepStart(startedAt, process.env["RESEND_API_KEY"]);
        } catch (error) {
          console.error("Sweep start failed", error instanceof Error ? error.message : "Unknown error");
          return Response.json({ error: "Unable to record sweep start" }, { status: 500 });
        }
        const { data: stateChanges, error: stateErr } = await supabaseAdmin.rpc("pulse_advance_alert_states");
        if (stateErr) {
          console.error("State update failed", stateErr.message);
          await supabaseAdmin.from("pulse_cron_heartbeats").update({ last_result: { error: "state_update_failed", at: startedAt, source } }).eq("job", "overdue-alerts");
          return Response.json({ error: "State update failed" }, { status: 500 });
        }
        const { data, error } = await supabaseAdmin.rpc("pulse_overdue_accounts", { _limit: 100 });
        if (error) {
          console.error("Overdue lookup failed", error.message);
          await supabaseAdmin.from("pulse_cron_heartbeats").update({ last_result: { error: "lookup_failed", at: startedAt, source } }).eq("job", "overdue-alerts");
          return Response.json({ error: "Lookup failed" }, { status: 500 });
        }
        // Grace step: remind the user themselves after the first missed window.
        let graceSent = 0;
        const { data: graceDue } = await supabaseAdmin.rpc("pulse_grace_due_accounts", { _limit: 100 });
        if (graceDue?.length) {
          const { sendGraceReminder } = await import("@/lib/grace.server");
          for (const row of graceDue) {
            try { if ((await sendGraceReminder(row.id)) === "sent") graceSent++; }
            catch (e) { console.error("Grace reminder failed", e instanceof Error ? e.message : "Unknown error"); }
          }
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
        const result = { checked: (data ?? []).length, sent, skipped, stateChanges: stateChanges ?? 0, graceSent, source, gapEmail };
        const { error: finishError } = await supabaseAdmin.from("pulse_cron_heartbeats").update({ last_finished_at: new Date().toISOString(), last_result: result }).eq("job", "overdue-alerts");
        if (finishError) return Response.json({ error: "Unable to record sweep completion" }, { status: 500 });
        console.log(JSON.stringify({ event: "overdue_sweep", ...result }));
        // Counts only; never recipients.
        return Response.json(result);
      },
    },
  },
});

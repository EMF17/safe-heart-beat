import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

const OWNER_EMAIL = "pulse.safety.fin@gmail.com";

// Separate schedule that emails the owner (at most every 12h) when the
// hourly overdue-alert sweep has not completed recently.
export const Route = createFileRoute("/api/public/cron/watchdog")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await authenticateCronRequest(request);
        if (denied) return denied;
        const { readSweepHealth } = await import("@/lib/heartbeat.server");
        const { supabaseAdmin, data, lastMs, stale } = await readSweepHealth();
        if (!stale) return Response.json({ ok: true });
        const lastAlert = data?.last_watchdog_alert_at ? new Date(data.last_watchdog_alert_at).getTime() : 0;
        if (Date.now() - lastAlert < 12 * 3600_000) return Response.json({ ok: false, notified: "recently" });
        const apiKey = process.env["RESEND_API_KEY"];
        if (!apiKey) return Response.json({ ok: false, notified: false }, { status: 500 });
        const hourKey = new Date().toISOString().slice(0, 13);
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `watchdog-${hourKey}` },
          body: JSON.stringify({
            from: "Pulse Monitor <alerts@pulse-checkin.app>",
            to: [OWNER_EMAIL],
            subject: "Pulse: the hourly missed-check-in sweep has stopped",
            text: `The overdue-alert sweep last completed at ${lastMs ? new Date(lastMs).toISOString() : "never"}. Missed-check-in alerts are not going out until it runs again.`,
          }),
        });
        if (!res.ok) {
          console.error(`Watchdog email failed [${res.status}]: ${await res.text()}`);
          return Response.json({ ok: false, notified: false }, { status: 502 });
        }
        await supabaseAdmin.from("pulse_cron_heartbeats").upsert({ job: "overdue-alerts", last_watchdog_alert_at: new Date().toISOString() });
        return Response.json({ ok: false, notified: true });
      },
    },
  },
});

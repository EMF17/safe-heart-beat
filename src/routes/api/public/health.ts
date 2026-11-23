import { createFileRoute } from "@tanstack/react-router";

// Public, no personal data: lets an outside uptime monitor notice if the
// hourly alert check stops (503 when it has not completed for 2.5 hours).
export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () => {
        const { readSweepHealth } = await import("@/lib/heartbeat.server");
        const { lastMs, stale } = await readSweepHealth();
        return Response.json(
          { ok: !stale, alertSweepLastCompleted: lastMs ? new Date(lastMs).toISOString() : null },
          { status: stale ? 503 : 200, headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});

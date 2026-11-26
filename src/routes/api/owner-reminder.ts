import { createFileRoute } from "@tanstack/react-router";

// Owner-side: read or save the user's own email for "Are you OK?" reminders.
export const Route = createFileRoute("/api/owner-reminder")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { token?: unknown; action?: unknown; email?: unknown };
        try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
        const token = typeof body.token === "string" ? body.token.trim().slice(0, 500) : "";
        if (!token) return Response.json({ error: "Authentication required" }, { status: 401 });
        const { verifyToken } = await import("@/lib/sync.server");
        let accountId: string;
        try { accountId = await verifyToken(token); } catch { return Response.json({ error: "Invalid or expired token" }, { status: 401 }); }
        const g = await import("@/lib/grace.server");
        if (body.action === "save") return Response.json(await g.saveOwnerEmail(accountId, typeof body.email === "string" ? body.email.slice(0, 254) : ""));
        return Response.json(await g.readOwnerReminder(accountId));
      },
    },
  },
});

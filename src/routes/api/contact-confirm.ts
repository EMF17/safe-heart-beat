import { createFileRoute } from "@tanstack/react-router";

// Owner-side: check whether the saved contact has confirmed, or ask them to.
export const Route = createFileRoute("/api/contact-confirm")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { token?: unknown; action?: unknown };
        try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
        const token = typeof body.token === "string" ? body.token.trim().slice(0, 500) : "";
        if (!token) return Response.json({ error: "Authentication required" }, { status: 401 });
        const { verifyToken } = await import("@/lib/sync.server");
        let accountId: string;
        try { accountId = await verifyToken(token); } catch { return Response.json({ error: "Invalid or expired token" }, { status: 401 }); }
        const { sendConsentRequest } = await import("@/lib/contact-consent.server");
        if (body.action === "send") return Response.json(await sendConsentRequest(accountId));
        const { readContactProtection } = await import("@/lib/contact-protection.server");
        try { return Response.json(await readContactProtection(accountId)); }
        catch { return Response.json({ error: "Unable to check contact protection" }, { status: 503 }); }
      },
    },
  },
});

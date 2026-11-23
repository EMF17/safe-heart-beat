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
        const { isContactConfirmed, sendConsentRequest } = await import("@/lib/contact-consent.server");
        if (body.action === "send") return Response.json(await sendConsentRequest(accountId));
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: a } = await supabaseAdmin.from("pulse_accounts")
          .select("contact_email, contact_confirmed_email, contact_confirm_sent_at").eq("id", accountId).maybeSingle();
        if (!a) return Response.json({ error: "Not found" }, { status: 404 });
        return Response.json({ confirmed: isContactConfirmed(a), requestSentAt: a.contact_confirm_sent_at });
      },
    },
  },
});

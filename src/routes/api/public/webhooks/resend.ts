import { createFileRoute } from "@tanstack/react-router";
import { verifySvixSignature } from "@/lib/svix-verify";

const STATUS_BY_EVENT: Record<string, "delivered" | "bounced" | "complained" | "delayed"> = {
  "email.delivered": "delivered",
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.delivery_delayed": "delayed",
};

// Resend delivery/bounce webhook. Verified with the signing secret, and each
// event id is stored once so Resend's own retries are processed only once.
export const Route = createFileRoute("/api/public/webhooks/resend")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["RESEND_WEBHOOK_SECRET"];
        if (!secret) return new Response("Not configured", { status: 500 });
        const body = await request.text();
        const id = request.headers.get("svix-id") ?? "";
        const ts = request.headers.get("svix-timestamp") ?? "";
        const sig = request.headers.get("svix-signature") ?? "";
        if (!(await verifySvixSignature(secret, id, ts, body, sig, Date.now()))) {
          return new Response("Invalid signature", { status: 401 });
        }
        let event: { type?: string; data?: { email_id?: string } };
        try { event = JSON.parse(body); } catch { return new Response("Bad JSON", { status: 400 }); }
        const type = String(event.type ?? "").slice(0, 60);
        const messageId = typeof event.data?.email_id === "string" ? event.data.email_id.slice(0, 100) : null;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error: dup } = await supabaseAdmin.from("pulse_email_events")
          .insert({ event_id: id.slice(0, 100), provider_message_id: messageId, event_type: type });
        if (dup) return Response.json({ duplicate: true });
        const status = STATUS_BY_EVENT[type];
        if (messageId && (status === "delivered" || status === "bounced" || status === "complained")) {
          const now = new Date().toISOString();
          await supabaseAdmin.from("pulse_alert_deliveries")
            .update(status === "delivered" ? { status, delivered_at: now, updated_at: now } : { status: "bounced", bounced_at: now, last_error: type, updated_at: now })
            .eq("provider_message_id", messageId);
        }
        console.log(JSON.stringify({ event: "resend_webhook", type, messageId }));
        return Response.json({ ok: true });
      },
    },
  },
});

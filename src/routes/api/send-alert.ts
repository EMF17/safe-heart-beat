import { createFileRoute } from "@tanstack/react-router";

interface AlertPayload {
  contactName?: string;
  contactEmail?: string;
  type?: "test" | "missed";
}

export const Route = createFileRoute("/api/send-alert")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
          return Response.json(
            { error: "RESEND_API_KEY is not configured" },
            { status: 500 }
          );
        }

        let body: AlertPayload;
        try {
          body = (await request.json()) as AlertPayload;
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const contactName = (body.contactName ?? "").trim();
        const contactEmail = (body.contactEmail ?? "").trim();
        const type = body.type === "test" ? "test" : "missed";

        if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
          return Response.json(
            { error: "Valid contact email is required" },
            { status: 400 }
          );
        }
        const name = contactName || "Your contact";

        const subject =
          type === "test"
            ? `Pulse Safety Test Alert for ${name}`
            : `Pulse Safety Alert: ${name} missed two check-ins`;

        const bodyText =
          type === "test"
            ? `This is a test alert from Pulse. If ${name} ever misses two 48-hour check-ins, you'll receive a real alert at this email address. No location tracking. No automatic 911. This is an automated safety alert from Pulse.`
            : `${name} has not checked into Pulse for 96 hours. Please call or text them to make sure they're okay. No location tracking. No automatic 911. This is an automated safety alert from Pulse.`;

        const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;max-width:560px">
  <h2 style="font-size:18px;margin:0 0 16px">${subject}</h2>
  <p style="margin:0 0 16px">${bodyText}</p>
  <p style="margin:24px 0 0;font-size:12px;color:#888">Pulse Safety · pulse-checkin.app</p>
</div>`;

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Pulse Safety <alerts@pulse-checkin.app>",
            to: [contactEmail],
            subject,
            text: bodyText,
            html,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          return Response.json(
            { error: (data as any)?.message || "Failed to send email", details: data },
            { status: res.status }
          );
        }
        return Response.json({ success: true, id: (data as any)?.id });
      },
    },
  },
});

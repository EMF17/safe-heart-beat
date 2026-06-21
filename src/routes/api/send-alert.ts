import { createFileRoute } from "@tanstack/react-router";
import { emergencyNumbers } from "@/lib/emergency-numbers";

interface AlertPayload {
  contactName?: string;
  contactEmail?: string;
  type?: "test" | "missed";
  countryCode?: string;
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
        const countryCode = (body.countryCode ?? "").trim().toUpperCase();

        if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
          return Response.json(
            { error: "Valid contact email is required" },
            { status: 400 }
          );
        }
        const name = contactName || "Your contact";

        const country = countryCode
          ? emergencyNumbers.find((c) => c.code === countryCode) ?? null
          : null;

        const subject =
          type === "test"
            ? `Pulse Safety Test Alert for ${name}`
            : `Pulse Safety Alert: ${name} missed two check-ins`;

        const introText =
          type === "test"
            ? `This is a test alert from Pulse. If ${name} ever misses two 48-hour check-ins, you'll receive a real alert at this email address.`
            : `${name} has not checked into Pulse for 96 hours. Please call or text them to make sure they're okay.`;

        // Emergency section — calm, factual, no location data
        let emergencyText = "";
        let emergencyHtml = "";
        if (country && country.services.length > 0) {
          const lines = country.services.map(
            (s) => `${s.label}: ${s.number}`
          );
          emergencyText =
            `\n\nIf you cannot reach them, here is the emergency number for their region:\n` +
            `📍 Region: ${country.country}\n` +
            `🚨 Emergency:\n  ${lines.join("\n  ")}`;

          const serviceRows = country.services
            .map(
              (s) =>
                `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee"><span style="color:#555">${s.label}</span><span style="font-weight:600;color:#1a1a1a">${s.number}</span></div>`
            )
            .join("");
          emergencyHtml = `
  <div style="margin:20px 0;padding:16px 18px;background:#f5f9f6;border:1px solid #dbe7df;border-radius:10px">
    <p style="margin:0 0 10px;font-size:14px;color:#3a5a48">If you cannot reach them, here is the emergency number for their region:</p>
    <p style="margin:0 0 6px;font-size:14px;color:#1a1a1a">📍 <strong>Region:</strong> ${country.flag} ${country.country}</p>
    <div style="margin-top:8px">${serviceRows}</div>
  </div>`;
        } else {
          emergencyText =
            "\n\nIf you cannot reach them, please contact your local emergency services.";
          emergencyHtml = `
  <div style="margin:20px 0;padding:16px 18px;background:#f5f9f6;border:1px solid #dbe7df;border-radius:10px">
    <p style="margin:0;font-size:14px;color:#3a5a48">If you cannot reach them, please contact your local emergency services.</p>
  </div>`;
        }

        const footerText =
          "\n\nNo location tracking. No automatic 911. This is an automated safety alert from Pulse.";
        const bodyText = `${introText}${emergencyText}${footerText}`;

        const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;max-width:560px">
  <h2 style="font-size:18px;margin:0 0 16px">${subject}</h2>
  <p style="margin:0 0 8px">${introText}</p>
  ${emergencyHtml}
  <p style="margin:16px 0 0;font-size:13px;color:#666">No location tracking. No automatic 911. This is an automated safety alert from Pulse.</p>
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

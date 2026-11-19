import { createFileRoute } from "@tanstack/react-router";
import { emergencyNumbers, GLOBAL_FALLBACKS } from "@/lib/emergency-numbers";

interface AlertPayload {
  token?: string;
  type?: "test" | "missed";
  countryCode?: string;
}

export const Route = createFileRoute("/api/send-alert")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.RESEND_API_KEY;

        let body: AlertPayload;
        try {
          body = (await request.json()) as AlertPayload;
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const token = (body.token ?? "").trim();
        if (!token) {
          return Response.json(
            { error: "Authentication required" },
            { status: 401 }
          );
        }

        // Verify the caller's HMAC token and resolve their account.
        // Both modules are server-only; import inside the handler so they
        // never ship into the client bundle.
        const { verifyToken } = await import("@/lib/sync.server");
        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        let accountId: string;
        try {
          accountId = await verifyToken(token);
        } catch {
          return Response.json(
            { error: "Invalid or expired token" },
            { status: 401 }
          );
        }

        const { data: account, error: accErr } = await supabaseAdmin
          .from("pulse_accounts")
          .select("contact_email, contact_name, contact_phone, last_checkin")
          .eq("id", accountId)
          .single();
        if (accErr || !account) {
          return Response.json({ error: "Account not found" }, { status: 404 });
        }

        const contactEmail = (account.contact_email ?? "").trim();
        const contactName = (account.contact_name ?? "").trim();
        if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
          return Response.json(
            { error: "Account has no valid contact email" },
            { status: 400 }
          );
        }

        const type = body.type === "test" ? "test" : "missed";
        // Missed alerts only go out when the account is genuinely overdue
        // (shortest setting: two missed 24-hour windows).
        const MIN_OVERDUE_MS = 47 * 3600_000;
        const lastMs = account.last_checkin ? new Date(account.last_checkin).getTime() : NaN;
        if (type === "missed" && (!Number.isFinite(lastMs) || Date.now() - lastMs < MIN_OVERDUE_MS)) {
          return Response.json({ error: "No missed check-in to report" }, { status: 409 });
        }
        const escapeHtml = (v: string) =>
          v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
        const countryCode = (body.countryCode ?? "").trim().toUpperCase();
        const name = (contactName || "Your contact").replace(/[\r\n<>]/g, " ").slice(0, 80);

        const country = countryCode
          ? emergencyNumbers.find((c) => c.code === countryCode) ?? null
          : null;

        const subject =
          type === "test"
            ? `Pulse Safety Test Alert for ${name}`
            : `Pulse Safety Alert: ${name} missed two check-ins`;

        const introText =
          type === "test"
            ? `This is a test alert from Pulse. If ${name} ever misses two check-ins in a row, you'll receive a real alert at this email address.`
            : `${name} has missed two check-ins in a row on Pulse. Please call or text them to make sure they're okay.`;

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
          const fallbackLines = GLOBAL_FALLBACKS.map((s) => `${s.label}: ${s.number}`);
          emergencyText =
            "\n\nIf you cannot reach them, please contact your local emergency services.\n" +
            `Widely-used emergency numbers:\n  ${fallbackLines.join("\n  ")}`;
          emergencyHtml = `
  <div style="margin:20px 0;padding:16px 18px;background:#f5f9f6;border:1px solid #dbe7df;border-radius:10px">
    <p style="margin:0 0 10px;font-size:14px;color:#3a5a48">If you cannot reach them, please contact your local emergency services.</p>
    ${GLOBAL_FALLBACKS.map(
      (s) =>
        `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee"><span style="color:#555">${s.label}</span><span style="font-weight:600;color:#1a1a1a">${s.number}</span></div>`
    ).join("")}
  </div>`;
        }


        const footerText =
          "\n\nNo location tracking. No automatic 911. This is an automated safety alert from Pulse.";
        const bodyText = `${introText}${emergencyText}${footerText}`;

        const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;max-width:560px">
  <h2 style="font-size:18px;margin:0 0 16px">${escapeHtml(subject)}</h2>
  <p style="margin:0 0 8px">${escapeHtml(introText)}</p>
  ${emergencyHtml}
  <p style="margin:16px 0 0;font-size:13px;color:#666">No location tracking. No automatic 911. This is an automated safety alert from Pulse.</p>
  <p style="margin:24px 0 0;font-size:12px;color:#888">Pulse Safety · pulse-checkin.app</p>
</div>`;

        const { sendSms, smsConfigured } = await import("@/lib/sms.server");
        type Delivery = { status: "sent" | "already_sent" | "not_connected" | "no_number" | "failed" | "sending"; error?: string };
        // Receipts are independent: an email success never suppresses a pending SMS.
        // Test alerts are limited to one per account per day.
        const key = type === "test" ? `test-${new Date().toISOString().slice(0, 10)}` : (account.last_checkin ?? "no-checkin");
        const deliver = async (channel: "email" | "sms", send: () => Promise<Delivery>): Promise<Delivery> => {
          const { error: claimError } = await supabaseAdmin.from("pulse_alert_deliveries").insert({ account_id: accountId, checkin_key: key, channel });
          if (claimError) {
            const { data: receipt } = await supabaseAdmin.from("pulse_alert_deliveries").select("status").eq("account_id", accountId).eq("checkin_key", key).eq("channel", channel).maybeSingle();
            return { status: receipt?.status === "sent" ? "already_sent" : "sending" };
          }
          let result: Delivery;
          try { result = await send(); }
          catch (error) {
            console.error(`${channel} delivery failed`, error instanceof Error ? error.message : "Unknown error");
            result = { status: "failed", error: `Could not send ${channel}. Please try again.` };
          }
          if (result.status === "sent") {
            await supabaseAdmin.from("pulse_alert_deliveries").update({ status: "sent" }).eq("account_id", accountId).eq("checkin_key", key).eq("channel", channel);
          } else {
            await supabaseAdmin.from("pulse_alert_deliveries").delete().eq("account_id", accountId).eq("checkin_key", key).eq("channel", channel);
          }
          return result;
        };

        const [email, sms] = await Promise.all([
          apiKey ? deliver("email", async () => {
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

        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Resend failed [${res.status}]: ${errorBody}`);
          return { status: "failed", error: "Email provider did not accept the alert." };
        }
        return { status: "sent" };
          }) : Promise.resolve<Delivery>({ status: "not_connected" }),
          account.contact_phone && smsConfigured()
            ? deliver("sms", () => sendSms(account.contact_phone ?? "", `Pulse Safety: ${type === "test" ? "TEST — " : ""}${type === "test" ? "This is a test safety alert for" : "Two missed check-ins for"} ${name}. ${type === "test" ? "No action needed." : "Please call or text them to check they are okay."}${emergencyText}`))
            : Promise.resolve<Delivery>({ status: account.contact_phone ? "not_connected" : "no_number" }),
        ]);
        return Response.json({ success: email.status === "sent" || email.status === "already_sent" || sms.status === "sent" || sms.status === "already_sent", email, sms });
      },
    },
  },
});

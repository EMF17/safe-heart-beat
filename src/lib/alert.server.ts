import { MAX_SEND_ATTEMPTS, missedCycleKey, nextRetryAt, sendKey } from "@/lib/alert-state";
import { safeContactName } from "@/lib/contact-name";
import { emergencyNumbers, GLOBAL_FALLBACKS } from "@/lib/emergency-numbers";

/**
 * Server-only: build and send a test or missed-check-in alert for one account.
 * Used by the test-alert route and by the scheduled overdue sweep, so alerts
 * go out even when the user's phone is off or Pulse is closed.
 */
export async function sendAccountAlert(
  accountId: string,
  type: "test" | "missed",
  countryCodeInput?: string | null,
): Promise<Response> {
  const apiKey = process.env.RESEND_API_KEY;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: account, error: accErr } = await supabaseAdmin
            .from("pulse_accounts")
            .select("contact_email, contact_name, contact_phone, last_checkin, created_at, country_code")
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

                  // Missed alerts only go out when the account is genuinely overdue
          // (shortest setting: two missed 24-hour windows).
          const MIN_OVERDUE_MS = 47 * 3600_000;
          const lastMs = account.last_checkin ? new Date(account.last_checkin).getTime() : NaN;
          if (type === "missed" && (!Number.isFinite(lastMs) || Date.now() - lastMs < MIN_OVERDUE_MS)) {
            return Response.json({ error: "No missed check-in to report" }, { status: 409 });
          }
          // Limit mail to any single recipient across ALL accounts, so creating
          // throwaway accounts with someone else's address cannot flood them.
          const createdMs = new Date(account.created_at).getTime();
          if (type === "missed" && Date.now() - createdMs < MIN_OVERDUE_MS) {
            return Response.json({ error: "No missed check-in to report" }, { status: 409 });
          }
          const { isSuppressed, unsubscribeUrl } = await import("@/lib/email-suppression.server");
          if (await isSuppressed(contactEmail)) {
            return Response.json({ error: "This contact has asked not to receive Pulse emails." }, { status: 403 });
          }
          const likeEmail = contactEmail.replace(/[\\%_]/g, (c) => `\\${c}`);
          const { data: sameRecipient } = await supabaseAdmin
            .from("pulse_accounts").select("id").ilike("contact_email", likeEmail).limit(200);
          const recipientAccounts = (sameRecipient ?? []).map((r) => r.id);
          if (!recipientAccounts.includes(accountId)) recipientAccounts.push(accountId);
          const windowMs = type === "test" ? 7 * 86400_000 : 86400_000;
          const key = type === "test" ? `test-${new Date().toISOString().slice(0, 10)}` : missedCycleKey(lastMs);
          let recentQuery = supabaseAdmin.from("pulse_alert_deliveries")
            .select("account_id", { count: "exact", head: true })
            .in("account_id", recipientAccounts).eq("channel", "email")
            .neq("checkin_key", key).not("status", "in", "(failed,dead)")
            .gte("created_at", new Date(Date.now() - windowMs).toISOString());
          recentQuery = type === "test" ? recentQuery.like("checkin_key", "test-%") : recentQuery.not("checkin_key", "like", "test-%");
          const { count: recentCount, error: recentErr } = await recentQuery;
          if (recentErr || (recentCount ?? 0) > 0) {
            return Response.json(
              { error: type === "test" ? "A test alert was already sent to this address this week." : "An alert was already sent to this address today." },
              { status: 429 }
            );
          }
          const escapeHtml = (v: string) =>
            v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
          const countryCode = (countryCodeInput ?? account.country_code ?? "").trim().toUpperCase();
          const name = safeContactName(contactName);

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
            "\n\nNo location tracking. No automatic 911. This is an automated safety alert from Pulse." +
            `\nDon't want Pulse emails? ${unsubscribeUrl(contactEmail)}`;
          const bodyText = `${introText}${emergencyText}${footerText}`;

          const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;max-width:560px">
    <h2 style="font-size:18px;margin:0 0 16px">${escapeHtml(subject)}</h2>
    <p style="margin:0 0 8px">${escapeHtml(introText)}</p>
    ${emergencyHtml}
    <p style="margin:16px 0 0;font-size:13px;color:#666">No location tracking. No automatic 911. This is an automated safety alert from Pulse.</p>
    <p style="margin:24px 0 0;font-size:12px;color:#888">Pulse Safety · pulse-checkin.app · <a href="${escapeHtml(unsubscribeUrl(contactEmail))}" style="color:#888">Stop Pulse emails to this address</a></p>
  </div>`;

          const { sendSms, smsConfigured } = await import("@/lib/sms.server");
          type Delivery = { status: "sent" | "already_sent" | "not_connected" | "no_number" | "failed" | "sending"; error?: string };
          // Receipts are independent: an email success never suppresses a pending SMS.
          // Each (account, cycle, channel) row is a unique send key. Claiming it is
          // atomic, so overlapping sweeps or retries can never send twice; failures
          // are kept with backoff so the next sweep retries the SAME key.
          const deliver = async (channel: "email" | "sms", send: (idemKey: string) => Promise<Delivery & { providerId?: string }>): Promise<Delivery> => {
            const sk = sendKey(accountId, key, channel);
            const { error: claimError } = await supabaseAdmin.from("pulse_alert_deliveries")
              .insert({ account_id: accountId, checkin_key: key, channel, send_key: sk, status: "sending", attempts: 1 });
            let attempts = 1;
            if (claimError) {
              const { data: receipt } = await supabaseAdmin.from("pulse_alert_deliveries")
                .select("status, attempts, next_attempt_at, updated_at").eq("account_id", accountId).eq("checkin_key", key).eq("channel", channel).maybeSingle();
              if (!receipt) return { status: "sending" };
              const due = !receipt.next_attempt_at || new Date(receipt.next_attempt_at).getTime() <= Date.now();
              // A "sending" row older than 15 minutes means the worker died mid-send;
              // retrying is safe because the provider de-duplicates on the same key.
              const stuck = receipt.status === "sending" && Date.now() - new Date(receipt.updated_at).getTime() > 15 * 60_000;
              if (!(stuck || receipt.status === "failed") || !due || receipt.attempts >= MAX_SEND_ATTEMPTS) {
                return { status: ["sent", "delivered", "bounced"].includes(receipt.status) ? "already_sent" : receipt.status === "failed" ? "failed" : "sending" };
              }
              // Compare-and-set on the attempt count: only one retry wins.
              const { data: won } = await supabaseAdmin.from("pulse_alert_deliveries")
                .update({ status: "sending", attempts: receipt.attempts + 1, send_key: sk, updated_at: new Date().toISOString() })
                .eq("account_id", accountId).eq("checkin_key", key).eq("channel", channel)
                .eq("status", receipt.status).eq("attempts", receipt.attempts).select("attempts");
              if (!won?.length) return { status: "sending" };
              attempts = receipt.attempts + 1;
            }
            let result: Delivery & { providerId?: string };
            try { result = await send(sk); }
            catch (error) {
              console.error(`${channel} delivery failed`, error instanceof Error ? error.message : "Unknown error");
              result = { status: "failed", error: `Could not send ${channel}. Please try again.` };
            }
            const now = Date.now();
            const retryAt = nextRetryAt(attempts, now);
            const update = result.status === "sent"
              ? { status: "sent", provider_message_id: result.providerId ?? null, last_error: null, next_attempt_at: null }
              : { status: retryAt === null ? "dead" : "failed", last_error: (result.error ?? result.status).slice(0, 300), next_attempt_at: retryAt === null ? null : new Date(retryAt).toISOString() };
            if (result.status !== "sent" && type === "test") {
              // Failed tests are not retried automatically; free the key so the user can try again.
              await supabaseAdmin.from("pulse_alert_deliveries").delete().eq("account_id", accountId).eq("checkin_key", key).eq("channel", channel);
              return { status: result.status, ...(result.error ? { error: result.error } : {}) };
            }
            await supabaseAdmin.from("pulse_alert_deliveries").update({ ...update, updated_at: new Date(now).toISOString() })
              .eq("account_id", accountId).eq("checkin_key", key).eq("channel", channel);
            if (result.status === "sent" && channel === "email" && type === "missed") {
              await supabaseAdmin.from("pulse_accounts").update({ alert_state: "alerted", alert_state_changed_at: new Date(now).toISOString() }).eq("id", accountId);
            }
            console.log(JSON.stringify({ event: "alert_delivery", type, channel, sendKey: sk, attempts, status: update.status }));
            return { status: result.status, ...(result.error ? { error: result.error } : {}) };
          };

          const [email, sms] = await Promise.all([
            apiKey ? deliver("email", async (idemKey) => {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              // Resend also de-duplicates on this key for 24h.
              "Idempotency-Key": idemKey,
            },
            body: JSON.stringify({
              from: "Pulse Safety <alerts@pulse-checkin.app>",
              to: [contactEmail],
              subject,
              text: bodyText,
              html,
              headers: {
                "List-Unsubscribe": `<${unsubscribeUrl(contactEmail)}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
            }),
          });

          if (!res.ok) {
            const errorBody = await res.text();
            console.error(`Resend failed [${res.status}]: ${errorBody}`);
            return { status: "failed", error: `Email provider did not accept the alert (${res.status}).` };
          }
          const sentBody = (await res.json().catch(() => ({}))) as { id?: string };
          return { status: "sent", ...(sentBody.id ? { providerId: sentBody.id } : {}) };
            }) : Promise.resolve<Delivery>({ status: "not_connected" }),
            account.contact_phone && smsConfigured()
              ? deliver("sms", () => sendSms(account.contact_phone ?? "", `Pulse Safety: ${type === "test" ? "TEST — " : ""}${type === "test" ? "This is a test safety alert for" : "Two missed check-ins for"} ${name}. ${type === "test" ? "No action needed." : "Please call or text them to check they are okay."}${emergencyText} Reply STOP to opt out.`))
              : Promise.resolve<Delivery>({ status: account.contact_phone ? "not_connected" : "no_number" }),
          ]);
          return Response.json({ success: email.status === "sent" || email.status === "already_sent" || sms.status === "sent" || sms.status === "already_sent", email, sms });
}

import { createHmac, timingSafeEqual } from "crypto";
import { safeContactName } from "@/lib/contact-name";
import { CONFIRMATION_RECIPIENT_GAP_MS } from "./contact-protection";

const norm = (e: string) => e.trim().toLowerCase();
function secret(): string {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!k) throw new Error("Missing signing secret");
  return k;
}
export function consentSig(accountId: string, email: string): string {
  return createHmac("sha256", secret()).update(`consent:${accountId}:${norm(email)}`).digest("base64url").slice(0, 32);
}
export function verifyConsent(accountId: string, email: string, sig: string): boolean {
  const a = Buffer.from(consentSig(accountId, email)); const b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function isContactConfirmed(a: { contact_email: string | null; contact_confirmed_email: string | null }): boolean {
  return !!a.contact_email && !!a.contact_confirmed_email && norm(a.contact_email) === norm(a.contact_confirmed_email);
}

const ACCOUNT_GAP_MS = 10 * 60_000;
const RECIPIENT_GAP_MS = CONFIRMATION_RECIPIENT_GAP_MS;

/** Sends the one-time "X named you as their safety contact" email. */
export async function sendConsentRequest(accountId: string): Promise<{ status: "sent" | "confirmed" | "wait" | "blocked" | "failed"; error?: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: a } = await supabaseAdmin.from("pulse_accounts")
    .select("contact_email, contact_confirmed_email, contact_confirm_sent_at, user_name").eq("id", accountId).maybeSingle();
  const email = (a?.contact_email ?? "").trim();
  if (!a || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { status: "failed", error: "No valid contact email saved." };
  if (isContactConfirmed(a)) return { status: "confirmed" };
  const { isSuppressed, unsubscribeUrl } = await import("@/lib/email-suppression.server");
  if (await isSuppressed(email)) return { status: "blocked", error: "This contact has asked not to receive Pulse emails." };
  if (a.contact_confirm_sent_at && Date.now() - new Date(a.contact_confirm_sent_at).getTime() < ACCOUNT_GAP_MS) {
    return { status: "wait", error: "A confirmation email was sent a few minutes ago. Please wait before sending another." };
  }
  // One confirmation request per address per day across ALL records.
  const like = email.replace(/[\\%_]/g, (c) => `\\${c}`);
  const { count } = await supabaseAdmin.from("pulse_accounts").select("id", { count: "exact", head: true })
    .ilike("contact_email", like).gte("contact_confirm_sent_at", new Date(Date.now() - RECIPIENT_GAP_MS).toISOString());
  if ((count ?? 0) > 0) return { status: "wait", error: "This address already received a confirmation request today. Please try again tomorrow." };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { status: "failed", error: "Email is not configured." };
  // Claim the send slot first so double clicks can't send twice.
  const nowIso = new Date().toISOString();
  let claim = supabaseAdmin.from("pulse_accounts").update({ contact_confirm_sent_at: nowIso }).eq("id", accountId);
  claim = a.contact_confirm_sent_at ? claim.eq("contact_confirm_sent_at", a.contact_confirm_sent_at) : claim.is("contact_confirm_sent_at", null);
  const { data: won } = await claim.select("id");
  if (!won?.length) return { status: "wait", error: "A confirmation email is already being sent." };

  const requestId = crypto.randomUUID();
  const { error: receiptError } = await supabaseAdmin.from("pulse_contact_requests")
    .insert({ id: requestId, account_id: accountId, recipient_email: norm(email), created_at: nowIso });
  if (receiptError) return { status: "failed", error: "Could not record the confirmation request. Please try later." };

  const who = safeContactName(a.user_name) === "Your contact" ? "Someone" : safeContactName(a.user_name);
  const link = `https://pulse-checkin.app/api/public/confirm-contact?a=${accountId}&e=${encodeURIComponent(norm(email))}&s=${consentSig(accountId, email)}`;
  const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
  const subject = `${who} named you as their Pulse safety contact — please confirm`;
  const text = `${who} named you as their safety contact on Pulse, a daily check-in app.\n\nIf they miss two check-ins in a row, Pulse will email you so you can check on them. You will get no alerts unless you confirm.\n\nConfirm: ${link}\n\nDon't know them or don't want this? Ignore this email, or stop all Pulse emails: ${unsubscribeUrl(email)}`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;max-width:560px">
<h2 style="font-size:18px;margin:0 0 16px">${esc(who)} named you as their safety contact</h2>
<p>${esc(who)} uses Pulse, a daily check-in app. If they miss two check-ins in a row, Pulse will email you so you can check on them.</p>
<p><strong>You will get no alerts unless you confirm.</strong></p>
<p style="margin:24px 0"><a href="${esc(link)}" style="background:#1f4d3a;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Confirm I'm their contact</a></p>
<p style="font-size:13px;color:#666">Don't know them or don't want this? Ignore this email — nothing more will be sent unless they ask again — or <a href="${esc(unsubscribeUrl(email))}" style="color:#666">stop all Pulse emails</a>.</p>
<p style="margin:24px 0 0;font-size:12px;color:#888">Pulse Safety · pulse-checkin.app</p></div>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `consent-${accountId}-${nowIso}` },
    body: JSON.stringify({ from: "Pulse Safety <alerts@pulse-checkin.app>", to: [email], subject, text, html,
      headers: { "List-Unsubscribe": `<${unsubscribeUrl(email)}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } }),
  });
  if (!res.ok) {
    console.error(`Consent email failed [${res.status}]: ${await res.text()}`);
    await supabaseAdmin.from("pulse_contact_requests").update({ status: "failed" }).eq("id", requestId);
    return { status: "failed", error: `Email provider did not accept the message (${res.status}).` };
  }
  const sent = await res.json() as { id?: unknown };
  if (typeof sent.id !== "string") return { status: "failed", error: "The email provider did not return a delivery reference." };
  const { error: saveError } = await supabaseAdmin.from("pulse_contact_requests")
    .update({ provider_message_id: sent.id, status: "sent" }).eq("id", requestId);
  if (saveError) return { status: "failed", error: "Email accepted, but its delivery status could not be saved. Do not assume it arrived." };
  return { status: "sent" };
}

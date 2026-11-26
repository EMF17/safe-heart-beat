import { createHmac, timingSafeEqual } from "crypto";
import { graceCycleKey, isValidEmail } from "@/lib/grace";

const norm = (e: string) => e.trim().toLowerCase();
const FROM = "Pulse Safety <alerts@pulse-checkin.app>";
const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
function sign(payload: string): string {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!k) throw new Error("Missing signing secret");
  return createHmac("sha256", k).update(payload).digest("base64url").slice(0, 32);
}
function eq(a: string, b: string) { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); }
export const ownerSig = (id: string, email: string) => sign(`owner:${id}:${norm(email)}`);
export const verifyOwner = (id: string, email: string, s: string) => eq(ownerSig(id, email), s);
/** Check-in link is bound to one missed cycle; it stops working after any newer check-in. */
export const checkinSig = (id: string, lastMs: number) => sign(`checkin:${id}:${Math.floor(lastMs)}`);
export const verifyCheckin = (id: string, lastMs: number, s: string) => eq(checkinSig(id, lastMs), s);

async function resend(to: string, subject: string, text: string, html: string, idem: string, unsub: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false as const, error: "Email is not configured." };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": idem },
    body: JSON.stringify({ from: FROM, to: [to], subject, text, html, headers: { "List-Unsubscribe": `<${unsub}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } }),
  });
  if (!res.ok) { const body = await res.text(); console.error(`Grace email failed [${res.status}]: ${body}`); return { ok: false as const, error: `Email provider did not accept the message (${res.status}).` }; }
  const d = await res.json() as { id?: unknown };
  return { ok: true as const, id: typeof d.id === "string" ? d.id : null };
}

export async function readOwnerReminder(accountId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("pulse_accounts").select("owner_email, owner_confirmed_email, owner_confirm_sent_at").eq("id", accountId).maybeSingle();
  const email = data?.owner_email ?? null;
  return { email, confirmed: !!email && !!data?.owner_confirmed_email && norm(email) === norm(data.owner_confirmed_email), sentAt: data?.owner_confirm_sent_at ?? null };
}

/** Save (or clear) the user's own email and send a one-time confirmation link. */
export async function saveOwnerEmail(accountId: string, input: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const email = norm(input);
  if (!email) {
    await supabaseAdmin.from("pulse_accounts").update({ owner_email: null, owner_confirmed_email: null }).eq("id", accountId);
    return { status: "cleared" as const };
  }
  if (!isValidEmail(email)) return { status: "failed" as const, error: "Please enter a valid email address." };
  const cur = await readOwnerReminder(accountId);
  if (cur.confirmed && cur.email && norm(cur.email) === email) return { status: "confirmed" as const };
  const { isSuppressed, unsubscribeUrl } = await import("@/lib/email-suppression.server");
  if (await isSuppressed(email)) return { status: "blocked" as const, error: "This address has asked not to receive Pulse emails." };
  if (cur.sentAt && Date.now() - new Date(cur.sentAt).getTime() < 10 * 60_000) return { status: "wait" as const, error: "A confirmation was sent a few minutes ago. Please wait before trying again." };
  const like = email.replace(/[\\%_]/g, (c) => `\\${c}`);
  const { count } = await supabaseAdmin.from("pulse_accounts").select("id", { count: "exact", head: true })
    .ilike("owner_email", like).gte("owner_confirm_sent_at", new Date(Date.now() - 86400_000).toISOString());
  if ((count ?? 0) > 0) return { status: "wait" as const, error: "This address already got a confirmation today. Please try tomorrow." };
  const nowIso = new Date().toISOString();
  let claim = supabaseAdmin.from("pulse_accounts").update({ owner_email: email, owner_confirm_sent_at: nowIso }).eq("id", accountId);
  claim = cur.sentAt ? claim.eq("owner_confirm_sent_at", cur.sentAt) : claim.is("owner_confirm_sent_at", null);
  const { data: won } = await claim.select("id");
  if (!won?.length) return { status: "wait" as const, error: "A confirmation is already being sent." };
  const link = `https://pulse-checkin.app/api/public/confirm-owner?a=${accountId}&e=${encodeURIComponent(email)}&s=${ownerSig(accountId, email)}`;
  const unsub = unsubscribeUrl(email);
  const r = await resend(email, "Confirm your email for Pulse reminders",
    `Confirm this address to get an "Are you OK?" email from Pulse if you miss a check-in, before your contact is alerted.\n\nConfirm: ${link}\n\nDidn't ask for this? Ignore it, or stop all Pulse emails: ${unsub}`,
    `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.55;max-width:560px"><h2 style="font-size:18px">Confirm your email for Pulse reminders</h2><p>If you miss a check-in, Pulse will email you "Are you OK?" first, before your safety contact is alerted.</p><p style="margin:24px 0"><a href="${esc(link)}" style="background:#1f4d3a;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Confirm my email</a></p><p style="font-size:13px;color:#666">Didn't ask for this? Ignore it, or <a href="${esc(unsub)}" style="color:#666">stop all Pulse emails</a>.</p></div>`,
    `owner-confirm-${accountId}-${nowIso}`, unsub);
  if (!r.ok) return { status: "failed" as const, error: r.error };
  return { status: "sent" as const };
}

/** Sends the "Are you OK? Tap to check in" email once per missed cycle. */
export async function sendGraceReminder(accountId: string): Promise<"sent" | "skipped" | "failed"> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: a } = await supabaseAdmin.from("pulse_accounts")
    .select("owner_email, owner_confirmed_email, last_checkin, interval_ms, contact_name").eq("id", accountId).maybeSingle();
  if (!a?.last_checkin || !a.owner_email || !a.owner_confirmed_email || norm(a.owner_email) !== norm(a.owner_confirmed_email)) return "skipped";
  const { isSuppressed, unsubscribeUrl } = await import("@/lib/email-suppression.server");
  if (await isSuppressed(a.owner_email)) return "skipped";
  const lastMs = new Date(a.last_checkin).getTime();
  const key = graceCycleKey(lastMs);
  await supabaseAdmin.from("pulse_grace_reminders").delete().eq("account_id", accountId).eq("cycle_key", key).eq("status", "failed");
  const { error: claimErr } = await supabaseAdmin.from("pulse_grace_reminders").insert({ account_id: accountId, cycle_key: key });
  if (claimErr) return "skipped"; // already claimed by another run
  const alertAt = new Date(lastMs + 2 * a.interval_ms);
  const link = `https://pulse-checkin.app/api/public/checkin-link?a=${accountId}&t=${Math.floor(lastMs)}&s=${checkinSig(accountId, lastMs)}`;
  const unsub = unsubscribeUrl(a.owner_email);
  const when = alertAt.toUTCString().replace(" GMT", " UTC");
  const r = await resend(a.owner_email, "Are you OK? Tap to check in",
    `You missed your Pulse check-in. If you're OK, check in here: ${link}\n\nIf you don't check in by ${when}, Pulse will email your safety contact.\n\nStop all Pulse emails: ${unsub}`,
    `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.55;max-width:560px"><h2 style="font-size:20px">Are you OK?</h2><p>You missed your Pulse check-in.</p><p style="margin:24px 0"><a href="${esc(link)}" style="background:#1f4d3a;color:#fff;padding:14px 22px;border-radius:8px;text-decoration:none;font-size:17px">I'm OK — check in</a></p><p>If you don't check in by <strong>${esc(when)}</strong>, Pulse will email your safety contact.</p><p style="font-size:13px;color:#666"><a href="${esc(unsub)}" style="color:#666">Stop all Pulse emails</a></p></div>`,
    `${accountId}:${key}`, unsub);
  await supabaseAdmin.from("pulse_grace_reminders").update(r.ok ? { status: "sent", provider_message_id: r.id } : { status: "failed" })
    .eq("account_id", accountId).eq("cycle_key", key);
  return r.ok ? "sent" : "failed";
}

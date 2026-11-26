import { isContactConfirmed } from "./contact-consent.server";
import { confirmationResendAt, latestContactEmailBounced } from "./contact-protection";

export async function readContactProtection(accountId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: account, error } = await supabaseAdmin.from("pulse_accounts")
    .select("contact_email, contact_confirmed_email, contact_confirm_sent_at").eq("id", accountId).maybeSingle();
  if (error || !account) throw new Error("Unable to check saved contact");
  const email = account.contact_email.trim().toLowerCase();
  const [requests, alerts] = await Promise.all([
    supabaseAdmin.from("pulse_contact_requests").select("status, created_at")
      .eq("account_id", accountId).eq("recipient_email", email).in("status", ["bounced", "delivered"])
      .order("created_at", { ascending: false }).limit(1),
    supabaseAdmin.from("pulse_alert_deliveries").select("status, created_at")
      .eq("account_id", accountId).eq("recipient_email", email).eq("channel", "email").in("status", ["bounced", "delivered"])
      .order("created_at", { ascending: false }).limit(1),
  ]);
  if (requests.error || alerts.error) throw new Error("Unable to check email delivery");
  const { isSuppressed } = await import("./email-suppression.server");
  return {
    email, confirmed: isContactConfirmed(account),
    bounced: latestContactEmailBounced([...(requests.data ?? []), ...(alerts.data ?? [])]),
    blocked: await isSuppressed(email),
    requestSentAt: account.contact_confirm_sent_at,
    resendAt: confirmationResendAt(account.contact_confirm_sent_at),
  };
}
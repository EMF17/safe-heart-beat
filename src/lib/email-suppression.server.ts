import { createHmac, timingSafeEqual } from "crypto";

function secret(): string {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!k) throw new Error("Missing signing secret");
  return k;
}
const norm = (e: string) => e.trim().toLowerCase();
export function unsubscribeSig(email: string): string {
  return createHmac("sha256", secret()).update(`unsub:${norm(email)}`).digest("base64url").slice(0, 32);
}
export function verifyUnsubscribe(email: string, sig: string): boolean {
  const a = Buffer.from(unsubscribeSig(email)); const b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function unsubscribeUrl(email: string): string {
  return `https://pulse-checkin.app/api/public/unsubscribe?e=${encodeURIComponent(norm(email))}&s=${unsubscribeSig(email)}`;
}
export async function isSuppressed(email: string): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("pulse_email_suppressions").select("email_lower").eq("email_lower", norm(email)).maybeSingle();
  return !!data;
}
export async function suppress(email: string, reason: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("pulse_email_suppressions").upsert({ email_lower: norm(email).slice(0, 320), reason: reason.slice(0, 40) }, { onConflict: "email_lower" });
}

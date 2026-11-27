import { createHmac } from "crypto";

/** Durable custom limiter; buckets store fingerprints, never bearer secrets or IPs. */
export async function enforceTokenLimit(token: string, ip: string, kind: "device" | "link") {
  const secret = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!secret) throw new Error("Missing signing secret");
  const fingerprint = (value: string) => createHmac("sha256", secret).update(value).digest("base64url");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const hit = async (bucket: string, limit: number) => {
    const { data, error } = await supabaseAdmin.rpc("pulse_rate_hit", {
      _bucket: bucket, _limit: limit, _window_seconds: 900,
    });
    if (error || data !== true) throw new Error("Too many requests. Please wait 15 minutes and try again.");
  };
  await hit(`token-ip:${kind}:${fingerprint(`ip:${ip}`)}`, 300);
  await hit(`token:${kind}:${fingerprint(`token:${token}`)}`, 120);
}
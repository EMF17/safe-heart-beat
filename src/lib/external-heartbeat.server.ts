export type ExternalHeartbeatResult = "accepted" | "not_configured" | "invalid_configuration" | "failed";

// Private success URLs only. Never send contact data, follow redirects, or log the URL.
export function validHealthchecksUrl(value: string | undefined): boolean {
  return Boolean(value && /^https:\/\/hc-ping\.com\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/?$/i.test(value));
}

export async function pingExternalHeartbeat(): Promise<ExternalHeartbeatResult> {
  const url = process.env["HEALTHCHECKS_PING_URL"];
  if (!url) return "not_configured";
  if (!validHealthchecksUrl(url)) return "invalid_configuration";
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "error",
      signal: AbortSignal.timeout(3_000),
    });
    // Healthchecks can return HTTP 200 for unknown or rate-limited checks.
    return response.ok && (await response.text()).trim() === "OK" ? "accepted" : "failed";
  } catch {
    return "failed";
  }
}
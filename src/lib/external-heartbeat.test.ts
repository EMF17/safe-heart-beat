import { afterEach, describe, expect, it, vi } from "vitest";
import { pingExternalHeartbeat } from "./external-heartbeat.server";

// Synthetic check address, not a provider credential. Requests are always mocked.
const testUrl = "https://hc-ping.com/00000000-0000-0000-0000-000000000000";
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("external completion heartbeat", () => {
  it("sends an empty success ping to the configured external check", async () => {
    vi.stubEnv("HEALTHCHECKS_PING_URL", testUrl);
    const request = vi.fn().mockResolvedValue(new Response("OK"));
    vi.stubGlobal("fetch", request);
    expect(await pingExternalHeartbeat()).toBe("accepted");
    expect(request).toHaveBeenCalledWith(testUrl, expect.objectContaining({ method: "GET", redirect: "error" }));
    expect(request.mock.calls[0]?.[1]).not.toHaveProperty("body");
  });
  it("does not claim monitoring is connected without a private ping URL", async () => {
    vi.stubEnv("HEALTHCHECKS_PING_URL", "");
    const request = vi.fn(); vi.stubGlobal("fetch", request);
    expect(await pingExternalHeartbeat()).toBe("not_configured");
    expect(request).not.toHaveBeenCalled();
  });
  it("rejects destinations outside Healthchecks.io", async () => {
    vi.stubEnv("HEALTHCHECKS_PING_URL", "https://example.com/ping");
    const request = vi.fn(); vi.stubGlobal("fetch", request);
    expect(await pingExternalHeartbeat()).toBe("invalid_configuration");
    expect(request).not.toHaveBeenCalled();
  });
  it("does not mistake an unknown check's HTTP 200 for an accepted heartbeat", async () => {
    vi.stubEnv("HEALTHCHECKS_PING_URL", testUrl);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("not found")));
    expect(await pingExternalHeartbeat()).toBe("failed");
  });
  it("reports network failure without exposing the private URL", async () => {
    vi.stubEnv("HEALTHCHECKS_PING_URL", testUrl);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network failure")));
    expect(await pingExternalHeartbeat()).toBe("failed");
  });
});
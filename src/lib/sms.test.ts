import { afterEach, describe, expect, it, vi } from "vitest";
import { sendSms, smsConfigured } from "./sms.server";
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe("SMS is retired", () => {
  it("does not send anything before Twilio is connected", async () => {
    vi.stubEnv("TWILIO_API_KEY", "");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect(await sendSms("+85291234567", "test")).toEqual({ status: "not_connected" });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("never sends SMS even if old credentials remain configured", async () => {
    vi.stubEnv("TWILIO_API_KEY", "test-connection");
    vi.stubEnv("LOVABLE_API_KEY", "test-gateway");
    vi.stubEnv("TWILIO_FROM_NUMBER", "+15555550100");
    const fetch = vi.fn().mockResolvedValue(new Response('{}', {status:200}));
    vi.stubGlobal("fetch", fetch);
    expect(smsConfigured()).toBe(false);
    expect(await sendSms("+85291234567", "test")).toEqual({status:"not_connected"});
    expect(fetch).not.toHaveBeenCalled();
  });
});
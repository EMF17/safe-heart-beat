import { afterEach, describe, expect, it, vi } from "vitest";
import { sendSms } from "./sms.server";
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe("SMS alongside email", () => {
  it("does not send anything before Twilio is connected", async () => {
    vi.stubEnv("TWILIO_API_KEY", "");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect(await sendSms("+85291234567", "test")).toEqual({ status: "not_connected" });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("uses Twilio's gateway to send to the saved contact after connection", async () => {
    vi.stubEnv("TWILIO_API_KEY", "test-connection");
    vi.stubEnv("LOVABLE_API_KEY", "test-gateway");
    vi.stubEnv("TWILIO_FROM_NUMBER", "+15555550100");
    const fetch = vi.fn().mockResolvedValue(new Response('{}', {status:200}));
    vi.stubGlobal("fetch", fetch);
    expect(await sendSms("+85291234567", "test")).toEqual({status:"sent"});
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("https://connector-gateway.lovable.dev/twilio/Messages.json");
    expect(init.body.get("To")).toBe("+85291234567");
    expect(init.body.get("From")).toBe("+15555550100");
  });
});
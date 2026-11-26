import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ read: vi.fn(), insert: vi.fn(), receiptUpdate: vi.fn(), fetch: vi.fn() }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: {
  from: (table: string) => {
    if (table === "pulse_contact_requests") return {
      insert: mocks.insert,
      update: (value: unknown) => ({ eq: (column: string, id: string) => mocks.receiptUpdate(value, column, id) }),
    };
    const read = {
      eq: () => read, maybeSingle: mocks.read,
      ilike: () => read, gte: async () => ({ count: 0, error: null }),
    };
    const claim = { eq: () => claim, is: () => claim, select: async () => ({ data: [{ id: "account-test" }] }) };
    return { select: () => read, update: () => claim };
  },
} }));
vi.mock("@/lib/email-suppression.server", () => ({ isSuppressed: async () => false, unsubscribeUrl: () => "https://pulse-checkin.app/test-unsubscribe" }));
import { sendConsentRequest } from "./contact-consent.server";
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-only-signing");
  vi.stubEnv("RESEND_API_KEY", "test-only-provider");
  vi.stubGlobal("fetch", mocks.fetch);
  mocks.read.mockResolvedValue({ data: { contact_email: "SAM@example.com", contact_confirmed_email: null, contact_confirm_sent_at: null, user_name: "Alex" } });
  mocks.insert.mockResolvedValue({ error: null });
  mocks.receiptUpdate.mockResolvedValue({ error: null });
  mocks.fetch.mockResolvedValue(new Response('{"id":"provider-test"}', { status: 200 }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe("confirmation receipt tracking", () => {
  it("saves the actual stored recipient and provider reference for bounce tracking", async () => {
    expect(await sendConsentRequest("account-test")).toEqual({ status: "sent" });
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ account_id: "account-test", recipient_email: "sam@example.com" }));
    expect(mocks.receiptUpdate).toHaveBeenCalledWith({ provider_message_id: "provider-test", status: "sent" }, "id", expect.any(String));
  });
  it("does not send when a receipt cannot be recorded", async () => {
    mocks.insert.mockResolvedValue({ error: { message: "failed" } });
    expect((await sendConsentRequest("account-test")).status).toBe("failed");
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("records rejected messages as failed, not delivered", async () => {
    mocks.fetch.mockResolvedValue(new Response("Rejected", { status: 403 }));
    expect((await sendConsentRequest("account-test")).status).toBe("failed");
    expect(mocks.receiptUpdate).toHaveBeenCalledWith({ status: "failed" }, "id", expect.any(String));
  });
});
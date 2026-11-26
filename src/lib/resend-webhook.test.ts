import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ verify: vi.fn(), insert: vi.fn(), update: vi.fn(), suppress: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (options: unknown) => ({ options }) }));
vi.mock("@/lib/svix-verify", () => ({ verifySvixSignature: mocks.verify }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: {
  from: () => ({ insert: mocks.insert, update: () => ({ eq: mocks.update }) }),
} }));
vi.mock("@/lib/email-suppression.server", () => ({ suppress: mocks.suppress }));
import { Route } from "../routes/api/public/webhooks/resend";
const post = (Route as unknown as { options: { server: { handlers: { POST: (input: { request: Request }) => Promise<Response> } } } }).options.server.handlers.POST;
const run = () => post({ request: new Request("https://pulse-checkin.app/api/public/webhooks/resend", {
  method: "POST", headers: { "svix-id": "event-test", "svix-timestamp": "123", "svix-signature": "test" },
  body: JSON.stringify({ type: "email.bounced", data: { email_id: "email-test" } }),
}) });
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv("RESEND_WEBHOOK_SECRET", "test-only");
  mocks.verify.mockResolvedValue(true);
  mocks.insert.mockResolvedValue({ error: null });
  mocks.update.mockResolvedValue({ error: null });
});
afterEach(() => vi.unstubAllEnvs());
describe("bounce event processing", () => {
  it("records signed bounces for receipt reconciliation", async () => {
    expect((await run()).status).toBe(200);
    expect(mocks.insert).toHaveBeenCalledWith({ event_id: "event-test", provider_message_id: "email-test", event_type: "email.bounced" });
    expect(mocks.update).toHaveBeenCalledWith("provider_message_id", "email-test");
  });
  it("rejects unsigned bounces before touching records", async () => {
    mocks.verify.mockResolvedValue(false);
    expect((await run()).status).toBe(401);
    expect(mocks.insert).not.toHaveBeenCalled();
  });
  it("asks Resend to retry temporary event-storage failures", async () => {
    mocks.insert.mockResolvedValue({ error: { code: "08006" } });
    expect((await run()).status).toBe(503);
  });
  it("retries receipt updates after an event has already been recorded", async () => {
    mocks.insert.mockResolvedValue({ error: { code: "23505" } });
    expect((await run()).status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith("provider_message_id", "email-test");
  });
});
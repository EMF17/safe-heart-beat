import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(), rpc: vi.fn(), upsert: vi.fn(), update: vi.fn(), send: vi.fn(), ping: vi.fn(), events: [] as string[],
}));
vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (options: unknown) => ({ options }) }));
vi.mock("@/integrations/supabase/cron-auth", () => ({ authenticateCronRequest: mocks.auth }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: {
  rpc: mocks.rpc,
  from: () => ({ upsert: mocks.upsert, update: (value: Record<string, unknown>) => ({ eq: () => mocks.update(value) }) }),
} }));
vi.mock("@/lib/alert.server", () => ({ sendAccountAlert: mocks.send }));
vi.mock("@/lib/external-heartbeat.server", () => ({ pingExternalHeartbeat: mocks.ping }));
import { Route } from "../routes/api/public/cron/overdue-alerts";

const post = (Route as unknown as { options: { server: { handlers: { POST: (input: { request: Request }) => Promise<Response> } } } }).options.server.handlers.POST;
const run = () => post({ request: new Request("https://pulse-checkin.app/api/public/cron/overdue-alerts", { method: "POST" }) });

beforeEach(() => {
  vi.clearAllMocks(); mocks.events.length = 0;
  mocks.auth.mockResolvedValue(undefined);
  mocks.upsert.mockResolvedValue({ error: null });
  mocks.rpc.mockImplementation(async (name: string) => ({ data: name === "pulse_overdue_accounts" ? [] : 0, error: null }));
  mocks.update.mockImplementation(async (value: Record<string, unknown>) => {
    if (value["last_finished_at"]) mocks.events.push("completion saved");
    return { error: null };
  });
  mocks.ping.mockImplementation(async () => { mocks.events.push("external ping"); return "accepted"; });
});

describe("sweep completion reporting", () => {
  it("pings externally only after the completed sweep is recorded, even with zero overdue users", async () => {
    expect((await run()).status).toBe(200);
    expect(mocks.events).toEqual(["completion saved", "external ping"]);
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("does not ping when state advancement fails", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "test failure" } });
    expect((await run()).status).toBe(500);
    expect(mocks.ping).not.toHaveBeenCalled();
  });
  it("does not ping when the overdue lookup fails", async () => {
    mocks.rpc.mockImplementation(async (name: string) => name === "pulse_overdue_accounts"
      ? { data: null, error: { message: "test failure" } } : { data: 0, error: null });
    expect((await run()).status).toBe(500);
    expect(mocks.ping).not.toHaveBeenCalled();
  });
  it("does not ping when completion cannot be saved", async () => {
    mocks.update.mockResolvedValue({ error: { message: "test failure" } });
    expect((await run()).status).toBe(500);
    expect(mocks.ping).not.toHaveBeenCalled();
  });
  it("never runs the sweep or pings for an unauthorized caller", async () => {
    mocks.auth.mockResolvedValue(new Response("Unauthorized", { status: 401 }));
    expect((await run()).status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.ping).not.toHaveBeenCalled();
  });
  it("surfaces external ping failure while retaining the successful sweep completion", async () => {
    mocks.ping.mockResolvedValue("failed");
    expect((await run()).status).toBe(502);
    expect(mocks.events).toEqual(["completion saved"]);
    expect(mocks.update).toHaveBeenLastCalledWith(expect.objectContaining({ last_result: expect.objectContaining({ externalHeartbeat: "failed" }) }));
  });
});
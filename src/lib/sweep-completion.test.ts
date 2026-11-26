import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), rpc: vi.fn(), upsert: vi.fn(), update: vi.fn(), send: vi.fn(), start: vi.fn(), allowBackup: true }));
vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (options: unknown) => ({ options }) }));
vi.mock("@/integrations/supabase/cron-auth", () => ({ authenticateCronRequest: mocks.auth }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: {
  rpc: mocks.rpc,
  from: () => ({ upsert: mocks.upsert, update: (value: Record<string, unknown>) => ({ eq: () => mocks.update(value) }) }),
} }));
vi.mock("@/lib/alert.server", () => ({ sendAccountAlert: mocks.send }));
vi.mock("@/lib/sweep-start.server", () => ({ recordSweepStart: mocks.start }));
import { Route } from "../routes/api/public/cron/overdue-alerts";

const post = (Route as unknown as { options: { server: { handlers: { POST: (input: { request: Request }) => Promise<Response> } } } }).options.server.handlers.POST;
const run = () => post({ request: new Request("https://pulse-checkin.app/api/public/cron/overdue-alerts", { method: "POST" }) });

beforeEach(() => {
  vi.clearAllMocks(); mocks.allowBackup = true;
  mocks.auth.mockResolvedValue(null);
  mocks.upsert.mockResolvedValue({ error: null });
  mocks.rpc.mockImplementation(async (name: string) => ({
    data: name === "pulse_overdue_accounts" ? [{ id: "a1" }] : name === "pulse_rate_hit" ? mocks.allowBackup : 0, error: null }));
  mocks.update.mockResolvedValue({ error: null });
  mocks.send.mockResolvedValue({ ok: true });
  mocks.start.mockResolvedValue("not_needed");
});

describe("overdue sweep triggers", () => {
  it("primary scheduler runs the sweep without throttling", async () => {
    const res = await run();
    expect(res.status).toBe(200);
    expect(mocks.rpc).not.toHaveBeenCalledWith("pulse_rate_hit", expect.anything());
    expect((await res.json()).source).toBe("primary");
  });
  it("backup trigger without credentials runs the same sweep", async () => {
    mocks.auth.mockResolvedValue(new Response("Unauthorized", { status: 401 }));
    const res = await run();
    expect(res.status).toBe(200);
    expect(mocks.send).toHaveBeenCalledWith("a1", "missed");
    expect((await res.json()).source).toBe("backup");
  });
  it("backup runs are limited to one per 10 minutes", async () => {
    mocks.auth.mockResolvedValue(new Response("Unauthorized", { status: 401 }));
    mocks.allowBackup = false;
    expect((await run()).status).toBe(202);
    expect(mocks.rpc).toHaveBeenCalledWith("pulse_rate_hit", { _bucket: "sweep:backup", _limit: 1, _window_seconds: 600 });
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("records completion only when the sweep finishes", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "x" } });
    expect((await run()).status).toBe(500);
    expect(mocks.update).not.toHaveBeenCalledWith(expect.objectContaining({ last_finished_at: expect.anything() }));
  });
  it("checks for a recovered gap before finding overdue accounts", async () => {
    mocks.start.mockResolvedValue("sent");
    const response = await run();
    expect((await response.json()).gapEmail).toBe("sent");
    const startOrder = mocks.start.mock.invocationCallOrder[0];
    const rpcOrder = mocks.rpc.mock.invocationCallOrder[0];
    expect(startOrder).toBeDefined();
    expect(rpcOrder).toBeDefined();
    if (startOrder === undefined || rpcOrder === undefined) throw new Error("Missing calls");
    expect(startOrder).toBeLessThan(rpcOrder);
  });
  it("still sends due alerts if the owner notification fails", async () => {
    mocks.start.mockResolvedValue("failed");
    expect((await run()).status).toBe(200);
    expect(mocks.send).toHaveBeenCalledWith("a1", "missed");
  });
});

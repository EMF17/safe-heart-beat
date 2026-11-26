import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ read: vi.fn(), claim: vi.fn(), upsert: vi.fn() }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: {
  from: () => ({
    select: () => ({ eq: () => ({ maybeSingle: mocks.read }) }),
    upsert: mocks.upsert,
    update: () => {
      const filter = {
        eq: () => filter,
        is: () => filter,
        select: () => ({ maybeSingle: mocks.claim }),
      };
      return filter;
    },
  }),
} }));
import { recordSweepStart } from "./sweep-start.server";

const fetchMock = vi.fn();
const startedAt = "2026-11-26T04:25:00.000Z";
function previous(minutes: number) {
  const at = new Date(Date.parse(startedAt) - minutes * 60_000).toISOString();
  mocks.read.mockResolvedValue({ data: { last_started_at: at, last_finished_at: at }, error: null });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  previous(60);
  mocks.claim.mockResolvedValue({ data: { job: "overdue-alerts" }, error: null });
  mocks.upsert.mockResolvedValue({ error: null });
  fetchMock.mockResolvedValue(new Response('{"id":"fake-message"}', { status: 200 }));
});
afterEach(() => vi.unstubAllGlobals());

describe("recovered sweep gaps", () => {
  it("emails the owner when the previous start was more than 90 minutes ago", async () => {
    previous(91);
    expect(await recordSweepStart(startedAt, "test-key")).toBe("sent");
    expect(fetchMock).toHaveBeenCalledOnce();
    const call = fetchMock.mock.calls[0];
    if (!call) throw new Error("Missing email request");
    const init = call[1] as RequestInit;
    const body = JSON.parse(String(init.body)) as { to: string[] };
    expect(body.to).toEqual(["pulse.safety.fin@gmail.com"]);
  });
  it("does not notify at exactly 90 minutes", async () => {
    previous(90);
    expect(await recordSweepStart(startedAt, "test-key")).toBe("not_needed");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("does not notify on a normal hourly sweep", async () => {
    expect(await recordSweepStart(startedAt, "test-key")).toBe("not_needed");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("does not report a gap when no previous sweep exists", async () => {
    mocks.read.mockResolvedValue({ data: null, error: null });
    expect(await recordSweepStart(startedAt, "test-key")).toBe("not_needed");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("only the atomic start winner sends for a shared gap", async () => {
    previous(120);
    mocks.claim.mockResolvedValueOnce({ data: { job: "overdue-alerts" }, error: null })
      .mockResolvedValueOnce({ data: null, error: null });
    const results = await Promise.all([
      recordSweepStart(startedAt, "test-key"), recordSweepStart(startedAt, "test-key"),
    ]);
    expect(results).toEqual(["sent", "claimed_elsewhere"]);
    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it("uses the previous start as Resend's stable duplicate-prevention key", async () => {
    previous(120);
    await recordSweepStart(startedAt, "test-key");
    expect(fetchMock).toHaveBeenCalledWith("https://api.resend.com/emails", expect.objectContaining({
      headers: expect.objectContaining({ "Idempotency-Key": "sweep-late-2026-11-26T02:25:00.000Z" }),
    }));
  });
  it("reports provider failure without throwing away the sweep", async () => {
    previous(120);
    fetchMock.mockResolvedValue(new Response("Unavailable", { status: 503 }));
    expect(await recordSweepStart(startedAt, "test-key")).toBe("failed");
  });
});
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { deletePulseData } from "./data-deletion";

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), maybeSingle: vi.fn(), upsert: vi.fn() }));
vi.mock("@tanstack/react-start/server", () => ({ getRequestHeader: () => "192.0.2.15" }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: {
  rpc: mocks.rpc,
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.maybeSingle }) }), upsert: mocks.upsert }),
} }));
import { deleteAccount, issueToken, verifyToken } from "./sync.server";
import { enforceTokenLimit } from "./token-limit.server";
import { isSuppressed, suppress, unsubscribeSig, verifyUnsubscribe } from "./email-suppression.server";

const accountId = "00000000-0000-4000-8000-000000000001";
const memoryStorage = () => {
  const data = new Map([["pulse:syncToken", "test-token"], ["pulse:contact", "test-contact"], ["unrelated", "keep"]]);
  return {
    get length() { return data.size; },
    key: (i: number) => [...data.keys()][i] ?? null,
    getItem: (key: string) => data.get(key) ?? null,
    removeItem: (key: string) => { data.delete(key); },
  };
};
beforeEach(() => {
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-only-signing-secret-not-a-real-key");
  mocks.rpc.mockReset().mockResolvedValue({ data: true, error: null });
  mocks.maybeSingle.mockReset().mockResolvedValue({ data: { recovery_code_hash: null }, error: null });
  mocks.upsert.mockReset().mockResolvedValue({ error: null });
});
afterEach(() => vi.unstubAllEnvs());

describe("token hygiene", () => {
  it("accepts a signed device token and stores only fingerprints in limiter buckets", async () => {
    const token = issueToken(accountId);
    expect(await verifyToken(token)).toBe(accountId);
    const buckets = mocks.rpc.mock.calls.map((call) => String(call[1]?._bucket));
    expect(buckets).toHaveLength(2);
    expect(buckets.join(" ")).not.toContain(token);
    expect(buckets.join(" ")).not.toContain("192.0.2.15");
  });
  it("rejects a changed token signature", async () => {
    await expect(verifyToken(`${issueToken(accountId)}x`)).rejects.toThrow("signature");
  });
  it("rejects a valid token once its account is deleted", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
    await expect(verifyToken(issueToken(accountId))).rejects.toThrow("deleted");
  });
  it("limits token requests to 120 and connection requests to 300 per 15 minutes", async () => {
    await enforceTokenLimit("test-token", "192.0.2.15", "link");
    expect(mocks.rpc.mock.calls.map((call) => call[1]?._limit)).toEqual([300, 120]);
    expect(mocks.rpc.mock.calls.map((call) => call[1]?._window_seconds)).toEqual([900, 900]);
  });
  it("blocks token access when the custom limiter denies a request", async () => {
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    await expect(verifyToken(issueToken(accountId))).rejects.toThrow("Too many requests");
    expect(mocks.maybeSingle).not.toHaveBeenCalled();
  });
  it("fails closed when limiter storage is unavailable", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "offline" } });
    await expect(enforceTokenLimit("test-token", "192.0.2.15", "device")).rejects.toThrow();
  });
});
describe("complete data deletion", () => {
  it("uses the atomic account deletion operation after verifying ownership", async () => {
    await deleteAccount(issueToken(accountId));
    expect(mocks.rpc).toHaveBeenCalledWith("pulse_delete_account", { _account_id: accountId });
  });
  it("removes Pulse device data only after server deletion succeeds", async () => {
    const storage = memoryStorage();
    await deletePulseData(storage, async (token) => {
      expect(token).toBe("test-token");
      expect(storage.getItem("pulse:contact")).toBe("test-contact");
    });
    expect(storage.getItem("pulse:syncToken")).toBeNull();
    expect(storage.getItem("pulse:contact")).toBeNull();
    expect(storage.getItem("unrelated")).toBe("keep");
  });
  it("retains credentials and contact when online deletion fails", async () => {
    const storage = memoryStorage();
    await expect(deletePulseData(storage, async () => { throw new Error("offline"); })).rejects.toThrow("offline");
    expect(storage.getItem("pulse:syncToken")).toBe("test-token");
    expect(storage.getItem("pulse:contact")).toBe("test-contact");
  });
});
describe("contact opt-outs", () => {
  it("requires the signed link to match the recipient address", () => {
    const sig = unsubscribeSig("contact@example.test");
    expect(verifyUnsubscribe("contact@example.test", sig)).toBe(true);
    expect(verifyUnsubscribe("other@example.test", sig)).toBe(false);
  });
  it("honours a stored contact suppression", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { email_lower: "contact@example.test" }, error: null });
    expect(await isSuppressed("contact@example.test")).toBe(true);
  });
  it("does not claim opt-out success if saving fails", async () => {
    mocks.upsert.mockResolvedValue({ error: { message: "offline" } });
    await expect(suppress("contact@example.test", "unsubscribe")).rejects.toThrow("Could not save");
  });
  it("does not send when opt-out lookup fails", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: { message: "offline" } });
    await expect(isSuppressed("contact@example.test")).rejects.toThrow();
  });
});
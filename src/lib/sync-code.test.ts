import { describe, it, expect, vi } from "vitest";
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: {} }));
describe("sync codes", async () => {
  const m = await import("./sync.server");
  it("have at least 128 bits of entropy", () => { expect(m.CODE_LENGTH * Math.log2(32)).toBeGreaterThanOrEqual(128); });
  it("expire within 30 days at most", () => { expect(m.MAX_CODE_TTL_HOURS).toBe(720); });
  it("format round-trips through normalisation", () => {
    const raw = "ABCD".repeat(7);
    expect(m.normalizeRecoveryCode(m.formatRecoveryCode(raw))).toBe(raw);
  });
});

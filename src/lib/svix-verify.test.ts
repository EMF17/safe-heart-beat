import { describe, expect, it } from "vitest";
import { signSvix, verifySvixSignature } from "./svix-verify";

const secret = "whsec_" + btoa("test-secret-0123456789");
const now = 1_790_000_000_000;
const ts = String(now / 1000);

describe("Resend webhook signatures", () => {
  it("accepts a correctly signed event", async () => {
    const sig = await signSvix(secret, "msg_1", ts, "{}");
    expect(await verifySvixSignature(secret, "msg_1", ts, "{}", `v1,${sig}`, now)).toBe(true);
  });
  it("rejects a tampered body", async () => {
    const sig = await signSvix(secret, "msg_1", ts, "{}");
    expect(await verifySvixSignature(secret, "msg_1", ts, '{"x":1}', `v1,${sig}`, now)).toBe(false);
  });
  it("rejects events older than five minutes", async () => {
    const sig = await signSvix(secret, "msg_1", ts, "{}");
    expect(await verifySvixSignature(secret, "msg_1", ts, "{}", `v1,${sig}`, now + 6 * 60_000)).toBe(false);
  });
});

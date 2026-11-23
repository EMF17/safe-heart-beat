import { describe, it, expect, beforeAll } from "vitest";
beforeAll(() => { process.env["SUPABASE_SERVICE_ROLE_KEY"] = "test-secret"; });
describe("contact consent", async () => {
  const m = await import("./contact-consent.server");
  it("unconfirmed contacts get no alerts", () => { expect(m.isContactConfirmed({ contact_email: "a@b.com", contact_confirmed_email: null })).toBe(false); });
  it("changing the contact email requires confirming again", () => { expect(m.isContactConfirmed({ contact_email: "new@b.com", contact_confirmed_email: "a@b.com" })).toBe(false); });
  it("confirmed address counts, ignoring case", () => { expect(m.isContactConfirmed({ contact_email: "A@B.com ", contact_confirmed_email: "a@b.com" })).toBe(true); });
  it("confirm links are tied to the record and address", () => {
    const s = m.consentSig("acc-1", "a@b.com");
    expect(m.verifyConsent("acc-1", "a@b.com", s)).toBe(true);
    expect(m.verifyConsent("acc-2", "a@b.com", s)).toBe(false);
    expect(m.verifyConsent("acc-1", "x@b.com", s)).toBe(false);
  });
});

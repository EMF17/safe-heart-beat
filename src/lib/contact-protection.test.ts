import { describe, expect, it } from "vitest";
import { confirmationResendAt, latestContactEmailBounced } from "./contact-protection";

describe("contact email protection", () => {
  it("reports bounced confirmation mail even without consent", () => {
    expect(latestContactEmailBounced([{ status: "bounced", created_at: "2026-11-26T04:30:00Z" }])).toBe(true);
  });
  it("does not treat a pending resend as recovery from a bounce", () => {
    expect(latestContactEmailBounced([
      { status: "bounced", created_at: "2026-11-26T04:30:00Z" },
      { status: "sent", created_at: "2026-11-27T04:30:00Z" },
    ])).toBe(true);
  });
  it("clears the bounce warning only after newer mail is delivered", () => {
    expect(latestContactEmailBounced([
      { status: "bounced", created_at: "2026-11-26T04:30:00Z" },
      { status: "delivered", created_at: "2026-11-27T04:30:00Z" },
    ])).toBe(false);
  });
  it("keeps confirmation resends 24 hours apart", () => {
    expect(confirmationResendAt("2026-11-26T04:30:00Z")).toBe("2026-11-27T04:30:00.000Z");
    expect(confirmationResendAt(null)).toBeNull();
  });
});
import { describe, expect, it } from "vitest";
import { normalizeContactPhone } from "./contact-phone";
describe("emergency contact phone", () => {
  it("accepts an international phone number", () => {
    expect(normalizeContactPhone("+852 9123 4567")).toBe("+85291234567");
  });
  it("allows SMS to be removed without removing email", () => {
    expect(normalizeContactPhone("")).toBeNull();
  });
  it("rejects a number without its country code", () => {
    expect(() => normalizeContactPhone("91234567")).toThrow();
  });
});
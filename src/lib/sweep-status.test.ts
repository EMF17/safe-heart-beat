import { describe, expect, it } from "vitest";
import { sweepAgeMinutes } from "./sweep-status";

describe("elapsed time since last completed sweep", () => {
  it("calculates elapsed minutes from the actual completion timestamp", () => {
    expect(sweepAgeMinutes("2026-11-24T10:00:00Z", Date.parse("2026-11-24T10:42:59Z"))).toBe(42);
  });
  it("does not invent a last sweep when none is recorded", () => {
    expect(sweepAgeMinutes(null, Date.parse("2026-11-24T10:42:00Z"))).toBeNull();
  });
  it("uses elapsed UTC time across a daylight-saving change", () => {
    expect(sweepAgeMinutes("2026-11-01T01:30:00-04:00", Date.parse("2026-11-01T01:45:00-05:00"))).toBe(75);
  });
  it("treats invalid or future completion times as unknown", () => {
    expect(sweepAgeMinutes("invalid", 0)).toBeNull();
    expect(sweepAgeMinutes("2026-11-24T11:00:00Z", Date.parse("2026-11-24T10:00:00Z"))).toBeNull();
  });
});
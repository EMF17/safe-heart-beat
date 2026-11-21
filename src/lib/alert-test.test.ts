import { describe, expect, it } from "vitest";
import { getTestDeliveryState } from "./alert-test";

describe("test alert delivery states", () => {
  it("never treats provider acceptance as confirmed receipt", () => {
    expect(getTestDeliveryState("sent")).toBe("accepted");
  });
  it("does not claim a repeated daily test sends a duplicate", () => {
    expect(getTestDeliveryState("already_sent")).toBe("duplicate");
  });
  it("reports unconnected SMS as unsent", () => {
    expect(getTestDeliveryState("not_connected")).toBe("unavailable");
  });
  it("reports unknown responses as unconfirmed", () => {
    expect(getTestDeliveryState(undefined)).toBe("unknown");
  });
  it("keeps an in-progress request unconfirmed", () => {
    expect(getTestDeliveryState("sending")).toBe("pending");
  });
  it("keeps provider rejection separate from acceptance", () => {
    expect(getTestDeliveryState("failed")).toBe("failed");
  });
});
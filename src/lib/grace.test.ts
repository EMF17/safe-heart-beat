import { describe, expect, it } from "vitest";
import { graceCycleKey, isGraceDue } from "./grace";
const H = 3600_000;
describe("grace reminder timing", () => {
  it("is not due inside the first window", () => expect(isGraceDue(0, 48 * H, null, 47 * H)).toBe(false));
  it("is due after the first missed window", () => expect(isGraceDue(0, 48 * H, null, 49 * H)).toBe(true));
  it("is no longer due once the contact alert window starts", () => expect(isGraceDue(0, 48 * H, null, 97 * H)).toBe(false));
  it("is not due while paused", () => expect(isGraceDue(0, 48 * H, 60 * H, 49 * H)).toBe(false));
  it("uses one key per missed cycle", () => expect(graceCycleKey(1234.9)).toBe("grace-1234"));
});

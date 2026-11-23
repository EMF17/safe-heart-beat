import { describe, it, expect } from "vitest";
import { safeContactName } from "./contact-name";
describe("safeContactName", () => {
  it("keeps normal names", () => { expect(safeContactName("Mary O'Neil")).toBe("Mary O'Neil"); expect(safeContactName("陳大文")).toBe("陳大文"); });
  it("removes links and domains", () => { expect(safeContactName("Win cash at http://x.y/z now")).toBe("Win cash at now"); expect(safeContactName("visit scam.com")).toBe("visit"); });
  it("removes emails and digits", () => { expect(safeContactName("call 5551234 a@b.co")).toBe("call"); });
  it("caps at 40 characters", () => { expect(safeContactName("a".repeat(100)).length).toBe(40); });
  it("falls back when nothing is left", () => { expect(safeContactName("$$$ 123")).toBe("Your contact"); });
});

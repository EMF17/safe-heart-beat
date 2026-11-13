import { describe, it, expect } from "vitest";
import { planReminders } from "./native-reminders";
const H = 3600_000;
describe("planReminders", () => {
  it("schedules due, missed and 1-hour-before-alert reminders for a 48h interval", () => {
    const r = planReminders(0, 48 * H, 96 * H, 0);
    expect(r.map((n) => n.at)).toEqual([48 * H, 72 * H, 95 * H]);
  });
  it("skips reminders already in the past", () => {
    expect(planReminders(0, 48 * H, 96 * H, 80 * H).map((n) => n.at)).toEqual([95 * H]);
  });
});

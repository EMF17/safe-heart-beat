import { describe, expect, it } from "vitest";
import { isAlertDue, isHeartbeatStale, missedCycleKey, nextAlertState, nextRetryAt, sendKey } from "./alert-state";

const H = 3600_000;
const DAY48 = 48 * H;

describe("alert state machine", () => {
  const base = { lastCheckinMs: Date.UTC(2026, 0, 1), intervalMs: DAY48, pausedUntilMs: null };
  it("stays ok inside the window", () => {
    expect(nextAlertState("ok", base, base.lastCheckinMs + 47 * H)).toBe("ok");
  });
  it("moves to warned after one missed window", () => {
    expect(nextAlertState("ok", base, base.lastCheckinMs + 49 * H)).toBe("warned");
  });
  it("does not become alerted before the alert is accepted", () => {
    expect(nextAlertState("warned", base, base.lastCheckinMs + 97 * H)).toBe("warned");
  });
  it("becomes alerted once the alert is accepted after two windows", () => {
    expect(nextAlertState("warned", base, base.lastCheckinMs + 97 * H, true)).toBe("alerted");
  });
  it("a new check-in resets alerted to ok", () => {
    expect(nextAlertState("alerted", { ...base, lastCheckinMs: base.lastCheckinMs + 100 * H }, base.lastCheckinMs + 101 * H)).toBe("ok");
  });
  it("a pause resets to ok", () => {
    expect(nextAlertState("warned", { ...base, pausedUntilMs: base.lastCheckinMs + 200 * H }, base.lastCheckinMs + 99 * H)).toBe("ok");
  });
});

describe("idempotent send keys", () => {
  it("a retry of the same cycle uses the same key", () => {
    expect(sendKey("a1", missedCycleKey(1767225600000.7), "email")).toBe(sendKey("a1", missedCycleKey(1767225600000), "email"));
  });
  it("email and SMS keys differ", () => {
    expect(sendKey("a1", "missed-1", "email")).not.toBe(sendKey("a1", "missed-1", "sms"));
  });
});

describe("retries", () => {
  it("backs off 5, 10, 20, 40 minutes", () => {
    expect([1, 2, 3, 4].map((n) => nextRetryAt(n, 0))).toEqual([5, 10, 20, 40].map((m) => m * 60_000));
  });
  it("stops after five attempts", () => {
    expect(nextRetryAt(5, 0)).toBeNull();
  });
});

describe("daylight saving and time zones", () => {
  // New York springs forward 8 Mar 2026 02:00 local (07:00 UTC): a local-clock
  // calculation would alert one hour late; real elapsed time must be used.
  it("New York spring-forward: alert due exactly 96 real hours later", () => {
    const last = Date.parse("2026-03-07T12:00:00-05:00");
    const t = { lastCheckinMs: last, intervalMs: DAY48, pausedUntilMs: null };
    expect(isAlertDue(t, Date.parse("2026-03-11T13:00:00-04:00"))).toBe(false); // 96h exactly
    expect(isAlertDue(t, Date.parse("2026-03-11T13:00:01-04:00"))).toBe(true);
  });
  it("London fall-back: the repeated hour does not delay the warning", () => {
    const last = Date.parse("2026-10-24T12:00:00+01:00");
    const t = { lastCheckinMs: last, intervalMs: DAY48, pausedUntilMs: null };
    expect(nextAlertState("ok", t, Date.parse("2026-10-26T11:00:01+00:00"))).toBe("warned"); // 48h + 1s
  });
  it("same instant gives the same answer in any time zone", () => {
    const last = Date.parse("2026-11-01T00:00:00+08:00"); // Hong Kong
    const t = { lastCheckinMs: last, intervalMs: DAY48, pausedUntilMs: null };
    const hk = Date.parse("2026-11-05T00:00:01+08:00");
    const la = Date.parse("2026-11-04T08:00:01-08:00");
    expect(hk).toBe(la);
    expect(isAlertDue(t, hk)).toBe(true);
  });
});

describe("cron watchdog", () => {
  it("is stale when the sweep never finished", () => expect(isHeartbeatStale(null, 0)).toBe(true));
  it("is fine 1 hour after the last run", () => expect(isHeartbeatStale(0, H)).toBe(false));
  it("is stale 3 hours after the last run", () => expect(isHeartbeatStale(0, 3 * H)).toBe(true));
});

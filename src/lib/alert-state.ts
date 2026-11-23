// Pure alert rules shared by the server sweep and tests. All maths uses
// absolute UTC milliseconds, so daylight-saving changes and the user's time
// zone can never shorten or lengthen a check-in window.

export type AlertState = "ok" | "warned" | "alerted";
export const MAX_SEND_ATTEMPTS = 5;

export interface AccountTiming {
  lastCheckinMs: number | null;
  intervalMs: number;
  pausedUntilMs: number | null;
}

/** ok -> warned after one missed window, warned -> alerted only once the alert is accepted. */
export function nextAlertState(current: AlertState, t: AccountTiming, nowMs: number, alertAccepted = false): AlertState {
  if (t.lastCheckinMs === null) return "ok";
  if (t.pausedUntilMs !== null && t.pausedUntilMs >= nowMs) return "ok";
  if (nowMs <= t.lastCheckinMs + t.intervalMs) return "ok";
  if (current === "alerted") return "alerted";
  if (alertAccepted && isAlertDue(t, nowMs)) return "alerted";
  return "warned";
}

export function isAlertDue(t: AccountTiming, nowMs: number): boolean {
  if (t.lastCheckinMs === null) return false;
  if (t.pausedUntilMs !== null && t.pausedUntilMs >= nowMs) return false;
  return nowMs > t.lastCheckinMs + 2 * t.intervalMs;
}

/** One key per account, missed cycle and channel: retries reuse it, so they never double send. */
export function missedCycleKey(lastCheckinMs: number): string {
  return `missed-${Math.floor(lastCheckinMs)}`;
}
export function sendKey(accountId: string, cycleKey: string, channel: "email" | "sms"): string {
  return `${accountId}:${cycleKey}:${channel}`;
}

/** Exponential backoff for failed sends: 5, 10, 20, 40 minutes; null once attempts are used up. */
export function nextRetryAt(attempts: number, nowMs: number): number | null {
  if (attempts >= MAX_SEND_ATTEMPTS) return null;
  return nowMs + 5 * 60_000 * 2 ** Math.max(0, attempts - 1);
}

/** The hourly sweep is considered stopped when it has not finished for this long. */
export const HEARTBEAT_STALE_MS = 2.5 * 3600_000;
export function isHeartbeatStale(lastFinishedMs: number | null, nowMs: number): boolean {
  return lastFinishedMs === null || nowMs - lastFinishedMs > HEARTBEAT_STALE_MS;
}

// Pure rules for the "Are you OK?" grace reminder sent to the user after the
// first missed window, before the contact alert (second window) can go out.
export function graceCycleKey(lastCheckinMs: number): string {
  return `grace-${Math.floor(lastCheckinMs)}`;
}
/** Reminder is due only between the end of the first window and the end of the second. */
export function isGraceDue(lastCheckinMs: number | null, intervalMs: number, pausedUntilMs: number | null, nowMs: number): boolean {
  if (lastCheckinMs === null) return false;
  if (pausedUntilMs !== null && pausedUntilMs >= nowMs) return false;
  return nowMs > lastCheckinMs + intervalMs && nowMs < lastCheckinMs + 2 * intervalMs;
}
export const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;

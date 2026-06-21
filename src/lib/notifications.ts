import { useEffect, useRef } from "react";

const FIRED_KEY = "pulse:firedNotifications";

type FiredMap = Record<string, { reminder?: boolean; missed?: boolean }>;

function readFired(): FiredMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(FIRED_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeFired(map: FiredMap) {
  localStorage.setItem(FIRED_KEY, JSON.stringify(map));
}

// Re-export for backwards compatibility with Settings
import { readReminderEnabled, REMINDER_KEY } from "./preferences";
export function isReminderEnabled(): boolean {
  return readReminderEnabled();
}
export { REMINDER_KEY };

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "default") {
    try {
      return await Notification.requestPermission();
    } catch {
      return Notification.permission;
    }
  }
  return Notification.permission;
}

function sendNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, tag: title });
  } catch {
    // ignore
  }
}

interface NotificationOpts {
  intervalMs: number;
  alertThresholdMs: number;
  reminderEnabled: boolean;
  isPaused: boolean;
}

/**
 * Watches a lastCheckIn timestamp and fires ONE local notification 12 hours
 * before the alert would trigger (halfway through the second interval).
 * Cancelled if the user checks in, pauses, or disables reminders.
 */
export function useCheckInNotifications(
  lastCheckIn: number | null,
  opts: NotificationOpts
) {
  const intervalRef = useRef<number | null>(null);
  const { intervalMs, alertThresholdMs, reminderEnabled, isPaused } = opts;

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (lastCheckIn === null) return;
    if (isPaused) return;

    const key = String(lastCheckIn);

    const check = () => {
      if (!reminderEnabled) return;
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

      const elapsed = Date.now() - lastCheckIn;
      const fired = readFired();
      const entry = fired[key] ?? {};

      // 12h-before-alert reminder: fires once when halfway through second interval
      // (i.e. elapsed >= 1.5 * intervalMs), only after first check-in is missed.
      const reminderAt = intervalMs + intervalMs / 2;
      if (
        !entry.reminder &&
        elapsed >= reminderAt &&
        elapsed < alertThresholdMs
      ) {
        sendNotification(
          "Pulse",
          "Don't forget to check in. Your safety net is still armed."
        );
        entry.reminder = true;
      }

      fired[key] = entry;
      writeFired({ [key]: entry });
    };

    check();
    intervalRef.current = window.setInterval(check, 60 * 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [lastCheckIn, intervalMs, alertThresholdMs, reminderEnabled, isPaused]);
}

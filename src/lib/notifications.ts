import { useEffect, useRef } from "react";
import { CHECKIN_INTERVAL_MS, ALERT_THRESHOLD_MS } from "./pulse";

const REMINDER_KEY = "pulse:reminderEnabled";
const FIRED_KEY = "pulse:firedNotifications";
const REMINDER_LEAD_MS = 4 * 60 * 60 * 1000; // 4h before due

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

export function isReminderEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const v = localStorage.getItem(REMINDER_KEY);
  return v === null ? true : v === "true";
}

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
  if (!isReminderEnabled()) return;
  try {
    new Notification(title, { body, tag: title });
  } catch {
    // ignore
  }
}

/**
 * Watches a lastCheckIn timestamp and fires local notifications:
 * - 4 hours before the 48h window expires
 * - When the user misses the first 48h window
 * Each notification fires only once per check-in cycle.
 */
export function useCheckInNotifications(lastCheckIn: number | null) {
  const intervalRef = useRef<number | null>(null);

  // Request permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (lastCheckIn === null) return;

    const key = String(lastCheckIn);

    const check = () => {
      if (!isReminderEnabled()) return;
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

      const elapsed = Date.now() - lastCheckIn;
      const fired = readFired();
      const entry = fired[key] ?? {};

      // 4h-left reminder: fires once elapsed crosses (48h - 4h) = 44h
      if (
        !entry.reminder &&
        elapsed >= CHECKIN_INTERVAL_MS - REMINDER_LEAD_MS &&
        elapsed < CHECKIN_INTERVAL_MS
      ) {
        sendNotification("Pulse check-in", "⏰ 4 hours left — tap to check in.");
        entry.reminder = true;
      }

      // Missed first window: fires once elapsed crosses 48h (before 96h alert)
      if (
        !entry.missed &&
        elapsed >= CHECKIN_INTERVAL_MS &&
        elapsed < ALERT_THRESHOLD_MS
      ) {
        sendNotification(
          "Pulse check-in missed",
          "⚠️ You missed your check-in. You have 48 more hours before we alert your contact."
        );
        entry.missed = true;
      }

      fired[key] = entry;
      // Keep map small: only retain current cycle
      writeFired({ [key]: entry });
    };

    check();
    intervalRef.current = window.setInterval(check, 60 * 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [lastCheckIn]);
}

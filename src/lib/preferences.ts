import { useCallback, useEffect, useState } from "react";

export const INTERVAL_KEY = "pulse:intervalHours";
export const PAUSE_UNTIL_KEY = "pulse:pauseUntil";
export const REMINDER_KEY = "pulse:reminderEnabled";

export const DEFAULT_INTERVAL_HOURS = 48;
export const SUPPORTED_INTERVALS = [24, 48, 72] as const;
export type IntervalHours = (typeof SUPPORTED_INTERVALS)[number];

export function readIntervalHours(): IntervalHours {
  if (typeof window === "undefined") return DEFAULT_INTERVAL_HOURS;
  const raw = Number(window.localStorage.getItem(INTERVAL_KEY));
  return (SUPPORTED_INTERVALS as readonly number[]).includes(raw)
    ? (raw as IntervalHours)
    : DEFAULT_INTERVAL_HOURS;
}

export function readPauseUntil(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PAUSE_UNTIL_KEY);
  if (!raw) return null;
  const n = Number(raw);
  if (!n || Number.isNaN(n)) return null;
  if (n <= Date.now()) {
    window.localStorage.removeItem(PAUSE_UNTIL_KEY);
    return null;
  }
  return n;
}

export function readReminderEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem(REMINDER_KEY);
  return v === null ? true : v === "true";
}

export interface Preferences {
  hydrated: boolean;
  intervalHours: IntervalHours;
  intervalMs: number;
  alertThresholdMs: number;
  pauseUntil: number | null;
  isPaused: boolean;
  reminderEnabled: boolean;
  setIntervalHours: (h: IntervalHours) => void;
  setPauseUntil: (ts: number | null) => void;
  setReminderEnabled: (v: boolean) => void;
}

export function usePreferences(): Preferences {
  const [hydrated, setHydrated] = useState(false);
  const [intervalHours, setIntervalHoursState] = useState<IntervalHours>(DEFAULT_INTERVAL_HOURS);
  const [pauseUntil, setPauseUntilState] = useState<number | null>(null);
  const [reminderEnabled, setReminderEnabledState] = useState(true);

  useEffect(() => {
    setIntervalHoursState(readIntervalHours());
    setPauseUntilState(readPauseUntil());
    setReminderEnabledState(readReminderEnabled());
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === INTERVAL_KEY) setIntervalHoursState(readIntervalHours());
      if (e.key === PAUSE_UNTIL_KEY) setPauseUntilState(readPauseUntil());
      if (e.key === REMINDER_KEY) setReminderEnabledState(readReminderEnabled());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Auto-expire the pause when its end time is reached
  useEffect(() => {
    if (!pauseUntil) return;
    const ms = pauseUntil - Date.now();
    if (ms <= 0) {
      window.localStorage.removeItem(PAUSE_UNTIL_KEY);
      setPauseUntilState(null);
      return;
    }
    const id = window.setTimeout(() => {
      window.localStorage.removeItem(PAUSE_UNTIL_KEY);
      setPauseUntilState(null);
    }, ms);
    return () => window.clearTimeout(id);
  }, [pauseUntil]);

  const setIntervalHours = useCallback((h: IntervalHours) => {
    window.localStorage.setItem(INTERVAL_KEY, String(h));
    setIntervalHoursState(h);
  }, []);

  const setPauseUntil = useCallback((ts: number | null) => {
    if (ts && ts > Date.now()) {
      window.localStorage.setItem(PAUSE_UNTIL_KEY, String(ts));
      setPauseUntilState(ts);
    } else {
      window.localStorage.removeItem(PAUSE_UNTIL_KEY);
      setPauseUntilState(null);
    }
  }, []);

  const setReminderEnabled = useCallback((v: boolean) => {
    window.localStorage.setItem(REMINDER_KEY, String(v));
    setReminderEnabledState(v);
  }, []);

  return {
    hydrated,
    intervalHours,
    intervalMs: intervalHours * 60 * 60 * 1000,
    alertThresholdMs: intervalHours * 2 * 60 * 60 * 1000,
    pauseUntil,
    isPaused: !!pauseUntil,
    reminderEnabled,
    setIntervalHours,
    setPauseUntil,
    setReminderEnabled,
  };
}

export function formatPauseDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

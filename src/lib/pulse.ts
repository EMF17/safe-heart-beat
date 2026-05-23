import { useEffect, useState, useCallback } from "react";

const CHECKIN_KEY = "pulse:lastCheckIn";
const CONTACT_KEY = "pulse:contact";
const NAME_KEY = "pulse:name";

export const CHECKIN_INTERVAL_MS = 48 * 60 * 60 * 1000; // 48h
export const ALERT_THRESHOLD_MS = 96 * 60 * 60 * 1000; // 96h

export interface Contact {
  name: string;
  email: string;
}

export function usePulse() {
  const [lastCheckIn, setLastCheckIn] = useState<number | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [now, setNow] = useState(() => Date.now());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const ls = typeof window !== "undefined" ? window.localStorage : null;
    if (!ls) return;
    const last = ls.getItem(CHECKIN_KEY);
    setLastCheckIn(last ? Number(last) : null);
    const c = ls.getItem(CONTACT_KEY);
    if (c) {
      try { setContact(JSON.parse(c)); } catch {}
    }
    setUserName(ls.getItem(NAME_KEY) ?? "");
    setHydrated(true);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const checkIn = useCallback(() => {
    const t = Date.now();
    localStorage.setItem(CHECKIN_KEY, String(t));
    setLastCheckIn(t);
  }, []);

  const saveContact = useCallback((c: Contact) => {
    localStorage.setItem(CONTACT_KEY, JSON.stringify(c));
    setContact(c);
  }, []);

  const saveName = useCallback((n: string) => {
    localStorage.setItem(NAME_KEY, n);
    setUserName(n);
  }, []);

  const elapsed = lastCheckIn ? now - lastCheckIn : null;
  const msUntilDue = lastCheckIn ? Math.max(0, CHECKIN_INTERVAL_MS - (now - lastCheckIn)) : 0;
  const msUntilAlert = lastCheckIn ? Math.max(0, ALERT_THRESHOLD_MS - (now - lastCheckIn)) : 0;

  let status: "fresh" | "due" | "overdue" | "alert" | "new" = "new";
  if (lastCheckIn) {
    if (elapsed! >= ALERT_THRESHOLD_MS) status = "alert";
    else if (elapsed! >= CHECKIN_INTERVAL_MS) status = "overdue";
    else if (elapsed! >= CHECKIN_INTERVAL_MS * 0.75) status = "due";
    else status = "fresh";
  }

  return {
    hydrated,
    lastCheckIn,
    contact,
    userName,
    now,
    elapsed,
    msUntilDue,
    msUntilAlert,
    status,
    checkIn,
    saveContact,
    saveName,
  };
}

export function formatDuration(ms: number): { primary: string; secondary: string } {
  if (ms <= 0) return { primary: "0h", secondary: "0m" };
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h >= 1) return { primary: `${h}h`, secondary: `${m}m` };
  if (m >= 1) return { primary: `${m}m`, secondary: `${s}s` };
  return { primary: `${s}s`, secondary: "" };
}

export function formatSince(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h ago`;
  }
  if (h >= 1) return `${h}h ${m}m ago`;
  if (m >= 1) return `${m}m ago`;
  return `just now`;
}

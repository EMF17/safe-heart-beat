import { useEffect, useState, useCallback, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  startRegistration as browserStartRegistration,
  startAuthentication as browserStartAuthentication,
  browserSupportsWebAuthn,
} from "@simplewebauthn/browser";

import {
  startPasskeyRegistration,
  finishPasskeyRegistration,
  startPasskeyAuthentication,
  finishPasskeyAuthentication,
  pushSyncState,
  pullSyncState,
  deleteSyncAccount,
} from "./sync.functions";
import { usePreferences } from "./preferences";

const CHECKIN_KEY = "pulse:lastCheckIn";
const CONTACT_KEY = "pulse:contact";
const NAME_KEY = "pulse:name";
const TOKEN_KEY = "pulse:syncToken";
const ACCOUNT_KEY = "pulse:accountId";

// Legacy defaults — actual values are dynamic per the user's chosen interval.
export const CHECKIN_INTERVAL_MS = 48 * 60 * 60 * 1000;
export const ALERT_THRESHOLD_MS = 96 * 60 * 60 * 1000;

export interface Contact {
  name: string;
  email: string;
}

export type SyncStatus = "off" | "ready" | "syncing" | "error";

export function usePulse() {
  const [lastCheckIn, setLastCheckIn] = useState<number | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [syncToken, setSyncToken] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("off");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [hydrated, setHydrated] = useState(false);

  // Server fn callers
  const callStartReg = useServerFn(startPasskeyRegistration);
  const callFinishReg = useServerFn(finishPasskeyRegistration);
  const callStartAuth = useServerFn(startPasskeyAuthentication);
  const callFinishAuth = useServerFn(finishPasskeyAuthentication);
  const callPush = useServerFn(pushSyncState);
  const callPull = useServerFn(pullSyncState);
  const callDelete = useServerFn(deleteSyncAccount);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ls = window.localStorage;
    const last = ls.getItem(CHECKIN_KEY);
    setLastCheckIn(last ? Number(last) : null);
    const c = ls.getItem(CONTACT_KEY);
    if (c) {
      try { setContact(JSON.parse(c)); } catch {}
    }
    setUserName(ls.getItem(NAME_KEY) ?? "");
    const t = ls.getItem(TOKEN_KEY);
    if (t) {
      setSyncToken(t);
      setSyncStatus("ready");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Debounced push when synced & state changes
  const pushTimer = useRef<number | null>(null);
  useEffect(() => {
    if (!hydrated || !syncToken || !contact) return;
    if (pushTimer.current) window.clearTimeout(pushTimer.current);
    pushTimer.current = window.setTimeout(async () => {
      try {
        setSyncStatus("syncing");
        await callPush({
          data: {
            token: syncToken,
            state: {
              userName,
              contactName: contact.name,
              contactEmail: contact.email,
              lastCheckin: lastCheckIn ? new Date(lastCheckIn).toISOString() : null,
            },
          },
        });
        setSyncStatus("ready");
        setSyncError(null);
      } catch (e) {
        setSyncStatus("error");
        setSyncError(e instanceof Error ? e.message : "Sync failed");
      }
    }, 600);
    return () => {
      if (pushTimer.current) window.clearTimeout(pushTimer.current);
    };
  }, [hydrated, syncToken, userName, contact, lastCheckIn, callPush]);

  const checkIn = useCallback(() => {
    const t = Date.now();
    localStorage.setItem(CHECKIN_KEY, String(t));
    setLastCheckIn(t);
    // Append to check-in history
    const raw = localStorage.getItem("pulse:checkins");
    const history: number[] = raw ? JSON.parse(raw) : [];
    history.push(t);
    localStorage.setItem("pulse:checkins", JSON.stringify(history));
    // Light haptic feedback if supported
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(15);
    }
  }, []);

  const saveContact = useCallback((c: Contact) => {
    localStorage.setItem(CONTACT_KEY, JSON.stringify(c));
    setContact(c);
  }, []);

  const saveName = useCallback((n: string) => {
    localStorage.setItem(NAME_KEY, n);
    setUserName(n);
  }, []);

  // --- Sync controls ---

  const enableSync = useCallback(async (contactEmail: string) => {
    if (!browserSupportsWebAuthn()) {
      throw new Error("This device doesn't support passkeys.");
    }
    setSyncStatus("syncing");
    setSyncError(null);
    try {
      const origin = window.location.origin;
      const accountId = localStorage.getItem(ACCOUNT_KEY);
      const { options, accountId: nextAccount, challengeId } = await callStartReg({
        data: { accountId, contactEmail, origin },
      });
      const credential = await browserStartRegistration({ optionsJSON: options });
      const { token } = await callFinishReg({
        data: { challengeId, response: credential, origin },
      });
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(ACCOUNT_KEY, nextAccount);
      setSyncToken(token);
      setSyncStatus("ready");
      return token;
    } catch (e) {
      setSyncStatus("off");
      const msg = e instanceof Error ? e.message : "Couldn't enable sync";
      setSyncError(msg);
      throw new Error(msg);
    }
  }, [callStartReg, callFinishReg]);

  const restoreFromPasskey = useCallback(async () => {
    if (!browserSupportsWebAuthn()) {
      throw new Error("This device doesn't support passkeys.");
    }
    setSyncStatus("syncing");
    setSyncError(null);
    try {
      const origin = window.location.origin;
      const { options, challengeId } = await callStartAuth({ data: { origin } });
      const assertion = await browserStartAuthentication({ optionsJSON: options });
      const { token, account } = await callFinishAuth({
        data: { challengeId, response: assertion, origin },
      });

      // Hydrate local state from server
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(ACCOUNT_KEY, account.id);
      setSyncToken(token);

      localStorage.setItem(NAME_KEY, account.userName ?? "");
      setUserName(account.userName ?? "");

      const restoredContact = { name: account.contactName ?? "", email: account.contactEmail };
      localStorage.setItem(CONTACT_KEY, JSON.stringify(restoredContact));
      setContact(restoredContact);

      if (account.lastCheckin) {
        const t = new Date(account.lastCheckin).getTime();
        localStorage.setItem(CHECKIN_KEY, String(t));
        setLastCheckIn(t);
      } else {
        localStorage.removeItem(CHECKIN_KEY);
        setLastCheckIn(null);
      }

      setSyncStatus("ready");
    } catch (e) {
      setSyncStatus(syncToken ? "ready" : "off");
      const msg = e instanceof Error ? e.message : "Couldn't restore";
      setSyncError(msg);
      throw new Error(msg);
    }
  }, [callStartAuth, callFinishAuth, syncToken]);

  const disableSync = useCallback(async (alsoDeleteRemote: boolean) => {
    if (alsoDeleteRemote && syncToken) {
      try { await callDelete({ data: { token: syncToken } }); } catch {}
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ACCOUNT_KEY);
    setSyncToken(null);
    setSyncStatus("off");
    setSyncError(null);
  }, [syncToken, callDelete]);

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
    // sync
    syncEnabled: !!syncToken,
    syncStatus,
    syncError,
    enableSync,
    restoreFromPasskey,
    disableSync,
    webAuthnSupported: typeof window !== "undefined" && browserSupportsWebAuthn(),
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

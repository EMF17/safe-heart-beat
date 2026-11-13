// Native (iPhone/Android app) reminders scheduled on the phone itself, so they
// fire even when Pulse is closed. Does nothing in a normal web browser.
import { Capacitor } from "@capacitor/core";

const IDS = [4101, 4102, 4103];

export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

async function plugin() {
  const mod = await import("@capacitor/local-notifications");
  return mod.LocalNotifications;
}

export async function requestNativePermission(): Promise<boolean> {
  if (!isNativeApp()) return false;
  const LN = await plugin();
  const cur = await LN.checkPermissions();
  if (cur.display === "granted") return true;
  const res = await LN.requestPermissions();
  return res.display === "granted";
}

export async function cancelNativeReminders() {
  if (!isNativeApp()) return;
  const LN = await plugin();
  await LN.cancel({ notifications: IDS.map((id) => ({ id })) });
}

/** Pure helper (tested): which reminders to schedule after a check-in. */
export function planReminders(lastCheckIn: number, intervalMs: number, alertThresholdMs: number, now = Date.now()) {
  const hour = 60 * 60 * 1000;
  const items = [
    { id: IDS[0], at: lastCheckIn + intervalMs, title: "Pulse", body: "Time to check in. Tap to let your contact know you're okay." },
    { id: IDS[1], at: lastCheckIn + intervalMs * 1.5, title: "Pulse", body: "You missed a check-in. Tap to check in before we alert your contact." },
    { id: IDS[2], at: lastCheckIn + alertThresholdMs - hour, title: "Pulse — 1 hour left", body: "Your emergency contact will be alerted in 1 hour. Tap to check in." },
  ];
  return items.filter((n) => n.at > now && n.at < lastCheckIn + alertThresholdMs);
}

export async function scheduleNativeReminders(lastCheckIn: number, intervalMs: number, alertThresholdMs: number) {
  if (!isNativeApp()) return;
  const LN = await plugin();
  await LN.cancel({ notifications: IDS.map((id) => ({ id })) });
  const perm = await LN.checkPermissions();
  if (perm.display !== "granted") return;
  const items = planReminders(lastCheckIn, intervalMs, alertThresholdMs);
  if (!items.length) return;
  await LN.schedule({
    notifications: items.map((n) => ({ id: n.id, title: n.title, body: n.body, schedule: { at: new Date(n.at), allowWhileIdle: true } })),
  });
}

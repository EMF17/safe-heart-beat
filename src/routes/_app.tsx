import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Home, Shield, History, Settings } from "lucide-react";
import { useEffect } from "react";
import { usePulse, ALERT_THRESHOLD_MS } from "@/lib/pulse";
import { useCheckInNotifications } from "@/lib/notifications";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const LAST_ALERT_KEY = "pulse:lastAlertSent";

function AppLayout() {
  const location = useLocation();
  const current = location.pathname;
  const { lastCheckIn, contact, hydrated } = usePulse();
  useCheckInNotifications(lastCheckIn);

  // Missed check-in alert: send ONE email if last check-in > 96h ago
  // and no alert has been sent since that check-in.
  useEffect(() => {
    if (!hydrated || !lastCheckIn || !contact?.email) return;
    const elapsed = Date.now() - lastCheckIn;
    if (elapsed < ALERT_THRESHOLD_MS) return;

    const lastAlertRaw = localStorage.getItem(LAST_ALERT_KEY);
    const lastAlert = lastAlertRaw ? Number(lastAlertRaw) : 0;
    // Only send if no alert yet for this missed-window (i.e. last alert
    // was before the most recent check-in).
    if (lastAlert >= lastCheckIn) return;

    // Mark immediately to prevent double-fire (e.g. StrictMode, remounts).
    const sentAt = Date.now();
    localStorage.setItem(LAST_ALERT_KEY, String(sentAt));

    fetch("/api/send-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactName: contact.name,
        contactEmail: contact.email,
        type: "missed",
      }),
    }).catch(() => {
      // Roll back so we retry on next load if it failed.
      localStorage.removeItem(LAST_ALERT_KEY);
    });
  }, [hydrated, lastCheckIn, contact?.email, contact?.name]);


  const tabs = [
    { to: "/" as const, label: "Home", icon: Home },
    { to: "/emergency-contact" as const, label: "Emergency", icon: Shield },
    { to: "/history" as const, label: "History", icon: History },
    { to: "/settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>

      {/* Bottom Tab Navigation — Glass frost bar */}
      <div className="shrink-0 z-50 px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-background/60 to-transparent backdrop-blur-sm">
        <nav className="mx-auto flex h-16 max-w-sm items-center justify-around rounded-2xl border border-white/40 bg-card/60 px-2 shadow-[0_8px_32px_color-mix(in_oklab,var(--primary)_12%,transparent)] backdrop-blur-xl">
          {tabs.map((tab) => {
            const isActive = current === tab.to;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                onClick={() => {
                  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                    navigator.vibrate(8);
                  }
                }}
                className={`relative flex flex-col items-center justify-center px-3 py-1.5 transition-all duration-200 active:scale-95 ${
                  isActive ? "" : "opacity-40 hover:opacity-80"
                }`}
              >
                {isActive && (
                  <span className="absolute -inset-x-2 -inset-y-1 rounded-xl bg-primary/10" />
                )}
                <Icon
                  className={`relative z-10 w-[22px] h-[22px] ${
                    isActive ? "text-primary" : "text-foreground"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`relative z-10 mt-1 text-[10px] tracking-tight ${
                    isActive ? "font-bold text-primary" : "font-medium text-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

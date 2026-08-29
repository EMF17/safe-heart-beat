import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Home, Shield, History, Settings } from "lucide-react";
import { useEffect } from "react";
import { usePulse } from "@/lib/pulse";
import { useCheckInNotifications } from "@/lib/notifications";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const LAST_ALERT_KEY = "pulse:lastAlertSent";

function AppLayout() {
  const location = useLocation();
  const current = location.pathname;
  const {
    lastCheckIn,
    contact,
    hydrated,
    intervalMs,
    alertThresholdMs,
    reminderEnabled,
    isPaused,
    syncToken,
  } = usePulse();
  useCheckInNotifications(lastCheckIn, {
    intervalMs,
    alertThresholdMs,
    reminderEnabled,
    isPaused,
  });

  // Missed check-in alert: send ONE email if last check-in > alert threshold
  // and no alert has been sent since that check-in. Skipped while paused.
  // Requires an active sync token so the server can resolve the contact
  // email from the authenticated account (prevents anonymous email abuse).
  useEffect(() => {
    if (!hydrated || !lastCheckIn || !contact?.email) return;
    if (isPaused) return;
    if (!syncToken) return;
    const elapsed = Date.now() - lastCheckIn;
    if (elapsed < alertThresholdMs) return;

    const lastAlertRaw = localStorage.getItem(LAST_ALERT_KEY);
    const lastAlert = lastAlertRaw ? Number(lastAlertRaw) : 0;
    if (lastAlert >= lastCheckIn) return;

    const sentAt = Date.now();
    localStorage.setItem(LAST_ALERT_KEY, String(sentAt));

    import("@/lib/region").then(({ getActiveCountryCode }) => {
      const countryCode = getActiveCountryCode();
      fetch("/api/send-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: syncToken,
          type: "missed",
          countryCode,
        }),
      }).catch(() => {
        localStorage.removeItem(LAST_ALERT_KEY);
      });
    });
  }, [hydrated, lastCheckIn, contact?.email, contact?.name, alertThresholdMs, isPaused, syncToken]);


  const tabs = [
    { to: "/app" as const, label: "Home", icon: Home },
    { to: "/emergency-contact" as const, label: "Contact", icon: Shield },
    { to: "/history" as const, label: "History", icon: History },
    { to: "/settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>

      {/* Bottom Tab Navigation */}
      <nav className="shrink-0 z-50 bg-card/85 backdrop-blur-xl border-t border-border/60 safe-area-pb">
        <div className="flex items-center justify-around max-w-md mx-auto px-2 py-2">
          {tabs.map((tab) => {
            const isActive = current === tab.to;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`relative flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-2xl bg-primary/10" />
                )}
                <Icon className="relative w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className={`relative text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

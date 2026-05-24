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

      {/* Bottom Tab Navigation */}
      <nav className="shrink-0 z-50 bg-card/80 backdrop-blur-lg border-t border-border/60">
        <div className="flex items-center justify-around max-w-md mx-auto px-4 py-2">
          {tabs.map((tab) => {
            const isActive = current === tab.to;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>
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

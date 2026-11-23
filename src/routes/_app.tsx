import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Home, Shield, History, Settings } from "lucide-react";
import { usePulse } from "@/lib/pulse";
import { useCheckInNotifications } from "@/lib/notifications";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const location = useLocation();
  const current = location.pathname;
  const {
    lastCheckIn,
    intervalMs,
    alertThresholdMs,
    reminderEnabled,
    isPaused,
  } = usePulse();
  useCheckInNotifications(lastCheckIn, {
    intervalMs,
    alertThresholdMs,
    reminderEnabled,
    isPaused,
  });

  // Missed check-in alerts are sent by the server on a schedule, so they
  // work even when this phone is off or Pulse is closed.

  const tabs = [
    { to: "/app" as const, label: "Home", icon: Home },
    { to: "/emergency-contact" as const, label: "Contact", icon: Shield },
    { to: "/history" as const, label: "History", icon: History },
    { to: "/settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col safe-area-pt">
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

import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Home, Shield, History } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const location = useLocation();
  const current = location.pathname;

  const tabs = [
    { to: "/" as const, label: "Home", icon: Home },
    { to: "/emergency-contact" as const, label: "Emergency", icon: Shield },
    { to: "/history" as const, label: "History", icon: History },
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
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors ${
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

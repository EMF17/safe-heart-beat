import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AlertInfoLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen">
    <header className="border-b border-border">
      <div className="max-w-4xl mx-auto px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost"><Link to="/"><HeartPulse />Pulse</Link></Button>
        <nav aria-label="Alert information" className="flex flex-wrap gap-1">
          <Button asChild variant="ghost"><Link to="/how-alerts-work">How alerts work</Link></Button>
          <Button asChild variant="ghost"><Link to="/status">Status</Link></Button>
          <Button asChild><Link to="/app">Open Pulse</Link></Button>
        </nav>
      </div>
    </header>
    <main className="max-w-3xl mx-auto px-5 py-10 md:py-16 space-y-10">{children}</main>
    <footer className="border-t border-border px-5 py-6 text-sm text-muted-foreground">
      <div className="max-w-3xl mx-auto flex flex-wrap gap-5">
        <Link to="/privacy-policy" className="hover:text-foreground">Privacy policy</Link>
        <Link to="/emergency-numbers" className="hover:text-foreground">Emergency numbers</Link>
        <Link to="/settings" className="hover:text-foreground">Settings</Link>
      </div>
    </footer>
  </div>;
}
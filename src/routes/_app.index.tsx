import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PulseDashboard } from "@/components/PulseDashboard";
import { Hand, Mail, ShieldCheck, ChevronRight } from "lucide-react";

const ONBOARDING_KEY = "pulse:onboardingCompleted";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Pulse — Your quiet safety net" },
      {
        name: "description",
        content:
          "Pulse is a privacy-first safety check-in for people who live alone. One tap every 48 hours keeps your emergency contact informed.",
      },
      { property: "og:title", content: "Pulse — Your quiet safety net" },
      {
        property: "og:description",
        content:
          "A simple 'I'm Safe' button. No accounts, no tracking. If you miss two check-ins, we email your emergency contact.",
      },
    ],
  }),
});

function HomePage() {
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = window.localStorage.getItem(ONBOARDING_KEY) === "true";
    setOnboardingDone(done);
  }, []);

  const dismissOnboarding = () => {
    window.localStorage.setItem(ONBOARDING_KEY, "true");
    setOnboardingDone(true);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(15);
    }
  };

  if (onboardingDone === null) return <div className="min-h-full" />;

  if (!onboardingDone) {
    return <OnboardingScreen onDismiss={dismissOnboarding} />;
  }

  return <PulseDashboard />;
}

function OnboardingScreen({ onDismiss }: { onDismiss: () => void }) {
  const cards = [
    {
      icon: <Hand className="w-6 h-6" />,
      title: "Tap the green button",
      body: "Once every 48 hours. It takes two seconds and keeps your safety net armed.",
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Add an emergency contact",
      body: "A trusted friend or family member who should know if something's wrong.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "We only email if needed",
      body: "If you miss two check-ins in a row (96 hours), we send one alert. That's it.",
    },
  ];

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-8">
      <div className="max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-4">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-40 animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2 leading-tight">
            Welcome to Pulse
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Your quiet safety net.
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-4 mb-10">
          {cards.map((card, i) => (
            <div
              key={i}
              className="bg-card border border-border/60 rounded-2xl p-5 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-3"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                {card.icon}
              </div>
              <div>
                <p className="font-medium text-sm mb-1">{card.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {card.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onDismiss}
          className="w-full h-12 rounded-full bg-primary text-primary-foreground font-medium shadow-[var(--shadow-soft)] hover:bg-primary/90 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          Get Started
          <ChevronRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-muted-foreground text-center mt-4 leading-relaxed">
          No account · No tracking · Your data stays on this device
        </p>
      </div>
    </div>
  );
}

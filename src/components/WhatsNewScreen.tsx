import { Clock, PauseCircle, Bell } from "lucide-react";

interface WhatsNewScreenProps {
  onDismiss: () => void;
}

export function WhatsNewScreen({ onDismiss }: WhatsNewScreenProps) {
  const features = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Choose Your Rhythm",
      body: "Pick a check-in interval that suits your life: every 24, 48, or 72 hours.",
    },
    {
      icon: <PauseCircle className="w-5 h-5" />,
      title: "Pause When You Need To",
      body: "Going on vacation or just need a break? Pause check-ins temporarily. No alerts, no pressure.",
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: "Gentle Reminders",
      body: "Optional notifications that nudge you 12 hours before an alert would be sent, so you never miss a check-in by accident.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6 py-8">
      <div className="max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-4">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-40 animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2 leading-tight">
            Your Safety Net, Upgraded
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Pulse now gives you more flexibility while staying quiet and private.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-10">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-card border border-border/60 rounded-2xl p-5 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-3"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                {feature.icon}
              </div>
              <div>
                <p className="font-medium text-sm mb-1">{feature.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground text-center mb-6 leading-relaxed">
          Everything stays private. No accounts. No tracking. Just you and your safety net.
        </p>

        {/* CTA */}
        <button
          onClick={onDismiss}
          className="w-full h-12 rounded-full bg-primary text-primary-foreground font-medium shadow-[var(--shadow-soft)] hover:bg-primary/90 active:scale-[0.98] transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

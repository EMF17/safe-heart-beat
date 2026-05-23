import { useState } from "react";
import { usePulse, formatDuration, formatSince, CHECKIN_INTERVAL_MS, ALERT_THRESHOLD_MS } from "@/lib/pulse";

function pad(n: number) { return String(n).padStart(2, "0"); }

function CountdownRing({ progress, status }: { progress: number; status: string }) {
  const r = 140;
  const c = 2 * Math.PI * r;
  const dash = c * (1 - Math.min(1, Math.max(0, progress)));
  const stroke =
    status === "alert" ? "var(--color-destructive)" :
    status === "overdue" ? "var(--color-warning)" :
    "var(--color-primary)";
  return (
    <svg viewBox="0 0 320 320" className="absolute inset-0 w-full h-full -rotate-90">
      <circle cx="160" cy="160" r={r} fill="none" stroke="var(--color-border)" strokeWidth="2" />
      <circle
        cx="160" cy="160" r={r}
        fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={dash}
        style={{ transition: "stroke-dashoffset 1s linear, stroke 0.6s ease" }}
      />
    </svg>
  );
}

export function PulseDashboard() {
  const p = usePulse();
  const [editing, setEditing] = useState(false);
  const [tickKey, setTickKey] = useState(0);

  if (!p.hydrated) return <div className="min-h-screen" />;

  // Onboarding: no contact yet
  if (!p.contact || editing) {
    return <Onboarding initial={p.contact} initialName={p.userName} onSave={(c, n) => {
      p.saveContact(c);
      p.saveName(n);
      setEditing(false);
    }} onCancel={p.contact ? () => setEditing(false) : undefined} />;
  }

  const handleCheckIn = () => {
    p.checkIn();
    setTickKey(k => k + 1);
  };

  const totalWindow = p.status === "alert" ? ALERT_THRESHOLD_MS : CHECKIN_INTERVAL_MS;
  const progress = p.lastCheckIn ? Math.min(1, (Date.now() - p.lastCheckIn) / totalWindow) : 0;
  const dueLabel = p.status === "alert" ? "Alert sending soon" :
                   p.status === "overdue" ? "Check in to reset alert" :
                   "Next check-in";
  const dueMs = p.status === "alert" || p.status === "overdue" ? p.msUntilAlert : p.msUntilDue;
  const dur = formatDuration(dueMs);

  const statusCopy =
    p.status === "alert" ? "Alert window reached" :
    p.status === "overdue" ? "You're overdue" :
    p.status === "due" ? "Time to check in" :
    p.status === "new" ? "Tap to start your first check-in" :
    "You're safe";

  return (
    <div className="min-h-screen flex flex-col">
      <Header onEdit={() => setEditing(true)} />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
          {p.userName ? `Hi, ${p.userName}` : "Pulse"}
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-center mb-2">
          {statusCopy}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base text-center max-w-sm mb-10">
          {p.lastCheckIn
            ? `Last check-in ${formatSince(Date.now() - p.lastCheckIn)}.`
            : "One tap every 48 hours keeps your safety net armed."}
        </p>

        {/* Pulse button */}
        <div className="relative w-[320px] h-[320px] flex items-center justify-center">
          {p.status !== "alert" && (
            <div className="absolute inset-6 rounded-full pulse-ring animate-breathe pointer-events-none" />
          )}
          <CountdownRing progress={progress} status={p.status} />
          <button
            key={tickKey}
            onClick={handleCheckIn}
            className="animate-tick relative z-10 w-[240px] h-[240px] rounded-full
                       bg-gradient-to-b from-[var(--color-primary-glow)] to-[var(--color-primary)]
                       text-primary-foreground font-display font-semibold text-2xl
                       shadow-[var(--shadow-pulse)] transition-transform
                       hover:scale-[1.02] active:scale-[0.97] focus:outline-none
                       focus-visible:ring-4 focus-visible:ring-primary/30"
            aria-label="I'm safe — check in now"
          >
            I'm Safe
          </button>
        </div>

        {/* Timer info */}
        <div className="mt-12 grid grid-cols-3 gap-4 md:gap-8 max-w-md w-full">
          <Stat label={dueLabel} value={dur.primary} sub={dur.secondary} highlight={p.status === "alert" || p.status === "overdue"} />
          <Stat label="Interval" value="48h" sub="per check-in" />
          <Stat label="Alert after" value="96h" sub="2 missed" />
        </div>
      </main>

      <Footer contact={p.contact} userName={p.userName} />
    </div>
  );
}

function Stat({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">{label}</p>
      <p className={`font-display text-2xl font-semibold tabular-nums ${highlight ? "text-destructive" : "text-foreground"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function Header({ onEdit }: { onEdit: () => void }) {
  return (
    <header className="flex items-center justify-between px-6 py-5">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">Pulse</span>
      </div>
      <button
        onClick={onEdit}
        className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
      >
        Settings
      </button>
    </header>
  );
}

function Footer({ contact, userName }: { contact: { name: string; email: string }; userName: string }) {
  return (
    <footer className="px-6 py-6 border-t border-border/60 bg-card/40 backdrop-blur-sm">
      <div className="max-w-md mx-auto text-center text-xs text-muted-foreground">
        <p>
          If you miss two check-ins, we'll alert{" "}
          <span className="text-foreground font-medium">{contact.name || contact.email}</span>
          {userName ? <> that <span className="text-foreground font-medium">{userName}</span> hasn't checked in.</> : "."}
        </p>
      </div>
    </footer>
  );
}

function Onboarding({
  initial,
  initialName,
  onSave,
  onCancel,
}: {
  initial: { name: string; email: string } | null;
  initialName: string;
  onSave: (c: { name: string; email: string }, userName: string) => void;
  onCancel?: () => void;
}) {
  const [userName, setUserName] = useState(initialName);
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email for your emergency contact.");
      return;
    }
    onSave({ name: name.trim(), email: trimmedEmail }, userName.trim());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onEdit={() => onCancel?.()} />
      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
            {onCancel ? "Settings" : "Welcome to Pulse"}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-3 leading-tight">
            Your quiet safety net.
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Tell us who to reach if you miss two check-ins. No accounts, no tracking — everything stays on this device.
          </p>

          <form onSubmit={submit} className="space-y-5 bg-card/70 backdrop-blur-sm border border-border/60 rounded-3xl p-6 shadow-[var(--shadow-soft)]">
            <Field label="Your name (optional)" hint="Shown in the alert email">
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full bg-transparent border-b border-input px-0 py-2 text-base focus:outline-none focus:border-primary transition-colors"
              />
            </Field>
            <Field label="Emergency contact name" hint="A trusted friend or family member">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sam"
                className="w-full bg-transparent border-b border-input px-0 py-2 text-base focus:outline-none focus:border-primary transition-colors"
              />
            </Field>
            <Field label="Emergency contact email" hint="We'll only email them if you miss 96 hours">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contact@example.com"
                className="w-full bg-transparent border-b border-input px-0 py-2 text-base focus:outline-none focus:border-primary transition-colors"
              />
            </Field>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 h-12 rounded-full bg-primary text-primary-foreground font-medium
                           shadow-[var(--shadow-soft)] hover:bg-primary/90 active:scale-[0.98] transition"
              >
                {onCancel ? "Save" : "Arm my safety net"}
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="h-12 px-5 rounded-full border border-border text-muted-foreground hover:text-foreground transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <p className="text-xs text-muted-foreground mt-6 text-center leading-relaxed">
            Privacy-first · No account · No location · Stored only on this device
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground mt-1.5">{hint}</span>}
    </label>
  );
}

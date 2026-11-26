import { useState } from "react";
import { Check, Clock } from "lucide-react";
import { usePulse, type Contact } from "@/lib/pulse";
import { Button } from "@/components/ui/button";
import { ContactProtectionNotice } from "@/components/ContactProtectionNotice";

function formatCheckInTime(timestamp: number) {
  return new Date(timestamp).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function PulseDashboard() {
  const p = usePulse();
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!p.hydrated) return <div className="min-h-full" />;

  if (!p.contact) {
    return (
      <Onboarding
        initial={p.contact}
        initialName={p.userName}
        webAuthnSupported={p.webAuthnSupported}
        onRestore={p.restoreFromPasskey}
        onSave={(contact, name) => {
          p.saveContact(contact);
          p.saveName(name);
        }}
      />
    );
  }

  const handleCheckIn = () => {
    setError(null);
    try {
      p.checkIn();
      setJustCheckedIn(true);
    } catch {
      setError("Your check-in could not be saved. Please try again.");
    }
  };
  const isOverdue = p.status === "overdue" || p.status === "alert";
  const nextCheckIn = p.lastCheckIn ? p.lastCheckIn + p.intervalMs : null;

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center px-6 py-5 text-center md:py-10">
      <header className="mb-5">
        <p className="font-display text-xl font-semibold tracking-normal text-primary">Pulse</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-normal">
          {p.userName ? `Hello, ${p.userName}` : "Your check-in"}
        </h1>
      </header>

      <ContactProtectionNotice token={p.syncToken} email={p.contact.email} name={p.contact.name} />

      <Button
        onClick={handleCheckIn}
        disabled={p.isPaused}
        aria-label="I’m OK"
        className="h-52 w-52 shrink-0 flex-col gap-2 rounded-full font-display text-4xl font-semibold shadow-[var(--shadow-soft)] focus-visible:ring-4 focus-visible:ring-ring/40 motion-safe:transition-transform motion-safe:active:scale-95 md:h-60 md:w-60 [&_svg]:size-9"
      >
        <Check aria-hidden="true" strokeWidth={2.5} />
        I’m OK
      </Button>

      <div role="status" aria-live="polite" aria-atomic="true" className="mt-5 min-h-16 w-full">
        {p.isPaused ? (
          <p className="text-lg font-medium">Check-ins are paused</p>
        ) : p.lastCheckIn ? (
          <>
            <p className={`flex items-center justify-center gap-2 text-lg font-semibold ${isOverdue ? "text-warning-foreground" : "text-foreground"}`}>
              {!isOverdue && <Check className="h-5 w-5 text-primary" aria-hidden="true" />}
              {justCheckedIn ? "Check-in recorded" : isOverdue ? "Your check-in is overdue" : "Last check-in recorded"}
            </p>
            <p className="mt-1 text-base text-muted-foreground">
              {formatCheckInTime(p.lastCheckIn)}
            </p>
          </>
        ) : (
          <p className="text-lg text-muted-foreground">Ready for your first check-in</p>
        )}
      </div>
      {error && <p role="alert" className="mt-2 text-base text-destructive">{error}</p>}

      <section aria-label="Next check-in" className="mt-4 w-full border-t border-border pt-4">
        <p className="flex items-center justify-center gap-2 text-base text-muted-foreground">
          <Clock className="h-4 w-4" aria-hidden="true" />
          {p.isPaused ? "Check-ins resume" : "Next check-in"}
        </p>
        <p className="mt-1 text-lg font-semibold">
          {p.isPaused && p.pauseUntil
            ? formatCheckInTime(p.pauseUntil)
            : nextCheckIn
              ? formatCheckInTime(nextCheckIn)
              : "Not started yet"}
        </p>
      </section>
    </main>
  );
}

function Onboarding({
  initial,
  initialName,
  webAuthnSupported,
  onRestore,
  onSave,
  onCancel,
}: {
  initial: Contact | null;
  initialName: string;
  webAuthnSupported: boolean;
  onRestore: () => Promise<void>;
  onSave: (c: Contact, userName: string) => void;
  onCancel?: () => void;
}) {
  const [userName, setUserName] = useState(initialName);
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email for your emergency contact.");
      return;
    }
    onSave({ ...initial, name: name.trim(), email: trimmedEmail }, userName.trim());
  };

  const handleRestore = async () => {
    setError(null);
    setRestoring(true);
    try { await onRestore(); } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't restore");
    } finally { setRestoring(false); }
  };

  return (
    <div className="min-h-full flex flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Pulse</span>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        )}
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
            {onCancel ? "Emergency contact" : "Welcome to Pulse"}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-3 leading-tight">
            Your quiet safety net.
          </h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Tell us who to reach if you miss two check-ins. No accounts, no cookies — your contact and check-ins are saved online so we can alert them even if your phone is off.
          </p>

          {!onCancel && webAuthnSupported && (
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="w-full mb-6 h-11 rounded-full border border-border bg-background/60 hover:bg-background transition text-sm font-medium disabled:opacity-50"
            >
              {restoring ? "Waiting for passkey…" : "Restore from passkey"}
            </button>
          )}

          <form onSubmit={submit} className="space-y-5 bg-card/70 backdrop-blur-sm border border-border/60 rounded-3xl p-6 shadow-[var(--shadow-soft)]">
            <Field label="Your name (optional)" hint="Shown in the alert email">
              <input
                type="text" value={userName} onChange={e => setUserName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full bg-transparent border-b border-input px-0 py-2 text-base focus:outline-none focus:border-primary transition-colors"
              />
            </Field>
            <Field label="Emergency contact name" hint="A trusted friend or family member">
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Sam"
                className="w-full bg-transparent border-b border-input px-0 py-2 text-base focus:outline-none focus:border-primary transition-colors"
              />
            </Field>
            <Field label="Emergency contact email" hint="They must confirm before any alerts can be sent">
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="contact@example.com"
                className="w-full bg-transparent border-b border-input px-0 py-2 text-base focus:outline-none focus:border-primary transition-colors"
              />
            </Field>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-12 rounded-full bg-primary text-primary-foreground font-medium shadow-[var(--shadow-soft)] hover:bg-primary/90 active:scale-[0.98] transition"
              >
                {onCancel ? "Save" : "Save contact"}
              </Button>
            </div>
          </form>

          <p className="text-xs text-muted-foreground mt-6 text-center leading-relaxed">
            Privacy-first · No account · No location · Sync code optional
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

import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { usePulse, formatDuration, formatSince, CHECKIN_INTERVAL_MS, ALERT_THRESHOLD_MS, type Contact } from "@/lib/pulse";

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
  const [showSettings, setShowSettings] = useState(false);
  const [tickKey, setTickKey] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [buttonPulse, setButtonPulse] = useState(false);

  useEffect(() => {
    if (!showSuccess) return;
    const id = setTimeout(() => setShowSuccess(false), 4000);
    return () => clearTimeout(id);
  }, [showSuccess]);

  if (!p.hydrated) return <div className="min-h-full" />;

  if (!p.contact || editing) {
    return (
      <Onboarding
        initial={p.contact}
        initialName={p.userName}
        webAuthnSupported={p.webAuthnSupported}
        onRestore={p.restoreFromPasskey}
        onSave={(c, n) => {
          p.saveContact(c);
          p.saveName(n);
          setEditing(false);
        }}
        onCancel={p.contact ? () => setEditing(false) : undefined}
      />
    );
  }

  const handleCheckIn = () => {
    p.checkIn();
    setTickKey(k => k + 1);
    setShowSuccess(true);
    setButtonPulse(true);
    setTimeout(() => setButtonPulse(false), 600);
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
    <div className="min-h-full flex flex-col">
      <Header
        onEdit={() => setEditing(true)}
        onSettings={() => setShowSettings(true)}
        syncEnabled={p.syncEnabled}
        syncStatus={p.syncStatus}
      />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
          {p.userName ? `Hi, ${p.userName}` : "Pulse"}
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-center mb-2 leading-tight">
          {statusCopy}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base text-center max-w-sm mb-10">
          {p.lastCheckIn
            ? `Next check-in due in: ${Math.max(0, Math.floor(p.msUntilDue / (1000 * 60 * 60)))} hours ${Math.max(0, Math.floor((p.msUntilDue % (1000 * 60 * 60)) / (1000 * 60)))} minutes`
            : "First check-in ready. Tap the button to start."}
        </p>

        {showSuccess && (
          <div className="mb-6 px-5 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
            ✓ Check-in recorded
          </div>
        )}

        <div className="relative w-[340px] h-[340px] md:w-[380px] md:h-[380px] flex items-center justify-center">
          {p.status !== "alert" && (
            <div className="absolute inset-6 rounded-full pulse-ring animate-breathe pointer-events-none" />
          )}
          <CountdownRing progress={progress} status={p.status} />
          <button
            key={tickKey}
            onClick={handleCheckIn}
            className={`${buttonPulse ? "animate-pulse-once" : ""} animate-tick relative z-10 w-[260px] h-[260px] md:w-[280px] md:h-[280px] rounded-full
                       bg-gradient-to-b from-[var(--color-primary-glow)] to-[var(--color-primary)]
                       text-primary-foreground font-display font-semibold text-3xl md:text-4xl
                       shadow-[var(--shadow-pulse)] transition-transform
                       hover:scale-[1.03] active:scale-[0.96] focus:outline-none
                       focus-visible:ring-4 focus-visible:ring-primary/30`}
            aria-label="I'm safe — check in now"
          >
            I'm Safe
          </button>
        </div>

        <div className="mt-14 grid grid-cols-3 gap-6 md:gap-10 max-w-md w-full">
          <Stat label={dueLabel} value={dur.primary} sub={dur.secondary} highlight={p.status === "alert" || p.status === "overdue"} />
          <Stat label="Interval" value="48h" sub="per check-in" />
          <Stat label="Alert after" value="96h" sub="2 missed" />
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to="/emergency-numbers"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Open emergency numbers"
          >
            <Phone className="w-3.5 h-3.5" />
            Emergency Numbers
          </Link>
        </div>
      </section>

      <Footer contact={p.contact} userName={p.userName} />

      {showSettings && (
        <SettingsSheet
          contact={p.contact}
          syncEnabled={p.syncEnabled}
          syncStatus={p.syncStatus}
          syncError={p.syncError}
          webAuthnSupported={p.webAuthnSupported}
          onClose={() => setShowSettings(false)}
          onEditContact={() => { setShowSettings(false); setEditing(true); }}
          onEnableSync={() => p.enableSync(p.contact!.email)}
          onDisableSync={(deleteRemote) => p.disableSync(deleteRemote)}
        />
      )}
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

function Header({
  onEdit,
  onSettings,
  syncEnabled,
  syncStatus,
}: {
  onEdit: () => void;
  onSettings: () => void;
  syncEnabled: boolean;
  syncStatus: string;
}) {
  return (
    <header className="flex items-center justify-between px-6 py-5">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">Pulse</span>
        {syncEnabled && (
          <span
            className="ml-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            title={syncStatus === "error" ? "Sync error" : "Synced via passkey"}
          >
            {syncStatus === "syncing" ? "syncing…" : syncStatus === "error" ? "sync error" : "synced"}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onEdit}
          className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onSettings}
          className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
        >
          Settings
        </button>
      </div>
    </header>
  );
}

function Footer({ contact, userName }: { contact: Contact; userName: string }) {
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

function SettingsSheet({
  contact,
  syncEnabled,
  syncStatus,
  syncError,
  webAuthnSupported,
  onClose,
  onEditContact,
  onEnableSync,
  onDisableSync,
}: {
  contact: Contact;
  syncEnabled: boolean;
  syncStatus: string;
  syncError: string | null;
  webAuthnSupported: boolean;
  onClose: () => void;
  onEditContact: () => void;
  onEnableSync: () => Promise<string>;
  onDisableSync: (deleteRemote: boolean) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const toggle = async () => {
    setBusy(true);
    setLocalError(null);
    try {
      if (syncEnabled) {
        await onDisableSync(false);
      } else {
        await onEnableSync();
      }
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full md:max-w-md bg-card border-t md:border border-border rounded-t-3xl md:rounded-3xl p-6 shadow-[var(--shadow-soft)] animate-in slide-in-from-bottom-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-semibold">Settings</h2>
          <button onClick={onClose} className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
            Done
          </button>
        </div>

        {/* Sync toggle */}
        <div className="rounded-2xl border border-border bg-background/60 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">Sync across devices</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Uses a passkey on this device. Restore on a new device with one tap — no codes, no passwords.
              </p>
            </div>
            <button
              onClick={toggle}
              disabled={busy || !webAuthnSupported}
              className={`shrink-0 w-12 h-7 rounded-full transition-colors relative ${
                syncEnabled ? "bg-primary" : "bg-muted"
              } ${(busy || !webAuthnSupported) ? "opacity-50" : ""}`}
              aria-label="Toggle device sync"
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-background shadow transition-transform ${
                  syncEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {!webAuthnSupported && (
            <p className="text-xs text-muted-foreground mt-3">
              This browser doesn't support passkeys, so cross-device sync isn't available here.
            </p>
          )}
          {syncEnabled && syncStatus === "ready" && (
            <p className="text-xs text-primary mt-3">Synced. Changes are saved automatically.</p>
          )}
          {syncStatus === "syncing" && (
            <p className="text-xs text-muted-foreground mt-3">Working with your passkey…</p>
          )}
          {(localError || (syncError && syncStatus === "error")) && (
            <p className="text-xs text-destructive mt-3">{localError ?? syncError}</p>
          )}
        </div>

        {/* Contact */}
        <button
          onClick={onEditContact}
          className="mt-3 w-full text-left rounded-2xl border border-border bg-background/60 p-4 hover:bg-background transition-colors"
        >
          <p className="font-medium">Emergency contact</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {contact.name ? `${contact.name} · ` : ""}{contact.email}
          </p>
        </button>

        {syncEnabled && (
          <button
            onClick={async () => {
              setBusy(true);
              setLocalError(null);
              try { await onDisableSync(true); } catch (e) {
                setLocalError(e instanceof Error ? e.message : "Failed");
              } finally { setBusy(false); }
            }}
            disabled={busy}
            className="mt-3 w-full text-xs text-destructive hover:underline disabled:opacity-50"
          >
            Disable sync and delete cloud copy
          </button>
        )}
      </div>
    </div>
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
    onSave({ name: name.trim(), email: trimmedEmail }, userName.trim());
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
            Tell us who to reach if you miss two check-ins. No accounts, no tracking — your data stays on this device unless you turn on sync.
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
            <Field label="Emergency contact email" hint="We'll only email them if you miss 96 hours">
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="contact@example.com"
                className="w-full bg-transparent border-b border-input px-0 py-2 text-base focus:outline-none focus:border-primary transition-colors"
              />
            </Field>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-12 rounded-full bg-primary text-primary-foreground font-medium shadow-[var(--shadow-soft)] hover:bg-primary/90 active:scale-[0.98] transition"
              >
                {onCancel ? "Save" : "Arm my safety net"}
              </button>
            </div>
          </form>

          <p className="text-xs text-muted-foreground mt-6 text-center leading-relaxed">
            Privacy-first · No account · No location · Passkey sync optional
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

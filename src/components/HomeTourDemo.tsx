import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Mail,
  Hand,
  ShieldCheck,
  Check,
  RotateCcw,
  ChevronRight,
  MailWarning,
} from "lucide-react";

type StepId = 0 | 1 | 2;

const STEPS = [
  { icon: Mail, label: "Add a contact" },
  { icon: Hand, label: "Tap I’m Safe" },
  { icon: ShieldCheck, label: "If you go quiet" },
] as const;

const DEMO_INTERVAL_MS = 48 * 60 * 60 * 1000;

/**
 * A sandboxed, click-through demo of the Pulse flow for first-time visitors.
 * Purely local state — nothing is saved and no emails are ever sent.
 */
export function HomeTourDemo() {
  const [step, setStep] = useState<StepId>(0);
  const [name, setName] = useState("");
  const [contactSaved, setContactSaved] = useState(false);
  const [checkedInAt, setCheckedInAt] = useState<number | null>(null);
  const [ticked, setTicked] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const tickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => () => {
    if (tickTimer.current) clearTimeout(tickTimer.current);
  }, []);

  const remaining = useMemo(() => {
    if (!checkedInAt) return null;
    const ms = Math.max(0, checkedInAt + DEMO_INTERVAL_MS - now);
    return {
      hours: Math.floor(ms / 3_600_000),
      minutes: Math.floor((ms % 3_600_000) / 60_000),
    };
  }, [checkedInAt, now]);

  const contactName = contactSaved ? name.trim() || "Mom" : "";

  const saveContact = () => {
    setContactSaved(true);
    setStep(1);
  };

  const checkIn = () => {
    setCheckedInAt(Date.now());
    setNow(Date.now());
    setTicked(true);
    if (tickTimer.current) clearTimeout(tickTimer.current);
    tickTimer.current = setTimeout(() => setTicked(false), 700);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(12);
    }
  };

  const reset = () => {
    setStep(0);
    setName("");
    setContactSaved(false);
    setCheckedInAt(null);
    setTicked(false);
  };

  return (
    <div id="try-it" className="mt-16 md:mt-20 scroll-mt-24">
      <div className="text-center max-w-xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          Interactive demo · nothing is saved
        </span>
        <h2 className="mt-5 font-display text-2xl md:text-3xl font-semibold tracking-tight">
          Try it right here
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Three taps and you’ll know exactly how Pulse behaves.
        </p>
      </div>

      {/* Step rail */}
      <ol className="mt-8 flex items-center justify-center gap-2 sm:gap-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === i;
          const isDone = i < step;
          return (
            <li key={s.label} className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setStep(i as StepId)}
                aria-current={isActive ? "step" : undefined}
                className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : isDone
                      ? "border-border/60 bg-card text-foreground"
                      : "border-border/50 bg-card/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
              {i < STEPS.length - 1 && (
                <span
                  className={`h-px w-4 sm:w-8 ${i < step ? "bg-primary/50" : "bg-border"}`}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Phone frame */}
      <div className="mt-8 flex justify-center">
        <div className="relative w-full max-w-sm rounded-4xl border border-border/60 bg-card/85 backdrop-blur-sm p-7 shadow-[var(--shadow-soft)]">
          {step === 0 && (
            <div className="animate-in fade-in duration-300">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Step 1
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold">
                Who should we contact?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                One person you trust. In the real app you’d add their email too.
              </p>
              <label className="mt-6 block text-xs font-medium text-muted-foreground">
                Contact name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveContact();
                }}
                placeholder="Contact name, e.g., Mom"
                className="mt-2 w-full h-12 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/25 transition"
              />
              <button
                type="button"
                onClick={saveContact}
                className="mt-4 w-full h-12 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:scale-[0.98] transition"
              >
                Save contact
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="animate-in fade-in duration-300">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {checkedInAt ? "Next check-in due in" : "Step 2 · tap the button"}
              </p>
              <p className="mt-2 font-display text-3xl font-semibold">
                {remaining
                  ? `${remaining.hours}h ${remaining.minutes}m`
                  : "48h 00m"}
              </p>

              <div className="relative mt-8 mb-2 flex items-center justify-center">
                <span className="absolute w-52 h-52 rounded-full pulse-ring animate-breathe" />
                <button
                  type="button"
                  onClick={checkIn}
                  aria-label="Demo check-in button"
                  className={`relative flex flex-col items-center justify-center w-36 h-36 rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-pulse)] hover:bg-primary/90 transition ${
                    ticked ? "animate-tick animate-pulse-once" : ""
                  }`}
                >
                  <span className="font-display text-lg font-semibold">
                    I’m Safe
                  </span>
                  <span className="text-[10px] opacity-80 mt-0.5">
                    {checkedInAt ? "tap again" : "tap once"}
                  </span>
                </button>
              </div>

              <div className="mt-7 min-h-10">
                {checkedInAt ? (
                  <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <Check className="w-4 h-4 shrink-0" />
                    Check-in recorded — {contactName || "your contact"} stays
                    unbothered.
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center">
                    That’s the entire daily ritual. Two seconds.
                  </p>
                )}
              </div>

              {checkedInAt && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-4 w-full h-12 rounded-full border border-border/70 bg-card font-medium hover:bg-muted/50 transition inline-flex items-center justify-center gap-2"
                >
                  What if I forget?
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in duration-300">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Step 3
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold">
                Miss two windows in a row
              </h3>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
                  <p className="font-medium">After 48 hours</p>
                  <p className="mt-1 text-xs opacity-80">
                    A gentle reminder on your phone. Nobody else is contacted.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    After 96 hours · one email to {contactName || "your contact"}
                  </p>
                  <div className="mt-3 flex items-start gap-3">
                    <span className="shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <MailWarning className="w-4 h-4" />
                    </span>
                    <div className="text-left">
                      <p className="text-sm font-medium">
                        Please check on your friend
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        They haven’t checked in with Pulse for 96 hours. Local
                        emergency number included.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to="/app"
                className="mt-6 w-full h-12 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:scale-[0.98] transition inline-flex items-center justify-center gap-2"
              >
                Set this up for real
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {(step > 0 || contactSaved || checkedInAt) && (
            <button
              type="button"
              onClick={reset}
              className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground transition inline-flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              Restart demo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

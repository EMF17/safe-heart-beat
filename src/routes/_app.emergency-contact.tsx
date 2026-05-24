import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Check, AlertTriangle } from "lucide-react";

const CONTACT_KEY = "pulse:contact";

interface Contact {
  name: string;
  email: string;
}

export const Route = createFileRoute("/_app/emergency-contact")({
  component: EmergencyContactPage,
  head: () => ({
    meta: [
      { title: "Emergency Contact — Pulse" },
      {
        name: "description",
        content: "Set your emergency contact for Pulse safety check-ins.",
      },
    ],
  }),
});

function EmergencyContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(CONTACT_KEY);
    if (raw) {
      try {
        const parsed: Contact = JSON.parse(raw);
        setName(parsed.name || "");
        setEmail(parsed.email || "");
        setConfirmEmail(parsed.email || "");
      } catch {}
    }
    setHydrated(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedConfirm = confirmEmail.trim();

    if (!trimmedName) {
      setError("Please enter a contact name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (trimmedEmail !== trimmedConfirm) {
      setError("Emails do not match. Please double-check.");
      return;
    }

    const contact: Contact = { name: trimmedName, email: trimmedEmail };
    window.localStorage.setItem(CONTACT_KEY, JSON.stringify(contact));
    setSuccess(true);

    // Light haptic feedback
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(15);
    }
  };

  if (!hydrated) return <div className="min-h-full" />;

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col px-6 py-8">
      <div className="max-w-md mx-auto w-full">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Emergency Contact
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2 leading-tight">
          Who should we notify?
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mb-8">
          We'll only email this person if you miss two check-ins in a row (96 hours).
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="contact-name" className="block text-sm font-medium mb-1.5">
              Contact Name
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contact name, e.g., Mom"
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium mb-1.5">
              Emergency Contact Email
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="emergency@example.com"
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Confirm Email */}
          <div>
            <label htmlFor="confirm-email" className="block text-sm font-medium mb-1.5">
              Confirm Email
            </label>
            <input
              id="confirm-email"
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="emergency@example.com"
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-bottom-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Emergency contact saved successfully.</span>
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            className="w-full h-12 rounded-full bg-primary text-primary-foreground font-medium shadow-[var(--shadow-soft)] hover:bg-primary/90 active:scale-[0.98] transition"
          >
            Save Emergency Contact
          </button>

          {/* Warning */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Double-check this email. We'll only alert them if you miss two check-ins.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

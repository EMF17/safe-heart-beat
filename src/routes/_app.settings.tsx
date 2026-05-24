import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { isReminderEnabled, requestNotificationPermission } from "@/lib/notifications";

const NOTIF_KEY = "pulse:reminderEnabled";
const ONBOARDING_KEY = "pulse:onboardingCompleted";
import {
  MailWarning,
  Trash2,
  Info,
  AlertTriangle,
  Check,
  ChevronRight,
  User,
  Mail,
  Bell,
} from "lucide-react";

const CONTACT_KEY = "pulse:contact";

interface Contact {
  name: string;
  email: string;
}

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — Pulse" },
      { name: "description", content: "Pulse app settings and preferences." },
    ],
  }),
});

function SettingsPage() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    destructive: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Toast state
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(CONTACT_KEY);
    if (raw) {
      try {
        setContact(JSON.parse(raw));
      } catch {}
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(id);
    }
  }, [toast]);

  const showToast = (message: string) => setToast(message);

  const openDialog = (config: typeof dialogConfig) => {
    setDialogConfig(config);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogConfig(null);
  };

  const handleDeleteAllData = () => {
    openDialog({
      title: "Delete all data?",
      message:
        "This will permanently remove your check-in history, emergency contact, and all settings. This action cannot be undone.",
      confirmLabel: "Delete All Data",
      destructive: true,
      onConfirm: () => {
        const keysToRemove = [
          "pulse:lastCheckIn",
          "pulse:contact",
          "pulse:name",
          "pulse:syncToken",
          "pulse:accountId",
          "pulse:checkins",
          "pulse:reminderEnabled",
          "pulse:lastAlertSent",
        ];
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
        setContact(null);
        closeDialog();
        showToast("All data deleted. App has been reset.");
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([10, 50, 10]);
        }
      },
    });
  };

  const handleSendTestAlert = async () => {
    if (!contact?.email) {
      showToast("Save an emergency contact first.");
      return;
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(15);
    }
    showToast("Sending test alert…");
    try {
      const res = await fetch("/api/send-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: contact.name,
          contactEmail: contact.email,
          type: "test",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(`Failed: ${data?.error || res.statusText}`);
        return;
      }
      showToast(`Test alert sent to ${contact.email}`);
    } catch (e) {
      showToast(`Failed: ${e instanceof Error ? e.message : "Network error"}`);
    }
  };

  if (!hydrated) return <div className="min-h-full" />;

  return (
    <div className="min-h-full flex flex-col px-6 py-8">
      <div className="max-w-md mx-auto w-full">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Settings
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-8 leading-tight">
          Preferences
        </h1>

        {/* Emergency Contact */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <MailWarning className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em]">
              Emergency Contact
            </h2>
          </div>
          <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-4">
            {contact ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-medium">{contact.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{contact.email}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No contact saved</p>
            )}
            <button
              onClick={handleSendTestAlert}
              className="w-full h-11 rounded-full border-2 border-primary text-primary font-medium text-sm hover:bg-primary/10 active:scale-[0.98] transition"
            >
              Send Test Alert
            </button>
          </div>
        </section>

        {/* Data */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="w-4 h-4 text-destructive" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em]">
              Data
            </h2>
          </div>
          <div className="bg-card border border-border/60 rounded-2xl p-4">
            <button
              onClick={handleDeleteAllData}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-destructive">
                    Delete All Data
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    This removes your history, emergency contact, and settings
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
          </div>
        </section>

        {/* About */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em]">
              About
            </h2>
          </div>
          <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b border-border/40">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <span className="text-sm">Privacy Policy</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </section>
      </div>

      {/* Confirmation Dialog */}
      {dialogOpen && dialogConfig && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-foreground/20 backdrop-blur-sm"
          onClick={closeDialog}
        >
          <div
            className="w-full md:max-w-sm bg-card border-t md:border border-border rounded-t-3xl md:rounded-3xl p-6 shadow-[var(--shadow-soft)] animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-destructive/10 text-destructive">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">
                {dialogConfig.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {dialogConfig.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDialog}
                className="flex-1 h-11 rounded-full border border-border bg-background/60 text-sm font-medium hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={dialogConfig.onConfirm}
                className="flex-1 h-11 rounded-full text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                {dialogConfig.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

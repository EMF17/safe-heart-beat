import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Bell,
  MailWarning,
  Trash2,
  Info,
  AlertTriangle,
  X,
  Check,
  ChevronRight,
} from "lucide-react";

const REMINDER_KEY = "pulse:reminderEnabled";

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
  const [reminderEnabled, setReminderEnabled] = useState(true);
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
    const raw = window.localStorage.getItem(REMINDER_KEY);
    setReminderEnabled(raw === null ? true : raw === "true");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(id);
    }
  }, [toast]);

  const showToast = (message: string) => setToast(message);

  const toggleReminder = () => {
    const next = !reminderEnabled;
    setReminderEnabled(next);
    window.localStorage.setItem(REMINDER_KEY, String(next));
    showToast(next ? "Reminder notifications enabled" : "Reminder notifications disabled");
  };

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
        ];
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
        setReminderEnabled(true);
        closeDialog();
        showToast("All data deleted. App has been reset.");
        // Light haptic feedback
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([10, 50, 10]);
        }
      },
    });
  };

  const handleSendTestAlert = () => {
    const raw = window.localStorage.getItem("pulse:contact");
    if (!raw) {
      showToast("No emergency contact set. Add one in the Emergency tab.");
      return;
    }
    openDialog({
      title: "Send test alert?",
      message:
        "We'll send a test email to your emergency contact so they know what to expect.",
      confirmLabel: "Send Test",
      destructive: false,
      onConfirm: () => {
        closeDialog();
        showToast("Test alert sent to your emergency contact.");
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(15);
        }
      },
    });
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

        {/* Notifications */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em]">
              Notifications
            </h2>
          </div>
          <div className="bg-card border border-border/60 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-sm">Enable reminder notifications</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  We'll remind you 4 hours before your check-in expires
                </p>
              </div>
              <button
                onClick={toggleReminder}
                className={`shrink-0 w-12 h-7 rounded-full transition-colors relative ${
                  reminderEnabled ? "bg-primary" : "bg-muted"
                }`}
                aria-label="Toggle reminder notifications"
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-background shadow transition-transform ${
                    reminderEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Emergency Alert */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <MailWarning className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em]">
              Emergency Alert
            </h2>
          </div>
          <div className="bg-card border border-border/60 rounded-2xl p-4">
            <button
              onClick={handleSendTestAlert}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Send Test Alert</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Test your emergency contact setup
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
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
            <button className="w-full px-4 py-3 flex items-center justify-between border-b border-border/40 hover:bg-muted/30 transition-colors">
              <span className="text-sm">Privacy Policy</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <span className="text-sm">Terms of Use</span>
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
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  dialogConfig.destructive
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {dialogConfig.destructive ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <MailWarning className="w-5 h-5" />
                )}
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
                className={`flex-1 h-11 rounded-full text-sm font-medium transition-colors ${
                  dialogConfig.destructive
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
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

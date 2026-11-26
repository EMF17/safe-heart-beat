import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = { email: string | null; confirmed: boolean };

/** Optional: the user's own email for an "Are you OK?" reminder before the contact is alerted. */
export function OwnerReminderCard() {
  const [status, setStatus] = useState<Status | null>(null);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const call = async (body: object) => {
    const token = localStorage.getItem("pulse:syncToken");
    if (!token) return null;
    const r = await fetch("/api/owner-reminder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, ...body }) });
    return r.ok ? r.json() : null;
  };
  useEffect(() => { void call({ action: "status" }).then((s: Status | null) => { if (s) { setStatus(s); setEmail(s.email ?? ""); } }); }, []);

  async function save() {
    setBusy(true); setMsg(null);
    try {
      const d = await call({ action: "save", email }) as { status?: string; error?: string } | null;
      if (!d) setMsg("Save your safety contact first, then try again.");
      else if (d.status === "sent") { setMsg("Check your inbox and tap Confirm. Reminders start once confirmed."); setStatus({ email, confirmed: false }); }
      else if (d.status === "confirmed") setStatus({ email, confirmed: true });
      else if (d.status === "cleared") { setStatus({ email: null, confirmed: false }); setMsg("Reminder email removed."); }
      else setMsg(d.error ?? "Could not save.");
    } catch { setMsg("Could not save. Check your connection."); }
    finally { setBusy(false); }
  }

  return <section aria-labelledby="owner-reminder-title" className="space-y-3">
    <h2 id="owner-reminder-title" className="font-display text-xl font-semibold flex items-center gap-2"><BellRing className="size-5 text-primary" />"Are you OK?" reminder</h2>
    <p className="text-sm text-muted-foreground leading-relaxed">If you miss one check-in, Pulse emails you first with a one-tap "I'm OK" button. Your contact is only alerted if you also miss the next window. Optional.</p>
    {status?.email && <p className="text-sm font-medium">{status.confirmed ? `Reminders on: ${status.email}` : `Waiting for you to confirm ${status.email}`}</p>}
    <div className="flex gap-2">
      <Input type="email" inputMode="email" autoComplete="email" placeholder="Your own email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Your own email" />
      <Button onClick={save} disabled={busy}>{email.trim() ? "Save" : "Remove"}</Button>
    </div>
    {msg && <p role="status" className="text-sm text-muted-foreground">{msg}</p>}
  </section>;
}

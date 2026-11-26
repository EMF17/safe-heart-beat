import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, LoaderCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContactProtection } from "@/lib/contact-protection";

export function ContactProtectionNotice({ token, email, name }: { token: string | null; email: string; name: string }) {
  const [snapshot, setSnapshot] = useState<{ token: string; data: ContactProtection } | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [now, setNow] = useState(0);
  const [savedToken, setSavedToken] = useState<string | null>(null);
  const activeToken = token ?? savedToken;
  const normalizedEmail = email.trim().toLowerCase();
  const status = snapshot?.token === activeToken && snapshot.data.email === normalizedEmail ? snapshot.data : null;

  useEffect(() => {
    const refreshToken = () => setSavedToken(localStorage.getItem("pulse:syncToken"));
    refreshToken();
    const timer = window.setInterval(refreshToken, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setUnavailable(false);
    async function refresh() {
      setNow(Date.now());
      if (!activeToken) return;
      try {
        const response = await fetch("/api/contact-confirm", {
          method: "POST", signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: activeToken, action: "status" }),
        });
        if (!response.ok) throw new Error("Unavailable");
        const data = await response.json() as ContactProtection;
        if (active) { setSnapshot({ token: activeToken, data }); setUnavailable(false); }
      } catch { if (active) setUnavailable(true); }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30_000);
    window.addEventListener("focus", refresh); window.addEventListener("online", refresh);
    return () => { active = false; controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", refresh); window.removeEventListener("online", refresh); };
  }, [activeToken, normalizedEmail, revision]);

  useEffect(() => { setMessage(null); }, [activeToken, normalizedEmail]);

  async function sendConfirmation() {
    if (!activeToken || busy) return;
    setBusy(true); setMessage(null);
    try {
      const response = await fetch("/api/contact-confirm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: activeToken, action: "send" }),
      });
      const result = await response.json() as { status?: string; error?: string };
      setRevision(value => value + 1);
      setMessage(result.status === "sent"
        ? "Confirmation email sent. Ask your contact to check their inbox and spam folder. No alerts until they confirm."
        : result.status === "confirmed" ? "Your contact has confirmed."
        : result.error ?? "Could not send the confirmation. Please try again later.");
    } catch { setMessage("Could not send the confirmation. Check your connection."); }
    finally { setBusy(false); }
  }

  if (status?.confirmed && !status.bounced && !status.blocked && !unavailable) return null;
  const waiting = status && !status.confirmed && !status.bounced && !status.blocked && !unavailable;
  const canResend = Boolean(waiting && activeToken && (!status.resendAt || Date.parse(status.resendAt) <= now));
  return <section role="alert" aria-label="Contact protection" className="mb-5 w-full border-y border-destructive/40 py-4 text-left">
    <div className="flex items-start gap-3">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="font-semibold text-destructive break-words">
          {status?.bounced ? "Not protected: your contact’s email bounced."
            : status?.blocked ? "Not protected: your contact has stopped Pulse emails."
            : waiting ? `Not protected yet: waiting for ${name.trim() || "your contact"} to confirm`
            : unavailable ? "Protection status unavailable — do not assume alerts are ready."
            : !activeToken ? "Not protected yet: your online safety record is not ready."
            : "Checking your contact’s confirmation…"}
        </p>
        <p className="text-sm text-muted-foreground">
          {status?.bounced ? "Check the address or choose another contact. Email alerts may not reach this contact."
            : waiting ? "No alerts will be sent until your contact confirms."
            : "Check your saved contact and connection before relying on alerts."}
        </p>
        {waiting && <>
          <Button variant="outline" onClick={sendConfirmation} disabled={!canResend || busy} className="min-h-11 max-w-full whitespace-normal">
            {busy ? <LoaderCircle className="animate-spin" /> : <Mail />}
            {busy ? "Sending…" : status.requestSentAt ? "Resend confirmation" : "Send confirmation email"}
          </Button>
          {!canResend && status.resendAt && <p className="text-xs text-muted-foreground">You can resend after {new Date(status.resendAt).toLocaleString()}. One request per address every 24 hours.</p>}
        </>}
        {(status?.bounced || status?.blocked || unavailable) && <Button asChild variant="outline"><Link to="/emergency-contact">Check contact details</Link></Button>}
        {message && <p role="status" className="text-sm">{message}</p>}
      </div>
    </div>
  </section>;
}
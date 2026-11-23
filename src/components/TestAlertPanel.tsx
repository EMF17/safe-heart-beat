import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pullSyncState } from "@/lib/sync.functions";
import { describeTestChannel } from "@/lib/alert-test";

export function TestAlertPanel() {
  const pull = useServerFn(pullSyncState);
  const [ready, setReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState<{ token: string; email: string; phone: string | null; confirmed: boolean; requestSentAt: string | null } | null>(null);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ email: string; sms: string } | null>(null);

  useEffect(() => {
    const refresh = () => setHasToken(Boolean(localStorage.getItem("pulse:syncToken")));
    refresh();
    setReady(true);
    const timer = window.setInterval(refresh, 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function reviewTest() {
    setError(null); setResult(null); setConsent(false);
    const token = localStorage.getItem("pulse:syncToken");
    if (!token) { setHasToken(false); return; }
    if (!navigator.onLine) { setError("You are offline. Connect to the internet before sending a test."); return; }
    setBusy(true);
    try {
      const account = await pull({ data: { token } });
      if (!account.contactEmail) throw new Error("No saved online contact");
      const st = await fetch("/api/contact-confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, action: "status" }) });
      if (!st.ok) throw new Error("status");
      const status = await st.json() as { confirmed?: boolean; requestSentAt?: string | null };
      setConfirmMsg(null);
      setReview({ token, email: account.contactEmail, phone: account.contactPhone ?? null, confirmed: !!status.confirmed, requestSentAt: status.requestSentAt ?? null });
    } catch {
      setError("Could not verify your saved online contact. Check your connection and restore or enable online recovery in Settings.");
    } finally { setBusy(false); }
  }

  async function requestConfirmation() {
    if (!review || busy) return;
    setBusy(true); setError(null);
    try {
      const r = await fetch("/api/contact-confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: review.token, action: "send" }) });
      const d = await r.json() as { status?: string; error?: string };
      if (d.status === "sent") setConfirmMsg("Confirmation email sent. Ask your contact to open it and tap Confirm (check spam too). Then come back and send a test.");
      else if (d.status === "confirmed") setReview({ ...review, confirmed: true });
      else setConfirmMsg(d.error ?? "Could not send the confirmation email.");
    } catch { setConfirmMsg("Could not send the confirmation email. Check your connection."); }
    finally { setBusy(false); }
  }

  async function sendTest() {
    if (!review || !consent || busy) return;
    setBusy(true); setError(null);
    try {
      const { getActiveCountryCode } = await import("@/lib/region");
      const response = await fetch("/api/send-alert", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: review.token, type: "test", countryCode: getActiveCountryCode() }),
      });
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json() as { email?: { status?: unknown }; sms?: { status?: unknown } };
      setResult({ email: describeTestChannel("email", data.email?.status), sms: describeTestChannel("sms", data.sms?.status) });
      setReview(null);
    } catch {
      setError("The test result could not be confirmed. Check your connection and online recovery in Settings. Do not assume your contact received it.");
    } finally { setBusy(false); }
  }

  return <section aria-labelledby="test-alert-title" className="space-y-4">
    <h2 id="test-alert-title" className="font-display text-xl font-semibold flex items-center gap-2"><Mail className="size-5 text-primary" />Try a test alert</h2>
    <p className="text-sm text-muted-foreground leading-relaxed">Your contact must first confirm they agree to be your safety contact. Then you can send a clearly labelled test. A test does not change your check-in time or history. Ask them to check their inbox and spam folder.</p>
    <p className="text-sm text-muted-foreground">One accepted test per channel per day (resets at midnight UTC). SMS requires a connected service and a saved phone number.</p>
    {ready && !hasToken && <div className="space-y-3">
      <p className="text-sm">Save a contact, then create a Sync Code or enable passkey recovery in Settings before testing. This stores your contact and check-ins online; it does not enable phone-off monitoring.</p>
      <Button asChild variant="outline"><Link to="/settings">Set up in Settings</Link></Button>
    </div>}
    {!review && <Button onClick={reviewTest} disabled={!ready || !hasToken || busy} className="min-h-11 whitespace-normal"><Mail />{busy ? "Checking contact…" : "Send test alert"}</Button>}
    {review && <div className="border-l-2 border-primary pl-4 space-y-4">
      <p className="text-sm">Test recipient: <strong className="break-all">{review.email}</strong>{review.phone && <span className="block break-all">Saved SMS number: {review.phone}</span>}</p>
      {!review.confirmed ? <div className="space-y-3">
        <p className="text-sm leading-relaxed"><strong>Your contact hasn't confirmed yet.</strong> Pulse sends no alerts — test or real — until they agree. We'll email them once: "{"<your name>"} named you as their safety contact, confirm".</p>
        {review.requestSentAt && <p className="text-sm text-muted-foreground">Last request sent {new Date(review.requestSentAt).toLocaleString()}.</p>}
        <div className="flex flex-wrap gap-2">
          <Button onClick={requestConfirmation} disabled={busy} className="min-h-11 whitespace-normal">{busy ? <LoaderCircle className="animate-spin" /> : <Mail />}{busy ? "Sending…" : "Send confirmation email"}</Button>
          <Button variant="outline" disabled={busy} onClick={() => setReview(null)}>Close</Button>
        </div>
        {confirmMsg && <p role="status" className="text-sm leading-relaxed">{confirmMsg}</p>}
      </div> : <>
      <label className="flex gap-3 items-start text-sm leading-relaxed"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 size-4 shrink-0 accent-primary" />My contact agrees to receive this test.</label>
      <div className="flex flex-wrap gap-2">
        <Button onClick={sendTest} disabled={!consent || busy} className="min-h-11">{busy ? <LoaderCircle className="animate-spin" /> : <Mail />}{busy ? "Sending…" : "Send test now"}</Button>
        <Button variant="outline" disabled={busy} onClick={() => setReview(null)}>Cancel</Button>
      </div>
      </>}
    </div>}
    {error && <p role="alert" className="text-sm text-destructive leading-relaxed">{error}</p>}
    {result && <div role="status" aria-live="polite" className="space-y-2 text-sm border-l-2 border-primary pl-4"><p>{result.email}</p><p>{result.sms}</p></div>}
  </section>;
}
import { useState } from "react";
import { KeyRound, Copy, Check, RefreshCw } from "lucide-react";
import { usePulse } from "@/lib/pulse";

/**
 * Optional "Sync code" — a one-time code the user can save to restore their
 * check-in history and contact on a new device. No account, no email, no password.
 */
export function SyncCodeCard() {
  const p = usePulse();
  const [mode, setMode] = useState<"idle" | "code" | "restore">("idle");
  const [code, setCode] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const c = await p.generateSyncCode();
      setCode(c);
      setMode("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't create a sync code");
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await p.restoreWithCode(input.trim());
      setNotice(`Restored — ${res.restoredCheckins} check-in${res.restoredCheckins === 1 ? "" : "s"} recovered.`);
      setInput("");
      setMode("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't restore from that code");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed — write the code down instead.");
    }
  };

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <KeyRound className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em]">Sync Code</h2>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl p-4">
        <p className="text-sm font-medium">Restore on a new device</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Optional. Create a one-time code, save it somewhere safe, and use it to bring your
          check-in history and emergency contact to a new phone. No account or password needed.
        </p>

        {p.hasSyncCode && mode !== "code" && (
          <p className="text-xs text-primary mt-3">
            A sync code is active on this device.
          </p>
        )}

        {mode === "code" && code && (
          <div className="mt-4 rounded-xl border border-primary/40 bg-primary/5 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Your sync code
            </p>
            <p className="font-mono text-base font-semibold tracking-wider mt-1 break-all">
              {code}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              This is shown once. Store it somewhere safe — anyone with this code can restore your
              data.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={copy}
                className="flex items-center gap-1.5 text-xs font-medium rounded-lg border border-primary/50 text-primary px-3 py-2 hover:bg-primary/10"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy code"}
              </button>
              <button
                onClick={() => {
                  setCode(null);
                  setMode("idle");
                }}
                className="text-xs text-muted-foreground px-3 py-2 hover:text-foreground"
              >
                I've saved it
              </button>
            </div>
          </div>
        )}

        {mode === "restore" && (
          <div className="mt-4">
            <label
              htmlFor="sync-code-input"
              className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              Enter your sync code
            </label>
            <input
              id="sync-code-input"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="PULSE-XXXX-XXXX-XXXX-XXXX"
              autoComplete="off"
              spellCheck={false}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-sm tracking-wider outline-none focus:border-primary"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={restore}
                disabled={busy || input.trim().length < 8}
                className="flex-1 rounded-xl bg-primary text-primary-foreground text-sm font-medium py-2.5 disabled:opacity-50"
              >
                {busy ? "Restoring…" : "Restore my data"}
              </button>
              <button
                onClick={() => {
                  setMode("idle");
                  setError(null);
                }}
                className="text-xs text-muted-foreground px-3 hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {mode === "idle" && (
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={generate}
              disabled={busy}
              className="flex items-center gap-1.5 text-xs font-medium rounded-lg border border-primary/50 text-primary px-3 py-2 hover:bg-primary/10 disabled:opacity-50"
            >
              {p.hasSyncCode ? <RefreshCw className="w-3.5 h-3.5" /> : <KeyRound className="w-3.5 h-3.5" />}
              {busy ? "Working…" : p.hasSyncCode ? "Create new code" : "Create sync code"}
            </button>
            <button
              onClick={() => {
                setMode("restore");
                setNotice(null);
              }}
              className="text-xs font-medium rounded-lg border border-border px-3 py-2 hover:bg-background"
            >
              I have a code
            </button>
            {p.hasSyncCode && (
              <button
                onClick={async () => {
                  setBusy(true);
                  setError(null);
                  try {
                    await p.deleteSyncCode();
                    setNotice("Sync code turned off.");
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Couldn't remove the code");
                  } finally {
                    setBusy(false);
                  }
                }}
                disabled={busy}
                className="text-xs text-destructive px-3 py-2 hover:underline disabled:opacity-50"
              >
                Turn off
              </button>
            )}
          </div>
        )}

        {p.hasSyncCode && mode === "idle" && (
          <p className="text-xs text-muted-foreground mt-3">
            Creating a new code replaces the old one.
          </p>
        )}
        {notice && <p className="text-xs text-primary mt-3">{notice}</p>}
        {error && <p className="text-xs text-destructive mt-3">{error}</p>}
      </div>
    </section>
  );
}

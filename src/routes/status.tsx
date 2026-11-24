import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Activity, RefreshCw } from "lucide-react";
import { getAlertConfiguration } from "@/lib/alert-status.functions";
import { AlertInfoLayout } from "@/components/AlertInfoLayout";
import { TestAlertPanel } from "@/components/TestAlertPanel";
import { Button } from "@/components/ui/button";
import { sweepAgeMinutes } from "@/lib/sweep-status";

const statusOptions = queryOptions({
  queryKey: ["alert-configuration"],
  queryFn: async () => {
    try {
      return { ...await getAlertConfiguration(), reachable: true };
    } catch {
      return { emailConfigured: null, smsConfigured: null, checkedAt: null, reachable: false,
        sweep: { available: false, lastCompletedAt: null, stale: null, externalPing: null }, externalHeartbeatConfigured: null };
    }
  },
  staleTime: 30_000,
  refetchInterval: 60_000,
});
export const Route = createFileRoute("/status")({
  loader: ({ context }) => context.queryClient.ensureQueryData(statusOptions),
  component: StatusPage,
  head: () => ({ meta: [
    { title: "Alert status — Pulse Safety Check-in" },
    { name: "description", content: "See Pulse's last completed hourly alert sweep, stale-sweep warnings, external heartbeat reporting and alert configuration. Delivery is not guaranteed." },
    { property: "og:title", content: "Alert status — Pulse Safety Check-in" },
    { property: "og:description", content: "Live last-sweep age, hourly alert-check health and external heartbeat reporting, without promising inbox delivery." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: "https://pulse-checkin.app/status" }] }),
});

function StatusPage() {
  const query = useSuspenseQuery(statusOptions);
  const [device, setDevice] = useState<{ online: boolean; contact: boolean; recovery: boolean } | null>(null);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState<number | null>(null);
  useEffect(() => {
    setNowMs(Date.now());
    const timer = window.setInterval(() => setNowMs(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    function refreshDevice() {
      let contact = false;
      try { const saved = JSON.parse(localStorage.getItem("pulse:contact") ?? "null") as { email?: string } | null; contact = Boolean(saved?.email); } catch {}
      setDevice({ online: navigator.onLine, contact, recovery: Boolean(localStorage.getItem("pulse:syncToken")) });
    }
    refreshDevice();
    window.addEventListener("online", refreshDevice); window.addEventListener("offline", refreshDevice); window.addEventListener("focus", refreshDevice);
    return () => { window.removeEventListener("online", refreshDevice); window.removeEventListener("offline", refreshDevice); window.removeEventListener("focus", refreshDevice); };
  }, []);
  useEffect(() => { setCheckedAt(query.data.checkedAt ? new Date(query.data.checkedAt).toLocaleString() : null); }, [query.data.checkedAt]);

  const age = nowMs === null ? null : sweepAgeMinutes(query.data.sweep.lastCompletedAt, nowMs);
  const sweepState = !query.data.sweep.available ? "Unable to check" : query.data.sweep.stale ? "Overdue · needs attention" : "Completed recently";
  const externalState = query.data.externalHeartbeatConfigured === null ? "Unable to check" : !query.data.externalHeartbeatConfigured
    ? "Not connected" : query.data.sweep.externalPing === "accepted" ? "Last completion ping accepted"
    : query.data.sweep.externalPing === "failed" || query.data.sweep.externalPing === "invalid_configuration" ? "Last ping failed"
    : "Configured · awaiting completion ping";

  const rows = [
    { title: "Pulse server", value: !query.data.reachable ? "Latest check failed" : "Responded to the last check", note: "This checks Pulse’s response, not inbox delivery or every service." },
    { title: "Email alerts", value: query.data.emailConfigured === null ? "Unable to check" : query.data.emailConfigured ? "Configured · delivery unverified" : "Not configured", note: query.data.emailConfigured === false ? "Email cannot be sent until the email service is configured." : "Use a test to check acceptance and ask your contact to confirm receipt." },
    { title: "SMS alerts", value: query.data.smsConfigured === null ? "Unable to check" : query.data.smsConfigured ? "Configured · delivery unverified" : "Not connected", note: "Texts need a connected SMS service, a saved online phone number and a supported destination." },
    { title: "Hourly alert sweep", value: sweepState, note: "A completion timestamp means the sweep finished, not that every email arrived. More than 150 minutes without a completion is overdue." },
    { title: "External heartbeat", value: externalState, note: "Healthchecks.io receives a ping after each completed sweep when connected. Owner notifications must be enabled there; accepting a ping does not verify paging delivery." },
    { title: "WhatsApp alerts", value: "Not available", note: "No WhatsApp messages are sent." },
  ];
  return <AlertInfoLayout>
    <section className="space-y-5">
      <p className="text-sm font-medium text-primary flex items-center gap-2"><Activity className="size-4" />Pulse Safety Check-in</p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold">Alert status</h1>
      <p className="text-lg text-muted-foreground leading-relaxed">Last sweep: {!query.data.sweep.available ? "unavailable" : !query.data.sweep.lastCompletedAt ? "no completion recorded" : age === null ? "checking time…" : `${age} min ago`}</p>
      {query.data.sweep.lastCompletedAt && <p className="text-sm text-muted-foreground">Completed at <time dateTime={query.data.sweep.lastCompletedAt}>{query.data.sweep.lastCompletedAt.replace("T", " ").replace(/\.\d{3}Z$/, " UTC")}</time></p>}
      <p className="text-sm leading-relaxed">Sweep health refreshes every minute. The existing internal watchdog checks for missing sweeps; independent monitoring also requires a connected external heartbeat and notifications. Inbox delivery, provider uptime and incident history are not verified here.</p>
      {query.data.sweep.stale && <p role="alert" className="text-sm text-destructive">The hourly sweep has no recent completion. Missed-check-in alerts may be delayed or stopped.</p>}
      <div className="flex flex-wrap gap-3 items-center">
        <Button variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching}><RefreshCw className={query.isFetching ? "animate-spin" : ""} />{query.isFetching ? "Checking…" : "Refresh status"}</Button>
        <span className="text-sm text-muted-foreground">Last server response: {checkedAt ?? (query.data.reachable ? "Loading time…" : "Unavailable")}</span>
      </div>
      {!query.data.reachable && <p role="alert" className="text-sm text-destructive">Unable to reach Pulse for the latest check. Email and SMS configuration could not be verified.</p>}
    </section>
    <section aria-labelledby="services-title" className="border-t border-border pt-8">
      <h2 id="services-title" className="font-display text-2xl font-semibold mb-4">Alert services</h2>
      <dl className="divide-y divide-border">{rows.map(row => <div key={row.title} className="py-5 space-y-2"><div className="flex flex-wrap justify-between gap-2"><dt className="font-semibold">{row.title}</dt><dd className="text-sm text-primary font-medium">{row.value}</dd></div><dd className="text-sm text-muted-foreground leading-relaxed">{row.note}</dd></div>)}</dl>
    </section>
    <section className="border-t border-border pt-8 space-y-4">
      <h2 className="font-display text-2xl font-semibold">On this device</h2>
      <dl className="space-y-3 text-sm">
        <div className="flex flex-wrap justify-between gap-2"><dt>Internet connection</dt><dd>{!device ? "Checking…" : device.online ? "Device reports online" : "Offline — check-ins await connection"}</dd></div>
        <div className="flex flex-wrap justify-between gap-2"><dt>Emergency contact</dt><dd>{!device ? "Checking…" : device.contact ? "Saved locally" : "Not saved on this device"}</dd></div>
        <div className="flex flex-wrap justify-between gap-2"><dt>Online safety record access</dt><dd>{!device ? "Checking…" : device.recovery ? "Saved credential · validity unverified" : "No saved credential on this device"}</dd></div>
      </dl>
      <p className="text-sm text-muted-foreground">A stored credential can expire or be revoked. The test button verifies your saved online contact before sending; local setup alone does not prove alerts are ready.</p>
    </section>
    <div className="border-t border-border pt-8"><TestAlertPanel /></div>
  </AlertInfoLayout>;
}
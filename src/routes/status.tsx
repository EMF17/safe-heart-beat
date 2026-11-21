import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Activity, RefreshCw } from "lucide-react";
import { getAlertConfiguration } from "@/lib/alert-status.functions";
import { AlertInfoLayout } from "@/components/AlertInfoLayout";
import { TestAlertPanel } from "@/components/TestAlertPanel";
import { Button } from "@/components/ui/button";

const statusOptions = queryOptions({
  queryKey: ["alert-configuration"],
  queryFn: async () => {
    try {
      return { ...await getAlertConfiguration(), reachable: true };
    } catch {
      return { emailConfigured: null, smsConfigured: null, checkedAt: null, reachable: false };
    }
  },
  staleTime: 30_000,
});
export const Route = createFileRoute("/status")({
  loader: ({ context }) => context.queryClient.ensureQueryData(statusOptions),
  component: StatusPage,
  head: () => ({ meta: [
    { title: "Alert status — Pulse Safety Check-in" },
    { name: "description", content: "Check Pulse server reachability, email and SMS configuration, and your device's alert prerequisites. Configuration is not a delivery guarantee." },
    { property: "og:title", content: "Alert status — Pulse Safety Check-in" },
    { property: "og:description", content: "An honest view of alert setup and limitations. Check connectivity and send a test to your saved contact." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: "https://pulse-checkin.app/status" }] }),
});

function StatusPage() {
  const query = useSuspenseQuery(statusOptions);
  const [device, setDevice] = useState<{ online: boolean; contact: boolean; recovery: boolean } | null>(null);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
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

  const rows = [
    { title: "Pulse server", value: !query.data.reachable ? "Latest check failed" : "Responded to the last check", note: "This checks Pulse’s response, not inbox delivery or every service." },
    { title: "Email alerts", value: query.data.emailConfigured === null ? "Unable to check" : query.data.emailConfigured ? "Configured · delivery unverified" : "Not configured", note: query.data.emailConfigured === false ? "Email cannot be sent until the email service is configured." : "Use a test to check acceptance and ask your contact to confirm receipt." },
    { title: "SMS alerts", value: query.data.smsConfigured === null ? "Unable to check" : query.data.smsConfigured ? "Configured · delivery unverified" : "Not connected", note: "Texts need a connected SMS service, a saved online phone number and a supported destination." },
    { title: "Phone-off monitoring", value: "Not available", note: "Pulse does not independently monitor missed check-ins on a server. Keep the app open and connected." },
    { title: "WhatsApp alerts", value: "Not available", note: "No WhatsApp messages are sent." },
  ];
  return <AlertInfoLayout>
    <section className="space-y-5">
      <p className="text-sm font-medium text-primary flex items-center gap-2"><Activity className="size-4" />Pulse Safety Check-in</p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold">Alert status</h1>
      <p className="text-lg text-muted-foreground leading-relaxed">Configuration and your current device — not a guarantee that an alert will arrive.</p>
      <p className="text-sm leading-relaxed">This is not a continuously monitored uptime page. Email and SMS provider health, inbox delivery and incident history are not monitored here. Alerts still require Pulse open and connected.</p>
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
        <div className="flex flex-wrap justify-between gap-2"><dt>Internet connection</dt><dd>{!device ? "Checking…" : device.online ? "Device reports online" : "Offline — alerts cannot be requested"}</dd></div>
        <div className="flex flex-wrap justify-between gap-2"><dt>Emergency contact</dt><dd>{!device ? "Checking…" : device.contact ? "Saved locally" : "Not saved on this device"}</dd></div>
        <div className="flex flex-wrap justify-between gap-2"><dt>Online recovery</dt><dd>{!device ? "Checking…" : device.recovery ? "Saved credential · validity unverified" : "Not enabled on this device"}</dd></div>
      </dl>
      <p className="text-sm text-muted-foreground">A stored credential can expire or be revoked. The test button verifies your saved online contact before sending; local setup alone does not prove alerts are ready.</p>
    </section>
    <div className="border-t border-border pt-8"><TestAlertPanel /></div>
  </AlertInfoLayout>;
}
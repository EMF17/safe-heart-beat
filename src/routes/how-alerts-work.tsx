import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Mail, Smartphone, ShieldAlert } from "lucide-react";
import { AlertInfoLayout } from "@/components/AlertInfoLayout";
import { TestAlertPanel } from "@/components/TestAlertPanel";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-alerts-work")({
  component: HowAlertsWorkPage,
  head: () => ({
    meta: [
      { title: "How alerts work — Pulse Safety Check-in" },
      { name: "description", content: "Understand Pulse missed-check-in email alerts, online recovery requirements, timing and phone-off limitations. Try a test with your saved contact." },
      { property: "og:title", content: "How alerts work — Pulse Safety Check-in" },
      { property: "og:description", content: "Email alerts require Pulse to be open and connected. See the timing, limitations and test your saved contact's alert setup." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ], links: [{ rel: "canonical", href: "https://pulse-checkin.app/how-alerts-work" }],
  }),
});

function HowAlertsWorkPage() {
  return <AlertInfoLayout>
    <section className="space-y-5">
      <p className="text-sm font-medium text-primary">Pulse Safety Check-in</p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight">How alerts work</h1>
      <p className="text-lg text-muted-foreground leading-relaxed">A check-in records that you are OK. After two missed check-in windows, Pulse can request an email to your trusted contact.</p>
      <div className="border-l-4 border-warning pl-4 space-y-2">
        <h2 className="font-semibold flex gap-2 items-center"><ShieldAlert className="size-5 shrink-0 text-warning" />The important limitation</h2>
        <p className="leading-relaxed">Pulse must be open and connected to the internet to request an alert. There is no independent server monitoring when your phone is off, the app is closed, or you are offline. Delivery is not guaranteed.</p>
        <p className="text-sm text-muted-foreground">Pulse is not an emergency service or your only safety arrangement. Agree on another way to stay in touch. In an emergency, call local emergency services.</p>
      </div>
    </section>
    <section className="space-y-6 border-t border-border pt-8">
      <h2 className="font-display text-2xl font-semibold">From check-in to contact</h2>
      <ol className="space-y-6">
        <li className="flex gap-4"><Smartphone className="size-6 shrink-0 text-primary" /><div><h3 className="font-semibold">1. Save your contact and enable online recovery</h3><p className="mt-2 text-muted-foreground leading-relaxed">Get your contact’s agreement. Save their email, then create a Sync Code or enable a passkey in Settings. Alerts need this online record to securely find the recipient. It stores contact details and check-ins before any alert.</p></div></li>
        <li className="flex gap-4"><Clock className="size-6 shrink-0 text-primary" /><div><h3 className="font-semibold">2. Check in at your chosen interval</h3><p className="mt-2 text-muted-foreground leading-relaxed">Tap “I’m OK” every 24, 48 or 72 hours. Each check-in starts a new window. Check-ins can be saved locally offline; online backup and alerts need a connection.</p></div></li>
        <li className="flex gap-4"><Mail className="size-6 shrink-0 text-primary" /><div><h3 className="font-semibold">3. Two missed windows make an alert eligible</h3><p className="mt-2 text-muted-foreground leading-relaxed">With a valid online recovery record, Pulse requests an email when it checks your overdue status while open and connected. This is not a guaranteed send at the exact deadline. The email asks your contact to call or text you and includes emergency numbers for your selected or inferred region.</p></div></li>
      </ol>
    </section>
    <section className="space-y-4 border-t border-border pt-8">
      <h2 className="font-display text-2xl font-semibold">When an alert becomes eligible</h2>
      <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead><tr className="border-b border-border"><th className="py-3 pr-4">Check-in interval</th><th className="py-3">Two missed windows</th></tr></thead><tbody>{[[24,48],[48,96],[72,144]].map(([interval,threshold]) => <tr key={interval} className="border-b border-border"><td className="py-3 pr-4">Every {interval} hours</td><td className="py-3">{threshold} hours after your last check-in</td></tr>)}</tbody></table></div>
      <p className="text-sm text-muted-foreground">Vacation / Pause stops missed-check-in alerts while active. Reminder notifications are for you; they are not alerts to your contact.</p>
    </section>
    <section className="space-y-4 border-t border-border pt-8">
      <h2 className="font-display text-2xl font-semibold">What this does not prove</h2>
      <p className="text-muted-foreground leading-relaxed">An email service accepting a message does not mean it reached the inbox or that your contact read it. Spam filtering, incorrect addresses, outages and a contact being unavailable can all prevent a response. A successful test today does not guarantee a future alert.</p>
      <p className="text-muted-foreground leading-relaxed">SMS is optional and requires a connected Twilio service, a supported destination and a saved phone number. WhatsApp alerts are not available. Pulse never automatically calls emergency services.</p>
      <Button asChild variant="outline"><Link to="/status">Check alert status</Link></Button>
    </section>
    <div id="test-alert" className="border-t border-border pt-8 scroll-mt-6"><TestAlertPanel /></div>
  </AlertInfoLayout>;
}
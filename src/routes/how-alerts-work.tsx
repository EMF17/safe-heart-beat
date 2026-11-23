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
      { property: "og:description", content: "Pulse's server checks hourly for missed check-ins and emails your contact, even if your phone is off. See the timing and limits." },
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
      <p className="text-lg text-muted-foreground leading-relaxed">A check-in records that you are OK. After two missed check-in windows, Pulse's server emails your trusted contact.</p>
      <div className="border-l-4 border-warning pl-4 space-y-2">
        <h2 className="font-semibold flex gap-2 items-center"><ShieldAlert className="size-5 shrink-0 text-warning" />What to know</h2>
        <p className="leading-relaxed">Our server checks every hour for missed check-ins and sends the alert itself, so it works when your phone is off, Pulse is closed, or you can't respond. A check-in tapped while offline only reaches the server once your phone reconnects. Email delivery can't be guaranteed.</p>
        <p className="text-sm text-muted-foreground">Pulse is not an emergency service or your only safety arrangement. Agree on another way to stay in touch. In an emergency, call local emergency services.</p>
      </div>
    </section>
    <section className="space-y-6 border-t border-border pt-8">
      <h2 className="font-display text-2xl font-semibold">From check-in to contact</h2>
      <ol className="space-y-6">
        <li className="flex gap-4"><Smartphone className="size-6 shrink-0 text-primary" /><div><h3 className="font-semibold">1. Save your contact</h3><p className="mt-2 text-muted-foreground leading-relaxed">Get your contact’s agreement, then save their email. Pulse creates an online record under a random ID with your contact details, check-ins, interval and pause dates, so the server can alert them.</p></div></li>
        <li className="flex gap-4"><Clock className="size-6 shrink-0 text-primary" /><div><h3 className="font-semibold">2. Check in at your chosen interval</h3><p className="mt-2 text-muted-foreground leading-relaxed">Tap “I’m OK” every 24, 48 or 72 hours. Each check-in starts a new window. A check-in tapped offline is saved on your phone and sent to the server when you reconnect.</p></div></li>
        <li className="flex gap-4"><Mail className="size-6 shrink-0 text-primary" /><div><h3 className="font-semibold">3. Two missed windows make an alert eligible</h3><p className="mt-2 text-muted-foreground leading-relaxed">Our server checks every hour. Once two windows have passed with no check-in and you aren't paused, it sends the email, usually within an hour of the deadline. The email asks your contact to call or text you and includes emergency numbers for your selected or inferred region.</p></div></li>
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
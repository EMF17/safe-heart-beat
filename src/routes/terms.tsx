import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service — Pulse" },
      { name: "description", content: "Pulse terms of service: Pulse is not an emergency service and alert delivery is not guaranteed." },
      { property: "og:title", content: "Terms of Service — Pulse" },
      { property: "og:description", content: "The rules for using Pulse, including why alert delivery can't be guaranteed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. What Pulse is",
    body: [
      "Pulse is a free check-in tool. If you don't check in within your chosen interval, Pulse's server tries to email the emergency contact you named, after that contact has confirmed they agree to receive alerts.",
      "By using Pulse you agree to these terms. If you don't agree, please don't use Pulse.",
    ],
  },
  {
    title: "2. Pulse is not an emergency service",
    body: [
      "Pulse does not contact police, ambulance, fire or any emergency service, and nobody monitors alerts. In an emergency, call your local emergency number.",
      "Pulse must not be your only safety measure, especially if you have a medical condition or a high risk of falls or sudden illness.",
    ],
  },
  {
    title: "3. No guarantee of delivery or timing",
    body: [
      "We do not guarantee that any alert, reminder, confirmation or test message will be sent, delivered, read or acted on, or that it will arrive at any particular time.",
      "Alerts can be delayed or lost for many reasons, including: the server checks only about once an hour; outages at Pulse, our hosting, or our email provider; messages going to spam or being bounced or blocked; a wrong, changed or unconfirmed contact address; your contact unsubscribing; sending limits; your device clock, network, or settings; check-ins that never reach the server; and paused or vacation periods.",
      "Your contact may also receive an alert when you are fine (for example, if you forget to check in).",
      "Pulse is provided \"as is\" and \"as available\", without warranties of any kind, to the fullest extent the law allows.",
    ],
  },
  {
    title: "4. Your responsibilities",
    body: [
      "Only name a contact who knows you and agrees to receive alerts. Keep their details up to date and use \"Send test alert\" to check delivery.",
      "Keep your sync codes private. Anyone with a valid code can access your Pulse record until it expires.",
      "Don't use Pulse to send unwanted email to anyone, to harass anyone, or to interfere with the service.",
    ],
  },
  {
    title: "5. AI safety checklist",
    body: [
      "The checklist is optional. It is only created after you tick the consent box, and your description is sent to a third-party AI provider as explained in the Privacy Policy.",
      "Suggestions are general information, may be wrong or incomplete, and are not medical, legal or professional advice.",
    ],
  },
  {
    title: "6. Limitation of liability",
    body: [
      "To the fullest extent the law allows, Pulse and its operator are not liable for any loss, injury, death or damage arising from an alert not being sent, delivered or acted on, or from a false alert, or from using or being unable to use Pulse.",
      "Nothing in these terms limits liability that cannot legally be limited, or removes rights you have as a consumer under the law where you live.",
    ],
  },
  {
    title: "7. Changes and ending",
    body: [
      "We may change or stop Pulse, or update these terms. We'll update the date on this page when we do. You can stop using Pulse at any time.",
    ],
  },
  {
    title: "8. Contact",
    body: ["Questions: pulse.safety.fin@gmail.com"],
  },
];

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-lg mx-auto px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="font-display text-3xl font-semibold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: November 23, 2026</p>
        {sections.map((s) => (
          <section key={s.title} className="mb-8">
            <h2 className="text-lg font-bold mb-3">{s.title}</h2>
            {s.body.map((p) => (
              <p key={p} className="text-sm text-muted-foreground leading-relaxed mb-3">{p}</p>
            ))}
          </section>
        ))}
        <p className="text-sm text-muted-foreground">
          See also the <Link to="/privacy-policy" className="underline">Privacy Policy</Link> and{" "}
          <Link to="/how-alerts-work" className="underline">How alerts work</Link>.
        </p>
      </div>
    </div>
  );
}

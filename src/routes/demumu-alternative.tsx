import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { CompetitorComparison } from "@/components/CompetitorComparison";

const URL = "https://pulse-checkin.app/demumu-alternative";
const TITLE = "Free Demumu Alternative — Pulse Safety Check-in";
const DESC =
  "Looking for a free alternative to Demumu (\"Are You Dead?\")? Pulse Safety Check-in needs no account, never tracks your location, and works in any browser.";

export const Route = createFileRoute("/demumu-alternative")({
  component: Page,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:type", content: "article" }, { property: "og:image", content: "https://pulse-checkin.app/og-image.png" }, { name: "twitter:image", content: "https://pulse-checkin.app/og-image.png" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
});

function Page() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="font-display font-semibold tracking-tight">
            Pulse Safety Check-in
          </Link>
          <Link to="/app" className="inline-flex items-center gap-1 h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
            Try it free <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-16 space-y-10">
        <section>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            A free Demumu alternative for people who live alone
          </h1>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Looking at check-in services for living alone? Pulse Safety Check-in is free,
            works in a browser, and requires no sign-up or GPS tracking. The comparison below
            separates verified published information from older reporting about Demumu;
            the services should not be assumed to offer equivalent protection.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold">How Pulse works</h2>
          <ol className="mt-4 space-y-2 text-muted-foreground list-decimal pl-5">
            <li>Add one trusted contact — just a name and an email.</li>
            <li>Tap "I'm Safe" every 24, 48 or 72 hours.</li>
            <li>Miss two check-ins in a row and your contact gets one calm email with your local emergency number.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold">Pulse vs Demumu</h2>
          <CompetitorComparison includeSnug={false} />
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold">Private by design</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            No sign-up, no ads, no location. Only your contact's email and your latest check-in
            time are kept, so an alert can still go out if your phone is off.{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">Read the privacy policy</Link>.
          </p>
        </section>

        <div className="text-center pt-4">
          <Link to="/app" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-medium">
            Set up my safety net <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}

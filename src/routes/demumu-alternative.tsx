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
            works in a browser, and requires no sign-up or GPS tracking. We haven’t independently
            tested Demumu, so we don’t compare its current features. Below is what Pulse offers
            and how its published features compare with Snug.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold">How Pulse works</h2>
          <ol className="mt-4 space-y-2 text-muted-foreground list-decimal pl-5">
            <li>Add one trusted contact and ask them to confirm by email.</li>
            <li>Tap “I’m OK” every 24, 48 or 72 hours.</li>
            <li>Miss two check-ins in a row and Pulse emails your confirmed contact, asking them to check on you.</li>
          </ol>
          <p className="mt-4 text-sm text-muted-foreground">Pulse checks hourly, even when your phone is off. Email delivery is not guaranteed. Pulse is not an emergency service or your only safety arrangement.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold">Pulse and Snug</h2>
          <CompetitorComparison />
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold">Private by design</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            No sign-up, no ads, no GPS tracking. Saving a contact creates an online safety record
            containing contact details, check-ins and alert settings so alerts can run when your phone is off.
            Recovery on another device is optional.{" "}
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

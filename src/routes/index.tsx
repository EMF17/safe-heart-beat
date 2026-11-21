import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Hand,
  Mail,
  ShieldCheck,
  ChevronRight,
  Clock,
  Plane,
  Bell,
  Globe2,
  Lock,
  HeartPulse,
  Smartphone,
} from "lucide-react";
import { HomeTourDemo } from "@/components/HomeTourDemo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Pulse Safety Check-in — Free safety app for people who live alone" },
      {
        name: "description",
        content:
          "A free safety check-in for people living alone. Email alerts require Pulse to be open and connected; delivery is not guaranteed. No account or cookies.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Pulse Safety Check-in — Free safety app for people who live alone" },
      {
        property: "og:description",
        content:
          "One tap records your check-in. Missed-check-in email alerts require Pulse to be open and connected; delivery is not guaranteed.",
      },
      { property: "og:url", content: "https://pulse-checkin.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://pulse-checkin.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Pulse Safety Check-in",
          applicationCategory: "HealthApplication",
          operatingSystem: "Web",
          url: "https://pulse-checkin.app/",
          description:
            "A privacy-first safety check-in for people who live alone. Email alerts after two missed windows require the app to be open and connected; delivery is not guaranteed.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
});

function LandingPage() {
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReturning(window.localStorage.getItem("pulse:onboardingCompleted") === "true");
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader returning={returning} />
      <main>
        <Hero returning={returning} />
        <HowItWorks />
        <Features />
        <Comparison />
        <PrivacySection />
        <Faq />
        <ClosingCta returning={returning} />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader({ returning }: { returning: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="relative inline-flex">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-40 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <span className="font-display font-semibold tracking-tight">Pulse</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/emergency-numbers"
            className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-full transition"
          >
            Emergency numbers
          </Link>
          <Link
            to="/privacy-policy"
            className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-full transition"
          >
            Privacy
          </Link>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-[var(--shadow-soft)] hover:bg-primary/90 active:scale-[0.98] transition"
          >
            {returning ? "Open Pulse" : "Get started"}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero({ returning }: { returning: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <HeartPulse className="w-3.5 h-3.5 text-primary" />
          Free · No account · Local check-ins work offline
        </span>

        <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight max-w-3xl mx-auto">
          Pulse Safety Check-in
          <span className="block text-primary">for people living alone.</span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Pulse is a two-second check-in for people who live alone. Tap “I’m
          OK” every 48 hours. After two missed windows, Pulse can request an email
          to the person you trust.
        </p>

        <p className="mt-5 text-base text-foreground max-w-xl mx-auto leading-relaxed">
          <strong>Important:</strong> Pulse must be open and connected to the internet
          to request an alert. If your phone is off, Pulse is closed, or there is no
          connection, alerts are not guaranteed. Do not rely on Pulse as your only
          safety arrangement; it is not an emergency service.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button asChild variant="link"><Link to="/how-alerts-work">How alerts work</Link></Button>
          <Button asChild variant="link"><Link to="/status">Alert status</Link></Button>
          <Button asChild variant="outline"><Link to="/how-alerts-work" hash="test-alert"><Mail />Test an alert</Link></Button>
        </div>

        <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            to="/app"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-13 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-medium shadow-[var(--shadow-pulse)] hover:bg-primary/90 active:scale-[0.98] transition"
          >
            {returning ? "Open my check-in" : "Set up my safety net"}
            <ChevronRight className="w-4 h-4" />
          </Link>
          <a
            href="#try-it"
            className="w-full sm:w-auto inline-flex items-center justify-center h-13 px-8 py-3.5 rounded-full border border-border/70 bg-card/60 font-medium hover:bg-card transition"
          >
            See how it works
          </a>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          Takes about 60 seconds to set up. Visits counted without cookies. Online recovery
          stores a backup; alert emails share only the details needed.
        </p>

        <HomeTourDemo />
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Add one trusted contact",
      body: "A friend, sibling, neighbour or parent. Just a name and an email — that is the whole setup.",
    },
    {
      icon: <Hand className="w-5 h-5" />,
      title: "Tap once every 48 hours",
      body: "One button says you're fine. Pick a 24, 48 or 72 hour rhythm to match how you actually live.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "An email after missed check-ins",
      body: "After two missed windows, Pulse can request an email with your local emergency number. The app must be open and connected; delivery is not guaranteed.",
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-border/50 bg-card/40">
      <div className="max-w-5xl mx-auto px-5 py-20 md:py-24">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            Three steps to your check-in routine.
          </h2>
          <p className="mt-4 text-muted-foreground">
            No feeds, no pressure, no guilt — just a simple check-in routine.
            Keep Pulse open and connected for missed-check-in alert requests.
          </p>
        </div>

        <ol className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)]"
            >
              <span className="absolute -top-3 left-6 inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {i + 1}
              </span>
              <div className="mt-2 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                {step.icon}
              </div>
              <h3 className="mt-4 font-medium">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Your own rhythm",
      body: "Choose a 24, 48 or 72 hour window depending on how often you're in touch with people.",
    },
    {
      icon: <Plane className="w-5 h-5" />,
      title: "Vacation mode",
      body: "Heading somewhere without signal? Pause check-ins for a day, three days or a week.",
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: "Gentle reminders",
      body: "A notification 12 hours and 4 hours before your window closes. Never a nag.",
    },
    {
      icon: <Globe2 className="w-5 h-5" />,
      title: "Worldwide emergency numbers",
      body: "Searchable numbers for 167 countries, stored offline and included in every alert email.",
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: "Private by default",
      body: "No sign-up, no ads, no cookies. Check-ins stay on your device unless you enable online recovery.",
    },
    {
      icon: <HeartPulse className="w-5 h-5" />,
      title: "Check-in history",
      body: "See every check-in you've made, so you can spot your own patterns at a glance.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "AI safety checklist",
      body: "Send your living situation and region to Lovable AI for a personal preparedness checklist. The finished list is saved on your device.",
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: "Move to a new phone",
      body: "An online backup lets a sync code or QR scan restore your contact and history — no account, and codes can expire.",
    },
  ];

  return (
    <section className="max-w-5xl mx-auto px-5 py-20 md:py-24">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          Built for real life, not perfect habits
        </h2>
        <p className="mt-4 text-muted-foreground">
          Life gets busy, plans change, you travel. Pulse bends around all of it.
        </p>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-3xl border border-border/60 bg-card/70 p-6 hover:bg-card hover:shadow-[var(--shadow-soft)] transition"
          >
            <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
              {f.icon}
            </div>
            <h3 className="mt-4 font-medium">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Comparison() {
  const rows: [string, string, string, string][] = [
    ["Price", "Free", "Paid", "Free basic plan, paid extras"],
    ["Account needed", "No", "No", "Yes (phone number)"],
    ["Uses your location", "Never", "No", "Yes"],
    ["Works in a browser", "Yes, any device", "App only", "App only"],
    ["Choose 24/48/72h rhythm", "Yes", "Limited", "Daily"],
    ["Local emergency numbers in alert", "Yes, 167 countries", "No", "No"],
  ];
  return (
    <section className="max-w-4xl mx-auto px-5 py-20 md:py-24">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          How Pulse compares
        </h2>
        <p className="mt-4 text-muted-foreground">
          A free alternative to Demumu ("Are You Dead?") and Snug — without an account or location tracking.
        </p>
      </div>
      <div className="mt-10 overflow-x-auto rounded-3xl border border-border/60 bg-card">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left">
              <th className="px-2.5 py-3 sm:p-4 font-medium"></th>
              <th className="px-2.5 py-3 sm:p-4 font-semibold text-primary">Pulse</th>
              <th className="px-2.5 py-3 sm:p-4 font-medium">Demumu</th>
              <th className="px-2.5 py-3 sm:p-4 font-medium">Snug</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]} className="border-b border-border/40 last:border-0">
                <td className="px-2.5 py-3 sm:p-4 text-muted-foreground">{r[0]}</td>
                <td className="px-2.5 py-3 sm:p-4 font-medium">{r[1]}</td>
                <td className="px-2.5 py-3 sm:p-4 text-muted-foreground">{r[2]}</td>
                <td className="px-2.5 py-3 sm:p-4 text-muted-foreground">{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground text-center">
        Based on public information as of October 2026. Other apps may change.
      </p>
    </section>
  );
}

const FAQS = [
  {
    q: "When is my emergency contact emailed?",
    a: "Pulse can request an email after you miss two check-in windows in a row, but only while the app is open and connected to the internet. With a 48-hour rhythm that's 96 hours; with 24 hours it's 48 hours; with 72 hours it's 144 hours. Pausing stops alerts completely. Email delivery is not guaranteed.",
  },
  {
    q: "Will alerts work if my phone is off or Pulse is closed?",
    a: "Alerts are not guaranteed in those situations. Pulse currently relies on the app being open and connected to request an alert; it does not independently monitor missed check-ins on a server. Do not use Pulse as your only safety arrangement. In an emergency, contact local emergency services directly.",
  },
  {
    q: "Do I need an account?",
    a: "No sign-up or password is required. Saving a contact stores it on your device. Enabling a Sync Code or passkey creates an online backup used for recovery and alerts. The current app must be open and connected to request an alert; it cannot guarantee alerts while your phone is off.",
  },
  {
    q: "What if I get a new phone?",
    a: "Create a sync code in Settings, then type it or scan its QR code on the new device to bring your contact and history across. You can make the code expire automatically.",
  },
  {
    q: "Does Pulse track my location?",
    a: "Never. Your region is guessed from your device's language and time zone so alerts include the right emergency numbers.",
  },
  {
    q: "Is it really free?",
    a: "Yes. No ads, no subscription.",
  },
  {
    q: "Does it call emergency services?",
    a: "No. Pulse can request an email to the person you choose, with local emergency numbers so they know who to call. The app must be open and connected; delivery is not guaranteed.",
  },
];

function Faq() {
  return (
    <section className="border-t border-border/50 bg-card/40">
      <div className="max-w-3xl mx-auto px-5 py-20 md:py-24">
        <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-center">
          Questions people ask
        </h2>
        <div className="mt-10 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border/60 bg-card p-5">
              <summary className="cursor-pointer list-none font-medium flex items-center justify-between gap-3">
                {f.q}
                <ChevronRight className="w-4 h-4 shrink-0 transition group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrivacySection() {
  return (
    <section className="border-y border-border/50 bg-card/40">
      <div className="max-w-3xl mx-auto px-5 py-20 md:py-24 text-center">
        <div className="inline-flex w-12 h-12 rounded-full bg-primary/10 text-primary items-center justify-center">
          <Lock className="w-5 h-5" />
        </div>
        <h2 className="mt-5 font-display text-3xl md:text-4xl font-semibold tracking-tight">
          A safety app shouldn’t watch you
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Pulse counts visits without cookies or identifying you, and does not use GPS or read your address
          book. Contact details and check-ins are stored on your device. If you
          enable a Sync Code or passkey, your contact details, optional name and
          up to 500 check-ins are also stored online under a random record ID,
          before any alert. Alert emails pass the recipient and message to
          Resend. The optional checklist sends your description and region to
          Lovable AI. QR scanning stays on your device; no camera images are saved.
        </p>
        <Link
          to="/privacy-policy"
          className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Read the privacy policy
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

function ClosingCta({ returning }: { returning: boolean }) {
  return (
    <section className="max-w-3xl mx-auto px-5 py-20 md:py-28 text-center">
      <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
        Set it up today. Hope you never need it.
      </h2>
      <p className="mt-4 text-muted-foreground">
        One contact, one button, one minute of setup.
      </p>
      <Link
        to="/app"
        className="mt-9 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-medium shadow-[var(--shadow-pulse)] hover:bg-primary/90 active:scale-[0.98] transition"
      >
        {returning ? "Open my check-in" : "Set up my safety net"}
        <ChevronRight className="w-4 h-4" />
      </Link>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/50">
      <div className="max-w-5xl mx-auto px-5 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Pulse · Your quiet safety net</p>
        <nav className="flex flex-wrap items-center justify-center gap-5">
          <Link to="/how-alerts-work" className="hover:text-foreground">How alerts work</Link>
          <Link to="/status" className="hover:text-foreground">Alert status</Link>
          <Link to="/app" className="hover:text-foreground transition">
            Open app
          </Link>
          <Link to="/demumu-alternative" className="hover:text-foreground transition">
            Demumu alternative
          </Link>
          <Link to="/zh-hk" className="hover:text-foreground transition">
            中文
          </Link>
          <Link to="/emergency-numbers" className="hover:text-foreground transition">
            Emergency numbers
          </Link>
          <Link to="/privacy-policy" className="hover:text-foreground transition">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}

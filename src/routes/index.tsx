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

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Pulse — A quiet safety net for people who live alone" },
      {
        name: "description",
        content:
          "Tap one button every 48 hours. If you ever miss two check-ins, Pulse emails your emergency contact. No accounts, no tracking, free to use.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Pulse — A quiet safety net for people who live alone" },
      {
        property: "og:description",
        content:
          "One tap says 'I'm safe.' Miss two check-ins and your trusted contact gets an email with local emergency numbers. Private by design.",
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
          name: "Pulse",
          applicationCategory: "HealthApplication",
          operatingSystem: "Web",
          url: "https://pulse-checkin.app/",
          description:
            "A privacy-first safety check-in for people who live alone. One tap every 48 hours; a missed window emails your emergency contact.",
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
          Free · No account · Works offline
        </span>

        <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight max-w-3xl mx-auto">
          If something happened to you,
          <span className="block text-primary">someone would know.</span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Pulse is a two-second check-in for people who live alone. Tap “I’m
          Safe” every 48 hours. Miss two windows in a row, and we quietly email
          the person you trust.
        </p>

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
          Takes about 60 seconds to set up. Nothing leaves your device unless an
          alert is needed.
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
      title: "We only reach out if needed",
      body: "Miss two windows in a row and your contact gets a single calm email with your local emergency number.",
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-border/50 bg-card/40">
      <div className="max-w-5xl mx-auto px-5 py-20 md:py-24">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            Three steps. Then you forget about it.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pulse is designed to be boring on purpose. No feeds, no streaks, no
            guilt — just a quiet promise running in the background.
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
      body: "No sign-up, no ads, no analytics profile. Only what's needed to send an alert leaves your device.",
    },
    {
      icon: <HeartPulse className="w-5 h-5" />,
      title: "Check-in history",
      body: "See every check-in you've made, so you can spot your own patterns at a glance.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "AI safety checklist",
      body: "Describe how you live and get a personal preparedness checklist, saved only on your device.",
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: "Move to a new phone",
      body: "A sync code or QR scan brings your contact and history across — no account, and codes can expire.",
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left">
              <th className="p-4 font-medium"></th>
              <th className="p-4 font-semibold text-primary">Pulse</th>
              <th className="p-4 font-medium">Demumu</th>
              <th className="p-4 font-medium">Snug</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]} className="border-b border-border/40 last:border-0">
                <td className="p-4 text-muted-foreground">{r[0]}</td>
                <td className="p-4 font-medium">{r[1]}</td>
                <td className="p-4 text-muted-foreground">{r[2]}</td>
                <td className="p-4 text-muted-foreground">{r[3]}</td>
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
    a: "Only after you miss two check-in windows in a row. With a 48-hour rhythm that's 96 hours; with 24 hours it's 48 hours; with 72 hours it's 144 hours. Pausing stops alerts completely.",
  },
  {
    q: "Do I need an account?",
    a: "No. There's no sign-up, email or password. Pulse creates an anonymous record so alerts can still go out if your phone is off.",
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
    a: "No. Pulse emails the person you choose, with local emergency numbers so they know who to call.",
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
          Pulse never asks for your location or contacts, and there is no
          account to create and nothing to sell. We keep only what's needed to
          send an alert — your contact's email and your latest check-in time —
          under a random ID. The camera is used only if you choose to scan a
          sync QR code, and nothing is recorded.
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
        <nav className="flex items-center gap-5">
          <Link to="/app" className="hover:text-foreground transition">
            Open app
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
